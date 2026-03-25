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
        console.warn('[listNotifications] Supabase error:', error.message);
        return [];
      }
      return (data ?? []) as InAppNotification[];
    } catch (err) {
      console.warn('[in-app-notification.listNotifications] query failed, using mock fallback', err);
      const { mockListNotifications } = await import('@/lib/mocks/in-app-notification.mock');
      return mockListNotifications(userId, unreadOnly);
    }
  } catch (error) {
    console.warn('[listNotifications] Fallback:', error);
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
        console.warn('[markAsRead] Supabase error:', error.message);
      }
    } catch (err) {
      console.warn('[in-app-notification.markAsRead] query failed, using fallback', err);
    }
  } catch (error) {
    console.warn('[markAsRead] Fallback:', error);
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
        console.warn('[markAllRead] Supabase error:', error.message);
      }
    } catch (err) {
      console.warn('[in-app-notification.markAllRead] query failed, using fallback', err);
    }
  } catch (error) {
    console.warn('[markAllRead] Fallback:', error);
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
        console.warn('[dismiss] Supabase error:', error.message);
      }
    } catch (err) {
      console.warn('[in-app-notification.dismiss] query failed, using fallback', err);
    }
  } catch (error) {
    console.warn('[dismiss] Fallback:', error);
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
        console.warn('[getUnreadCount] Supabase error:', error.message);
        return 0;
      }
      return count ?? 0;
    } catch (err) {
      console.warn('[in-app-notification.getUnreadCount] query failed, using fallback', err);
      return 0;
    }
  } catch (error) {
    console.warn('[getUnreadCount] Fallback:', error);
    return 0;
  }
}
