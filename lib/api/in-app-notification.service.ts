import { isMock } from '@/lib/env';
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', userId);
      if (unreadOnly) {
        query = query.eq('read', false);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('[listNotifications] Supabase error:', error.message);
        return [];
      }
      return (data ?? []) as InAppNotification[];
    } catch (err) {
      console.error('[in-app-notification.listNotifications] query failed, using mock fallback', err);
      const { mockListNotifications } = await import('@/lib/mocks/in-app-notification.mock');
      return mockListNotifications(userId, unreadOnly);
    }
  } catch (error) {
    console.error('[listNotifications] Fallback:', error);
    return [];
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) {
        console.error('[markAsRead] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[in-app-notification.markAsRead] query failed, using fallback', err);
    }
  } catch (error) {
    console.error('[markAsRead] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('profile_id', userId)
        .eq('read', false);
      if (error) {
        console.error('[markAllRead] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[in-app-notification.markAllRead] query failed, using fallback', err);
    }
  } catch (error) {
    console.error('[markAllRead] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[dismiss] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[in-app-notification.dismiss] query failed, using fallback', err);
    }
  } catch (error) {
    console.error('[dismiss] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', userId)
        .eq('read', false);
      if (error) {
        console.error('[getUnreadCount] Supabase error:', error.message);
        return 0;
      }
      return count ?? 0;
    } catch (err) {
      console.error('[in-app-notification.getUnreadCount] query failed, using fallback', err);
      return 0;
    }
  } catch (error) {
    console.error('[getUnreadCount] Fallback:', error);
    return 0;
  }
}
