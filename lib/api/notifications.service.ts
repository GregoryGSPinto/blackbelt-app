import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
  if (isMock()) {
    const { mockGetNotifications } = await import(
      '@/lib/mocks/notifications.mock'
    );
    return mockGetNotifications(profileId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, priority, category, title, message, grouped_names, created_at, read, action_url, profile_id')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error || !data) {
    logServiceError(error, 'notifications');
    return [];
  }
  return data as unknown as IntelligentNotification[];
}

export async function markAsRead(notificationId: string): Promise<void> {
  if (isMock()) {
    const { mockMarkAsRead } = await import(
      '@/lib/mocks/notifications.mock'
    );
    return mockMarkAsRead(notificationId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) {
    logServiceError(error, 'notifications');
    throw new Error(`[markAsRead] ${error.message}`);
  }
}

export async function markAllNotificationsRead(
  profileId: string,
): Promise<void> {
  if (isMock()) {
    const { mockMarkAllNotificationsRead } = await import(
      '@/lib/mocks/notifications.mock'
    );
    return mockMarkAllNotificationsRead(profileId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('profile_id', profileId)
    .eq('read', false);
  if (error) {
    logServiceError(error, 'notifications');
    throw new Error(`[markAllNotificationsRead] ${error.message}`);
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
