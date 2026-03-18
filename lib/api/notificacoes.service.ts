import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type NotificationType = 'nova_mensagem' | 'aula_em_breve' | 'promocao_faixa' | 'conquista' | 'pagamento_vencido' | 'avaliacao_recebida';

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export interface NotificationPrefs {
  push_enabled: boolean;
  email_enabled: boolean;
  types: Record<NotificationType, boolean>;
}

export async function listNotifications(userId: string): Promise<NotificationDTO[]> {
  try {
    if (isMock()) {
      const { mockListNotifications } = await import('@/lib/mocks/notificacoes.mock');
      return mockListNotifications(userId);
    }
    try {
      const res = await fetch(`/api/notificacoes?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'notificacoes.list');
      return res.json();
    } catch {
      console.warn('[notificacoes.listNotifications] API not available, using mock fallback');
      const { mockListNotifications } = await import('@/lib/mocks/notificacoes.mock');
      return mockListNotifications(userId);
    }
  } catch (error) {
    handleServiceError(error, 'notificacoes.list');
  }
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkRead } = await import('@/lib/mocks/notificacoes.mock');
      return mockMarkRead(ids);
    }
    try {
      await fetch('/api/notificacoes/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch {
      console.warn('[notificacoes.markNotificationsRead] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'notificacoes.markRead');
  }
}

export async function markAllRead(): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAllRead } = await import('@/lib/mocks/notificacoes.mock');
      return mockMarkAllRead();
    }
    try {
      await fetch('/api/notificacoes/read-all', { method: 'POST' });
    } catch {
      console.warn('[notificacoes.markAllRead] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'notificacoes.markAllRead');
  }
}

export async function getPreferences(userId: string): Promise<NotificationPrefs> {
  try {
    if (isMock()) {
      const { mockGetPreferences } = await import('@/lib/mocks/notificacoes.mock');
      return mockGetPreferences(userId);
    }
    try {
      const res = await fetch(`/api/notificacoes/prefs?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'notificacoes.prefs');
      return res.json();
    } catch {
      console.warn('[notificacoes.getPreferences] API not available, using fallback');
      return { push_enabled: false, email_enabled: false, whatsapp_enabled: false, categories: {} } as unknown as NotificationPrefs;
    }
  } catch (error) {
    handleServiceError(error, 'notificacoes.prefs');
  }
}

export async function updatePreferences(userId: string, prefs: NotificationPrefs): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdatePreferences } = await import('@/lib/mocks/notificacoes.mock');
      return mockUpdatePreferences(userId, prefs);
    }
    try {
      await fetch('/api/notificacoes/prefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prefs }),
      });
    } catch {
      console.warn('[notificacoes.updatePreferences] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'notificacoes.updatePrefs');
  }
}
