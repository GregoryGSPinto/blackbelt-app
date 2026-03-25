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
      .eq('recipient_id', profileId)
      .is('read_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getUnreadNotifications] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      recipient_id: String(row.recipient_id ?? ''),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      type: (row.type as AppNotification['type']) ?? 'system',
      read_at: row.read_at ? String(row.read_at) : null,
      created_at: String(row.created_at ?? ''),
      link: row.link ? String(row.link) : undefined,
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[getUnreadNotifications] Fallback:', msg);
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
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[markNotificationRead] Supabase error:', error.message);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[markNotificationRead] Fallback:', msg);
  }
}

export async function markAllRead(profileId: string): Promise<void> {
  if (isMock()) return;
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', profileId)
      .is('read_at', null);

    if (error) {
      console.error('[markAllRead] Supabase error:', error.message);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[markAllRead] Fallback:', msg);
  }
}
