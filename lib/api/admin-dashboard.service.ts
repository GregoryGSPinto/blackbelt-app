import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { DashboardData, ActivityFeedItem } from '@/lib/types/admin-dashboard';

// ── Get full dashboard data ────────────────────────────────────────

export async function getDashboardData(academyId: string): Promise<DashboardData> {
  try {
    if (isMock()) {
      const { mockGetDashboardData } = await import('@/lib/mocks/admin-dashboard.mock');
      return mockGetDashboardData(academyId);
    }
    console.warn('[adminDashboard.getDashboardData] fallback — not yet connected to Supabase');
    return {
      greeting: { admin_name: '', academy_name: '', time_of_day: 'morning', motivation_quote: '' },
      headlines: {
        active_students: { value: 0, change: 0, trend: 'stable', period: '' },
        monthly_revenue: { value: 0, change: 0, trend: 'stable', period: '' },
        retention_rate: { value: 0, change: 0, trend: 'stable', period: '' },
        classes_this_week: { value: 0, total_capacity: 0, fill_rate: 0 },
      },
      growth_chart: { labels: [], students: [], revenue: [], churn: [] },
      retention: { current_month: 0, previous_month: 0, at_risk: 0, at_risk_names: [] },
      today_schedule: [],
      activity_feed: [],
      pending_promotions: [],
      financial_summary: { revenue_this_month: 0, revenue_last_month: 0, pending_payments: 0, overdue_count: 0, overdue_names: [] },
      plan_usage: {
        plan_name: '', students: { current: 0, limit: 0 }, professors: { current: 0, limit: 0 },
        classes: { current: 0, limit: 0 }, storage_gb: { current: 0, limit: 0 }, alerts: [],
      },
      streaming_summary: { total_views_week: 0, most_watched: { title: '', views: 0 }, completion_rate: 0, new_videos_this_month: 0 },
      quick_actions: [],
      academy_achievements: [],
    } as DashboardData;
  } catch (error) {
    handleServiceError(error, 'adminDashboard.getDashboardData');
  }
}

// ── Paginated activity feed ────────────────────────────────────────

export async function getActivityFeed(
  academyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ActivityFeedItem[]> {
  try {
    if (isMock()) {
      const { mockGetActivityFeed } = await import('@/lib/mocks/admin-dashboard.mock');
      return mockGetActivityFeed(academyId, page, limit);
    }
    console.warn('[adminDashboard.getActivityFeed] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'adminDashboard.getActivityFeed');
  }
}

// ── Dismiss an alert ───────────────────────────────────────────────

export async function dismissDashboardAlert(_alertId: string): Promise<void> {
  try {
    if (isMock()) {
      return;
    }
    console.warn('[adminDashboard.dismissAlert] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'adminDashboard.dismissAlert');
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
