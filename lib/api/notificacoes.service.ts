import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      console.warn('[listNotifications] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      type: (row.type ?? 'nova_mensagem') as NotificationType,
      title: String(row.title ?? ''),
      message: String(row.message ?? ''),
      time: String(row.created_at ?? ''),
      read: Boolean(row.read),
      link: row.link ? String(row.link) : undefined,
    }));
  } catch (error) {
    console.warn('[listNotifications] Fallback:', error);
    return [];
  }
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkRead } = await import('@/lib/mocks/notificacoes.mock');
      return mockMarkRead(ids);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids);

    if (error) {
      console.warn('[markNotificationsRead] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[markNotificationsRead] Fallback:', error);
  }
}

export async function markAllRead(): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAllRead } = await import('@/lib/mocks/notificacoes.mock');
      return mockMarkAllRead();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.warn('[markAllRead] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[markAllRead] Fallback:', error);
  }
}

export async function getPreferences(userId: string): Promise<NotificationPrefs> {
  try {
    if (isMock()) {
      const { mockGetPreferences } = await import('@/lib/mocks/notificacoes.mock');
      return mockGetPreferences(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('notification_prefs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('[getPreferences] Supabase error:', error?.message);
      return { push_enabled: false, email_enabled: false, types: {} as Record<NotificationType, boolean> };
    }

    return data as unknown as NotificationPrefs;
  } catch (error) {
    console.warn('[getPreferences] Fallback:', error);
    return { push_enabled: false, email_enabled: false, types: {} as Record<NotificationType, boolean> };
  }
}

export async function updatePreferences(userId: string, prefs: NotificationPrefs): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdatePreferences } = await import('@/lib/mocks/notificacoes.mock');
      return mockUpdatePreferences(userId, prefs);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('notification_prefs')
      .upsert({ user_id: userId, ...prefs });

    if (error) {
      console.warn('[updatePreferences] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[updatePreferences] Fallback:', error);
  }
}
