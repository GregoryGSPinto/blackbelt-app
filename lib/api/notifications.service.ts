import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type NotificationPriority = 'urgent' | 'important' | 'info' | 'silent';

export type NotificationCategory =
  | 'payment'
  | 'attendance'
  | 'achievement'
  | 'class'
  | 'message'
  | 'system'
  | 'lead';

export interface IntelligentNotification {
  id: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  groupedNames: string[] | null;
  createdAt: string;
  read: boolean;
  actionUrl: string | null;
}

export interface NotificationCounts {
  urgent: number;
  important: number;
  info: number;
  silent: number;
  total: number;
  unread: number;
}

export async function getNotifications(
  profileId: string,
): Promise<IntelligentNotification[]> {
  try {
    if (isMock()) {
      const { mockGetNotifications } = await import(
        '@/lib/mocks/notifications.mock'
      );
      return mockGetNotifications(profileId);
    }
    const res = await fetch(`/api/notifications?profileId=${profileId}`);
    if (!res.ok) throw new ServiceError(res.status, 'notifications.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'notifications.get');
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAsRead } = await import(
        '@/lib/mocks/notifications.mock'
      );
      return mockMarkAsRead(notificationId);
    }
    const res = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
    if (!res.ok) throw new ServiceError(res.status, 'notifications.markRead');
  } catch (error) {
    handleServiceError(error, 'notifications.markRead');
  }
}

export async function markAllNotificationsRead(
  profileId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAllNotificationsRead } = await import(
        '@/lib/mocks/notifications.mock'
      );
      return mockMarkAllNotificationsRead(profileId);
    }
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    if (!res.ok)
      throw new ServiceError(res.status, 'notifications.markAllRead');
  } catch (error) {
    handleServiceError(error, 'notifications.markAllRead');
  }
}

export function getNotificationCounts(
  notifications: IntelligentNotification[],
): NotificationCounts {
  const unread = notifications.filter((n) => !n.read);
  return {
    urgent: unread.filter((n) => n.priority === 'urgent').length,
    important: unread.filter((n) => n.priority === 'important').length,
    info: unread.filter((n) => n.priority === 'info').length,
    silent: unread.filter((n) => n.priority === 'silent').length,
    total: notifications.length,
    unread: unread.length,
  };
}
