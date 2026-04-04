import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'checkin' | 'payment' | 'alert' | 'message' | 'graduation' | 'event' | 'system';
  read: boolean;
  created_at: string;
}

export async function getUnreadNotifications(profileId: string): Promise<AppNotification[]> {
  try {
    if (isMock()) {
      const { mockGetUnreadNotifications } = await import('@/lib/mocks/notifications-realtime.mock');
      return mockGetUnreadNotifications(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profileId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError(error, 'notifications-realtime');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      user_id: String(row.user_id ?? ''),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      type: (row.type as AppNotification['type']) ?? 'system',
      read: Boolean(row.read ?? false),
      created_at: String(row.created_at ?? ''),
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'notifications-realtime');
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isMock()) return;
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      logServiceError(error, 'notifications-realtime');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'notifications-realtime');
  }
}

export async function markAllRead(profileId: string): Promise<void> {
  if (isMock()) return;
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profileId)
      .eq('read', false);

    if (error) {
      logServiceError(error, 'notifications-realtime');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'notifications-realtime');
  }
}
