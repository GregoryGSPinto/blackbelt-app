import { isMock } from '@/lib/env';
import type { DashboardData, ActivityFeedItem } from '@/lib/types/admin-dashboard';
import { logServiceError } from '@/lib/api/errors';

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
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  // ── Fetch logged-in user's profile for greeting ──────────────────
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const [
    studentsRes,
    classesRes,
    revenueRes,
    prevRevenueRes,
    activityRes,
    userProfileRes,
    academyRes,
    overdueRes,
    todayCheckinsRes,
    prevMonthStudentsRes,
  ] = await Promise.all([
    supabase.from('students').select('id, belt', { count: 'exact' }).eq('academy_id', academyId),
    supabase.from('classes').select('id, schedule, capacity, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id), class_enrollments(count)').eq('units.academy_id', academyId),
    supabase.from('invoices').select('amount, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).eq('status', 'paid').gte('due_date', startOfMonth),
    supabase.from('invoices').select('amount, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).eq('status', 'paid').gte('due_date', startOfPrevMonth).lte('due_date', endOfPrevMonth),
    supabase.from('attendance').select('student_id, checked_at, students(profiles(display_name)), classes(modalities(name))').order('checked_at', { ascending: false }).limit(10),
    // Get logged-in user's own profile (not academy profile)
    userId
      ? supabase.from('profiles').select('display_name').eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    // Get academy name
    supabase.from('academies').select('name').eq('id', academyId).maybeSingle(),
    // Get overdue memberships
    supabase.from('memberships')
      .select('id, monthly_amount, billing_status, profiles!memberships_profile_id_fkey(display_name)')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .eq('billing_status', 'atrasado'),
    // Today's check-in count
    supabase.from('attendance').select('id', { count: 'exact', head: true })
      .gte('checked_at', todayStart)
      .lt('checked_at', tomorrowStart),
    // Previous month student count (for change calc)
    supabase.from('students').select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .lt('created_at', startOfMonth),
  ]);

  const totalStudents = studentsRes.count ?? 0;
  const prevMonthStudents = prevMonthStudentsRes.count ?? 0;
  const studentChange = totalStudents - prevMonthStudents;
  const classes = classesRes.data ?? [];
  const revenueThisMonth = (revenueRes.data ?? []).reduce((sum: number, i: Record<string, unknown>) => sum + ((i.amount as number) ?? 0), 0);
  const revenuePrevMonth = (prevRevenueRes.data ?? []).reduce((sum: number, i: Record<string, unknown>) => sum + ((i.amount as number) ?? 0), 0);
  const revenueChange = revenuePrevMonth > 0 ? Math.round(((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100) : 0;

  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';

  // ── Today's schedule ──────────────────────────────────────────────
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

  // ── Activity feed ─────────────────────────────────────────────────
  const activityFeed: ActivityFeedItem[] = (activityRes.data ?? []).map((a: Record<string, unknown>, i: number) => {
    const students = a.students as Record<string, unknown> | null;
    const profiles = students?.profiles as Record<string, unknown> | null;
    const classData = a.classes as Record<string, unknown> | null;
    const mod = classData?.modalities as Record<string, unknown> | null;
    return {
      id: `activity-${i}`,
      type: 'check_in' as const,
      message: `Check-in em ${(mod?.name ?? 'aula') as string}`,
      actor_name: (profiles?.display_name ?? '') as string,
      timestamp: a.checked_at as string,
      icon: 'check-circle',
      accent_color: 'green',
    };
  });

  // ── Overdue members ───────────────────────────────────────────────
  const overdueMembers = overdueRes.data ?? [];
  const overdueNames = overdueMembers.map((m: Record<string, unknown>) => {
    const prof = m.profiles as Record<string, unknown> | null;
    const amountCents = (m.monthly_amount ?? 0) as number;
    return {
      name: (prof?.display_name ?? '') as string,
      amount: Math.round(amountCents / 100), // cents -> reais (dashboard uses reais)
      days_overdue: 0, // billing_status tracks state, not exact days
    };
  });
  const overdueCount = overdueMembers.length;
  const pendingPayments = overdueMembers.reduce((s: number, m: Record<string, unknown>) => s + (Math.round(((m.monthly_amount as number) ?? 0) / 100)), 0);

  // ── Retention rate (active vs last month) ─────────────────────────
  // retention = students from prev month who are still active / prev month total
  const retentionRate = prevMonthStudents > 0
    ? Math.min(100, Math.round((Math.min(totalStudents, prevMonthStudents) / prevMonthStudents) * 100))
    : 100;

  // ── Growth chart (last 6 months) ──────────────────────────────────
  const growthLabels: string[] = [];
  const growthStudents: number[] = [];
  const growthRevenue: number[] = [];
  const growthChurn: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    growthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }));
    // We already have current + prev month revenue; for the chart we approximate
    if (i === 0) {
      growthRevenue.push(revenueThisMonth);
    } else if (i === 1) {
      growthRevenue.push(revenuePrevMonth);
    } else {
      growthRevenue.push(0); // older months not queried (would require N queries)
    }
    growthStudents.push(0); // would require per-month snapshot
    growthChurn.push(0);
  }

  // ── Admin name and academy name ───────────────────────────────────
  const adminName = (userProfileRes.data?.display_name ?? 'Admin') as string;
  const academyName = (academyRes.data?.name ?? '') as string;

  // ── Today's check-in count ────────────────────────────────────────
  const todayCheckins = todayCheckinsRes.count ?? 0;

  // Update today_schedule confirmed count with actual check-ins
  // (Simplified: set the first card to show total today check-ins)
  if (todaySchedule.length > 0) {
    // Distribute today check-ins across schedule items proportionally is complex
    // Instead, we set total confirmed as a summary
    todaySchedule[0].confirmed = todayCheckins;
  }

  return {
    greeting: {
      admin_name: adminName,
      academy_name: academyName,
      time_of_day: timeOfDay,
      motivation_quote: getMotivationQuote(),
    },
    headlines: {
      active_students: {
        value: totalStudents,
        change: studentChange,
        trend: studentChange > 0 ? 'up' : studentChange < 0 ? 'down' : 'stable',
        period: 'month',
      },
      monthly_revenue: {
        value: revenueThisMonth,
        change: revenueChange,
        trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
        period: 'month',
      },
      retention_rate: {
        value: retentionRate,
        change: 0,
        trend: retentionRate >= 90 ? 'up' : retentionRate >= 80 ? 'stable' : 'down',
        period: 'month',
      },
      classes_this_week: {
        value: classes.length,
        total_capacity: classes.reduce((s: number, c: Record<string, unknown>) => s + ((c.capacity as number) ?? 30), 0),
        fill_rate: 0,
      },
    },
    growth_chart: {
      labels: growthLabels,
      students: growthStudents,
      revenue: growthRevenue,
      churn: growthChurn,
    },
    retention: {
      current_month: retentionRate,
      previous_month: retentionRate > 0 ? retentionRate - 1 : 0,
      at_risk: 0,
      at_risk_names: [],
    },
    today_schedule: todaySchedule,
    activity_feed: activityFeed,
    pending_promotions: [],
    financial_summary: {
      revenue_this_month: revenueThisMonth,
      revenue_last_month: revenuePrevMonth,
      pending_payments: pendingPayments,
      overdue_count: overdueCount,
      overdue_names: overdueNames,
    },
    plan_usage: {
      plan_name: 'Pro',
      students: { current: totalStudents, limit: 500 },
      professors: { current: 0, limit: 50 },
      classes: { current: classes.length, limit: 100 },
      storage_gb: { current: 0, limit: 10 },
      alerts: [],
    },
    streaming_summary: {
      total_views_week: 0,
      most_watched: { title: '', views: 0 },
      completion_rate: 0,
      new_videos_this_month: 0,
    },
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
    logServiceError(error, 'admin-dashboard');
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
    logServiceError(error, 'admin-dashboard');
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
