import { isMock } from '@/lib/env';
import type { DashboardData, ActivityFeedItem } from '@/lib/types/admin-dashboard';

// ── Get full dashboard data ────────────────────────────────────────

export async function getDashboardData(academyId: string): Promise<DashboardData> {
  if (isMock()) {
    const { mockGetDashboardData } = await import('@/lib/mocks/admin-dashboard.mock');
    return mockGetDashboardData(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const [studentsRes, classesRes, revenueRes, prevRevenueRes, activityRes, profileRes] = await Promise.all([
    supabase.from('students').select('id, belt', { count: 'exact' }).eq('academy_id', academyId),
    supabase.from('classes').select('id, schedule, capacity, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id), class_enrollments(count)').eq('units.academy_id', academyId),
    supabase.from('invoices').select('amount').eq('academy_id', academyId).eq('status', 'paid').gte('created_at', startOfMonth),
    supabase.from('invoices').select('amount').eq('academy_id', academyId).eq('status', 'paid').gte('created_at', startOfPrevMonth).lte('created_at', endOfPrevMonth),
    supabase.from('attendance').select('student_id, checked_at, students(profiles(display_name)), classes(modalities(name))').order('checked_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('display_name').eq('id', academyId).maybeSingle(),
  ]);

  const totalStudents = studentsRes.count ?? 0;
  const classes = classesRes.data ?? [];
  const revenueThisMonth = (revenueRes.data ?? []).reduce((sum: number, i: Record<string, unknown>) => sum + ((i.amount as number) ?? 0), 0);
  const revenuePrevMonth = (prevRevenueRes.data ?? []).reduce((sum: number, i: Record<string, unknown>) => sum + ((i.amount as number) ?? 0), 0);
  const revenueChange = revenuePrevMonth > 0 ? Math.round(((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100) : 0;

  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';

  const todayDay = now.getDay();
  const todaySchedule: DashboardData['today_schedule'] = [];
  for (const cls of classes) {
    const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
    for (const slot of schedule) {
      if (slot.day_of_week === todayDay) {
        const mod = cls.modalities as Record<string, unknown> | null;
        const prof = cls.profiles as Record<string, unknown> | null;
        const enr = cls.class_enrollments as Array<Record<string, number>> | null;
        todaySchedule.push({
          id: cls.id as string,
          class_name: (mod?.name ?? '') as string,
          time: slot.start_time,
          professor: (prof?.display_name ?? '') as string,
          modality: (mod?.name ?? '') as string,
          enrolled: enr?.[0]?.count ?? 0,
          capacity: (cls.capacity as number) ?? 30,
          confirmed: 0,
          status: 'upcoming',
        });
      }
    }
  }

  const activityFeed: ActivityFeedItem[] = (activityRes.data ?? []).map((a: Record<string, unknown>, i: number) => {
    const students = a.students as Record<string, unknown> | null;
    const profiles = students?.profiles as Record<string, unknown> | null;
    return {
      id: `activity-${i}`,
      type: 'check_in' as const,
      message: `Check-in realizado`,
      actor_name: (profiles?.display_name ?? '') as string,
      timestamp: a.checked_at as string,
      icon: 'check-circle',
      accent_color: 'green',
    };
  });

  return {
    greeting: {
      admin_name: (profileRes.data?.display_name ?? 'Admin') as string,
      academy_name: '',
      time_of_day: timeOfDay,
      motivation_quote: 'Um faixa preta é um faixa branca que nunca desistiu.',
    },
    headlines: {
      active_students: { value: totalStudents, change: 0, trend: 'stable', period: 'month' },
      monthly_revenue: { value: revenueThisMonth, change: revenueChange, trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable', period: 'month' },
      retention_rate: { value: 95, change: 0, trend: 'stable', period: 'month' },
      classes_this_week: { value: classes.length, total_capacity: classes.reduce((s: number, c: Record<string, unknown>) => s + ((c.capacity as number) ?? 30), 0), fill_rate: 0 },
    },
    growth_chart: { labels: [], students: [], revenue: [], churn: [] },
    retention: { current_month: 95, previous_month: 94, at_risk: 0, at_risk_names: [] },
    today_schedule: todaySchedule,
    activity_feed: activityFeed,
    pending_promotions: [],
    financial_summary: { revenue_this_month: revenueThisMonth, revenue_last_month: revenuePrevMonth, pending_payments: 0, overdue_count: 0, overdue_names: [] },
    plan_usage: { plan_name: 'Pro', students: { current: totalStudents, limit: 500 }, professors: { current: 0, limit: 50 }, classes: { current: classes.length, limit: 100 }, storage_gb: { current: 0, limit: 10 }, alerts: [] },
    streaming_summary: { total_views_week: 0, most_watched: { title: '', views: 0 }, completion_rate: 0, new_videos_this_month: 0 },
    quick_actions: [],
    academy_achievements: [],
  };
}

// ── Paginated activity feed ────────────────────────────────────────

export async function getActivityFeed(
  academyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ActivityFeedItem[]> {
  if (isMock()) {
    const { mockGetActivityFeed } = await import('@/lib/mocks/admin-dashboard.mock');
    return mockGetActivityFeed(academyId, page, limit);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const offset = (page - 1) * limit;
  const { data, error } = await supabase
    .from('attendance')
    .select('student_id, checked_at, students(profiles(display_name)), classes(modalities(name))')
    .order('checked_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getActivityFeed] Supabase error:', error.message);
    return [];
  }

  return (data ?? []).map((a: Record<string, unknown>, i: number) => {
    const students = a.students as Record<string, unknown> | null;
    const profiles = students?.profiles as Record<string, unknown> | null;
    const classData = a.classes as Record<string, unknown> | null;
    const mod = classData?.modalities as Record<string, unknown> | null;
    return {
      id: `activity-${academyId}-${offset + i}`,
      type: 'check_in' as const,
      message: `Check-in em ${(mod?.name ?? 'aula') as string}`,
      actor_name: (profiles?.display_name ?? '') as string,
      timestamp: a.checked_at as string,
      icon: 'check-circle',
      accent_color: 'green',
    };
  });
}

// ── Dismiss an alert ───────────────────────────────────────────────

export async function dismissDashboardAlert(_alertId: string): Promise<void> {
  if (isMock()) {
    return;
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', _alertId);
  if (error) {
    console.error('[dismissDashboardAlert] error:', error.message);
    throw new Error(`[dismissDashboardAlert] Failed: ${error.message}`);
  }
}

// ── Motivation quote ───────────────────────────────────────────────

const QUOTES = [
  'Um faixa preta é um faixa branca que nunca desistiu.',
  'O tatame ensina o que a vida cobra.',
  'Disciplina é a ponte entre metas e conquistas.',
  'A arte suave vence a força bruta.',
  'Quem treina junto, cresce junto.',
];

export function getMotivationQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
