import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { InAppNotification } from '@/lib/types/notification';

export async function listNotifications(
  userId: string,
  unreadOnly?: boolean,
): Promise<InAppNotification[]> {
  try {
    if (isMock()) {
      const { mockListNotifications } = await import(
        '@/lib/mocks/in-app-notification.mock'
      );
      return mockListNotifications(userId, unreadOnly);
    }
    try {
      const params = new URLSearchParams({ userId });
      if (unreadOnly) params.set('unreadOnly', 'true');
      const res = await fetch(`/api/in-app-notifications?${params.toString()}`);
      if (!res.ok)
        throw new ServiceError(res.status, 'inAppNotification.list');
      return res.json();
    } catch {
      console.warn('[in-app-notification.listNotifications] API not available, using fallback');
      return [];
    }

  } catch (error) {
    handleServiceError(error, 'inAppNotification.list');
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAsRead } = await import(
        '@/lib/mocks/in-app-notification.mock'
      );
      return mockMarkAsRead(id);
    }
    try {
      const res = await fetch(`/api/in-app-notifications/${id}/read`, {
        method: 'POST',
      });
      if (!res.ok)
        throw new ServiceError(res.status, 'inAppNotification.markAsRead');
    } catch {
      console.warn('[in-app-notification.markAsRead] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'inAppNotification.markAsRead');
  }
}

export async function markAllRead(userId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAllRead } = await import(
        '@/lib/mocks/in-app-notification.mock'
      );
      return mockMarkAllRead(userId);
    }
    try {
      const res = await fetch('/api/in-app-notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok)
        throw new ServiceError(res.status, 'inAppNotification.markAllRead');
    } catch {
      console.warn('[in-app-notification.markAllRead] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'inAppNotification.markAllRead');
  }
}

export async function dismiss(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDismiss } = await import(
        '@/lib/mocks/in-app-notification.mock'
      );
      return mockDismiss(id);
    }
    try {
      const res = await fetch(`/api/in-app-notifications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok)
        throw new ServiceError(res.status, 'inAppNotification.dismiss');
    } catch {
      console.warn('[in-app-notification.dismiss] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'inAppNotification.dismiss');
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    if (isMock()) {
      const { mockGetUnreadCount } = await import(
        '@/lib/mocks/in-app-notification.mock'
      );
      return mockGetUnreadCount(userId);
    }
    try {
      const res = await fetch(
        `/api/in-app-notifications/unread-count?userId=${userId}`,
      );
      if (!res.ok)
        throw new ServiceError(res.status, 'inAppNotification.unreadCount');
      const data: { count: number } = await res.json();
      return data.count;
    } catch {
      console.warn('[in-app-notification.getUnreadCount] API not available, using fallback');
      return 0;
    }
  } catch (error) {
    handleServiceError(error, 'inAppNotification.unreadCount');
  }
}
