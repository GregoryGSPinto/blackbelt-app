'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import type { InAppNotification, InAppNotificationType } from '@/lib/types/notification';
import {
  listNotifications,
  markAsRead,
  markAllRead,
  dismiss,
} from '@/lib/api/in-app-notification.service';
import { Card } from '@/components/ui/Card';
import { BellIcon, XIcon } from '@/components/shell/icons';

// ── Helpers ─────────────────────────────────────────────────

const TYPE_LABELS: Record<InAppNotificationType, string> = {
  alert: 'Alerta',
  info: 'Informação',
  success: 'Sucesso',
  warning: 'Aviso',
  billing: 'Financeiro',
};

const ALL_TYPES: InAppNotificationType[] = ['alert', 'info', 'success', 'warning', 'billing'];

function getTypeColor(type: InAppNotificationType): string {
  switch (type) {
    case 'alert': return 'var(--bb-error)';
    case 'success': return 'var(--bb-success)';
    case 'warning': return 'var(--bb-warning)';
    case 'billing': return 'var(--bb-info)';
    case 'info':
    default: return 'var(--bb-ink-60)';
  }
}

function getTypeSurface(type: InAppNotificationType): string {
  switch (type) {
    case 'alert': return 'rgba(239, 68, 68, 0.12)';
    case 'success': return 'var(--bb-success-surface)';
    case 'warning': return 'var(--bb-warning-surface)';
    case 'billing': return 'var(--bb-info-surface)';
    case 'info':
    default: return 'var(--bb-depth-4)';
  }
}

function getTypeIcon(type: InAppNotificationType): React.ReactNode {
  switch (type) {
    case 'alert':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'billing':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Skeleton ────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-4">
            <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/5 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────

export default function NotificacoesPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<InAppNotificationType | 'all'>('all');

  const userId = profile?.id ?? '';

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const data = await listNotifications(userId);
      setNotifications(data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkAsRead(id: string) {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      // fail silently
    }
  }

  async function handleMarkAllRead() {
    if (!userId) return;
    try {
      await markAllRead(userId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true })),
      );
    } catch {
      // fail silently
    }
  }

  async function handleDismiss(id: string) {
    try {
      await dismiss(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // fail silently
    }
  }

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 p-4 md:p-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Notificações
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas lidas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="self-start rounded-[var(--bb-radius-sm)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand)' }}
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className="rounded-[var(--bb-radius-full)] px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background:
              activeFilter === 'all'
                ? 'var(--bb-brand)'
                : 'var(--bb-depth-4)',
            color:
              activeFilter === 'all' ? 'white' : 'var(--bb-ink-80)',
            border: '1px solid',
            borderColor:
              activeFilter === 'all'
                ? 'var(--bb-brand)'
                : 'var(--bb-glass-border)',
          }}
        >
          Todas ({notifications.length})
        </button>
        {ALL_TYPES.map((type) => {
          const count = notifications.filter((n) => n.type === type).length;
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className="rounded-[var(--bb-radius-full)] px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: isActive
                  ? getTypeColor(type)
                  : 'var(--bb-depth-4)',
                color: isActive ? 'white' : 'var(--bb-ink-80)',
                border: '1px solid',
                borderColor: isActive
                  ? getTypeColor(type)
                  : 'var(--bb-glass-border)',
              }}
            >
              {TYPE_LABELS[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <PageSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <BellIcon
            className="mx-auto mb-3 h-12 w-12"
            style={{ color: 'var(--bb-ink-40)' }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {activeFilter === 'all'
              ? 'Nenhuma notificação'
              : `Nenhuma notificação do tipo "${TYPE_LABELS[activeFilter]}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-stagger>
          {filtered.map((notif) => (
            <Card
              key={notif.id}
              className="p-4 transition-all"
              style={{
                background: notif.is_read
                  ? 'var(--bb-depth-3)'
                  : 'var(--bb-brand-surface)',
                borderColor: notif.is_read
                  ? 'var(--bb-glass-border)'
                  : 'var(--bb-brand)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Type icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: getTypeSurface(notif.type),
                    color: getTypeColor(notif.type),
                  }}
                >
                  {getTypeIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-semibold"
                          style={{ color: 'var(--bb-ink-100)' }}
                        >
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: 'var(--bb-brand)' }}
                          />
                        )}
                      </div>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        {notif.message}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {formatDateTime(notif.created_at)}
                        </span>
                        <span
                          className="rounded-[var(--bb-radius-full)] px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: getTypeSurface(notif.type),
                            color: getTypeColor(notif.type),
                          }}
                        >
                          {TYPE_LABELS[notif.type]}
                        </span>
                        {notif.action_url && (
                          <Link
                            href={notif.action_url}
                            className="text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ color: 'var(--bb-brand)' }}
                          >
                            Ver detalhes &rarr;
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="rounded-[var(--bb-radius-sm)] p-1.5 transition-colors"
                          style={{ color: 'var(--bb-ink-40)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--bb-brand)';
                            e.currentTarget.style.background = 'var(--bb-brand-surface)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--bb-ink-40)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Marcar como lida"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="rounded-[var(--bb-radius-sm)] p-1.5 transition-colors"
                        style={{ color: 'var(--bb-ink-40)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                          e.currentTarget.style.background = 'var(--bb-depth-4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-40)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Dispensar"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
