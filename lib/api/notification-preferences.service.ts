import { isMock } from '@/lib/env';
import type { NotificationPreferences } from '@/lib/types/notification';

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    if (isMock()) {
      const { mockGetPreferences } = await import('@/lib/mocks/notification-preferences.mock');
      return mockGetPreferences(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('[getNotificationPreferences] Supabase error:', error?.message);
      return { userId: '', muteAll: false, quietHoursStart: '22:00', quietHoursEnd: '07:00', channels: {} as Record<string, string[]> } as unknown as NotificationPreferences;
    }

    return data as unknown as NotificationPreferences;
  } catch (error) {
    console.warn('[getNotificationPreferences] Fallback:', error);
    return { userId: '', muteAll: false, quietHoursStart: '22:00', quietHoursEnd: '07:00', channels: {} as Record<string, string[]> } as unknown as NotificationPreferences;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  try {
    if (isMock()) {
      const { mockUpdatePreferences } = await import('@/lib/mocks/notification-preferences.mock');
      return mockUpdatePreferences(userId, prefs);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...prefs })
      .select()
      .single();

    if (error || !data) {
      console.warn('[updateNotificationPreferences] Supabase error:', error?.message);
      return { userId: '', muteAll: false, quietHoursStart: '22:00', quietHoursEnd: '07:00', channels: {} as Record<string, string[]> } as unknown as NotificationPreferences;
    }

    return data as unknown as NotificationPreferences;
  } catch (error) {
    console.warn('[updateNotificationPreferences] Fallback:', error);
    return { userId: '', muteAll: false, quietHoursStart: '22:00', quietHoursEnd: '07:00', channels: {} as Record<string, string[]> } as unknown as NotificationPreferences;
  }
}
