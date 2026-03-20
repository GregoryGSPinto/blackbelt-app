import { isMock } from '@/lib/env';

export interface AppNotification {
  id: string;
  recipient_id: string;
  title: string;
  body: string;
  type: 'checkin' | 'payment' | 'alert' | 'message' | 'graduation' | 'event' | 'system';
  read_at: string | null;
  created_at: string;
  link?: string;
}

export async function getUnreadNotifications(profileId: string): Promise<AppNotification[]> {
  if (isMock()) {
    const { mockGetUnreadNotifications } = await import('@/lib/mocks/notifications-realtime.mock');
    return mockGetUnreadNotifications(profileId);
  }
  try {
    const res = await fetch(`/api/notifications?profile_id=${profileId}&unread=true`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.warn('[notifications.getUnread]', e);
    const { mockGetUnreadNotifications } = await import('@/lib/mocks/notifications-realtime.mock');
    return mockGetUnreadNotifications(profileId);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isMock()) return;
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  } catch (e) {
    console.warn('[notifications.markRead]', e);
  }
}

export async function markAllRead(profileId: string): Promise<void> {
  if (isMock()) return;
  try {
    await fetch(`/api/notifications/mark-all-read`, { method: 'PATCH', body: JSON.stringify({ profile_id: profileId }) });
  } catch (e) {
    console.warn('[notifications.markAllRead]', e);
  }
}
