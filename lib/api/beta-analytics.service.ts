import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';

export async function trackFeatureUsage(feature_name: string, action: string, metadata?: Record<string, unknown>): Promise<void> {
  if (isMock()) return;

  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('academy_id, role')
      .eq('id', user.id)
      .single();

    await supabase.from('beta_feature_usage').insert({
      academy_id: profile?.academy_id,
      user_id: user.id,
      user_role: profile?.role,
      feature_name,
      action,
      metadata: metadata || {},
    });
  } catch (e) {
    console.warn('[Beta Analytics] Track failed:', e);
  }
}

export async function trackPageVisit(path: string): Promise<void> {
  if (isMock()) return;
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('academy_id, role')
      .eq('id', user.id)
      .single();

    const device_type = typeof window !== 'undefined'
      ? (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop')
      : 'unknown';

    await supabase.from('beta_sessions').insert({
      academy_id: profile?.academy_id,
      user_id: user.id,
      user_role: profile?.role,
      pages_visited: [{ path, timestamp: new Date().toISOString() }],
      device_type,
      actions_count: 1,
    });
  } catch (e) {
    console.warn('[Beta Analytics] Page track failed:', e);
  }
}

// ═══ SUPER ADMIN DASHBOARD QUERIES ═══

export interface BetaDashboardData {
  total_academies: number;
  active_academies: number;
  total_users: number;
  active_users_7d: number;
  total_sessions_7d: number;
  total_actions_7d: number;
  avg_sessions_per_user_7d: number;
  top_features: { feature: string; count: number }[];
  dau_chart: { date: string; count: number }[];
  devices: { type: string; count: number }[];
  roles: { role: string; count: number }[];
}

export async function getBetaDashboardData(): Promise<BetaDashboardData> {
  if (isMock()) {
    return {
      total_academies: 0, active_academies: 0, total_users: 0, active_users_7d: 0,
      total_sessions_7d: 0, total_actions_7d: 0, avg_sessions_per_user_7d: 0,
      top_features: [], dau_chart: [], devices: [], roles: [],
    };
  }

  const supabase = createBrowserClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: betaAcademies } = await supabase.from('beta_academies').select('*');
  const total_academies = betaAcademies?.length || 0;
  const active_academies = betaAcademies?.filter((a: Record<string, unknown>) => a.status === 'active').length || 0;

  const { data: sessions7d } = await supabase
    .from('beta_sessions')
    .select('user_id, device_type, user_role, actions_count')
    .gte('created_at', sevenDaysAgo);

  const total_sessions_7d = sessions7d?.length || 0;
  const uniqueUsers7d = new Set(sessions7d?.map((s: Record<string, unknown>) => s.user_id as string) || []);
  const active_users_7d = uniqueUsers7d.size;
  const total_actions_7d = sessions7d?.reduce((sum: number, s: Record<string, unknown>) => sum + ((s.actions_count as number) || 0), 0) || 0;
  const avg_sessions_per_user_7d = active_users_7d > 0 ? Math.round(total_sessions_7d / active_users_7d * 10) / 10 : 0;

  const { data: featureUsage } = await supabase
    .from('beta_feature_usage')
    .select('feature_name')
    .gte('created_at', sevenDaysAgo);

  const featureCounts: Record<string, number> = {};
  featureUsage?.forEach((f: Record<string, unknown>) => {
    const name = f.feature_name as string;
    featureCounts[name] = (featureCounts[name] || 0) + 1;
  });
  const top_features = Object.entries(featureCounts)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const { data: sessions30d } = await supabase
    .from('beta_sessions')
    .select('user_id, created_at')
    .gte('created_at', thirtyDaysAgo);

  const dauMap: Record<string, Set<string>> = {};
  sessions30d?.forEach((s: Record<string, unknown>) => {
    const date = (s.created_at as string).split('T')[0];
    if (!dauMap[date]) dauMap[date] = new Set();
    dauMap[date].add(s.user_id as string);
  });
  const dau_chart = Object.entries(dauMap)
    .map(([date, users]) => ({ date, count: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const deviceCounts: Record<string, number> = {};
  sessions7d?.forEach((s: Record<string, unknown>) => {
    const type = (s.device_type as string) || 'unknown';
    deviceCounts[type] = (deviceCounts[type] || 0) + 1;
  });
  const devices = Object.entries(deviceCounts).map(([type, count]) => ({ type, count }));

  const roleCounts: Record<string, number> = {};
  sessions7d?.forEach((s: Record<string, unknown>) => {
    const role = (s.user_role as string) || 'unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  const roles = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  const { count: total_users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  return {
    total_academies, active_academies,
    total_users: total_users || 0, active_users_7d,
    total_sessions_7d, total_actions_7d, avg_sessions_per_user_7d,
    top_features, dau_chart, devices, roles,
  };
}

export async function getBetaAcademyDetails(): Promise<Record<string, unknown>[]> {
  if (isMock()) return [];
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('beta_academies')
    .select('*, academies(name, logo_url)')
    .order('created_at', { ascending: false });
  return (data as Record<string, unknown>[]) || [];
}
