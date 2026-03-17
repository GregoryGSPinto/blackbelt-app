'use client';

import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export type PushEventType =
  | 'class_reminder'
  | 'payment_due'
  | 'new_announcement'
  | 'graduation_approved'
  | 'absence_alert'
  | 'new_message';

export interface PushPreferences {
  enabled: boolean;
  classReminder: boolean;
  paymentDue: boolean;
  newAnnouncement: boolean;
  graduationApproved: boolean;
  absenceAlert: boolean;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  eventType: PushEventType;
}

const DEFAULT_PREFERENCES: PushPreferences = {
  enabled: true,
  classReminder: true,
  paymentDue: true,
  newAnnouncement: true,
  graduationApproved: true,
  absenceAlert: true,
};

// ── Permission ────────────────────────────────────────────────

export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (isMock()) {
    logger.debug('[MOCK] Push notification permission requested');
    return 'granted';
  }
  return Notification.requestPermission();
}

export function getPushPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// ── Subscription ──────────────────────────────────────────────

export async function subscribeToPush(): Promise<boolean> {
  if (isMock()) {
    logger.debug('[MOCK] Subscribed to push notifications');
    return true;
  }

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (!registration) return false;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (isMock()) {
    logger.debug('[MOCK] Unsubscribed from push notifications');
    return true;
  }

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
    return true;
  } catch {
    return false;
  }
}

// ── Preferences ───────────────────────────────────────────────

export function getPushPreferences(): PushPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem('bb_push_prefs');
    if (stored) return JSON.parse(stored) as PushPreferences;
  } catch { /* ignore */ }
  return DEFAULT_PREFERENCES;
}

export function savePushPreferences(prefs: PushPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bb_push_prefs', JSON.stringify(prefs));
}

// ── Local notification (mock/fallback) ────────────────────────

export function showLocalNotification(payload: PushPayload): void {
  if (typeof window === 'undefined') return;

  if (isMock()) {
    logger.debug(`[MOCK] Push notification: ${payload.title} — ${payload.body}`);
    return;
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    const notif = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: payload.tag || payload.eventType,
    });

    if (payload.url) {
      notif.onclick = () => {
        window.focus();
        window.location.href = payload.url!;
      };
    }
  }
}

// ── Template helpers ──────────────────────────────────────────

export function buildClassReminderPayload(className: string, time: string): PushPayload {
  return {
    title: 'Lembrete de Aula',
    body: `${className} começa em 1 hora (${time})`,
    eventType: 'class_reminder',
    url: '/turma-ativa',
  };
}

export function buildPaymentDuePayload(dueDate: string, amount: number): PushPayload {
  return {
    title: 'Mensalidade Vencendo',
    body: `Sua mensalidade de R$${amount.toFixed(2)} vence em ${dueDate}`,
    eventType: 'payment_due',
    url: '/financeiro',
  };
}

export function buildAnnouncementPayload(title: string): PushPayload {
  return {
    title: 'Novo Comunicado',
    body: title,
    eventType: 'new_announcement',
    url: '/comunicados',
  };
}

export function buildGraduationPayload(beltName: string): PushPayload {
  return {
    title: 'Graduação Aprovada!',
    body: `Parabéns! Sua graduação para faixa ${beltName} foi aprovada!`,
    eventType: 'graduation_approved',
    url: '/graduacoes',
  };
}
