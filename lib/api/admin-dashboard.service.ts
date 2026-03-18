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
    try {
      const res = await fetch(`/api/admin/dashboard?academyId=${academyId}`);
      if (!res.ok) throw new Error('API not available');
      return res.json();
    } catch {
      console.warn('[adminDashboard.getDashboardData] API not available, using mock fallback');
      const { mockGetDashboardData } = await import('@/lib/mocks/admin-dashboard.mock');
      return mockGetDashboardData(academyId);
    }
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
    try {
      const res = await fetch(`/api/admin/activity-feed?academyId=${academyId}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('API not available');
      return res.json();
    } catch {
      console.warn('[adminDashboard.getActivityFeed] API not available, using mock fallback');
      const { mockGetActivityFeed } = await import('@/lib/mocks/admin-dashboard.mock');
      return mockGetActivityFeed(academyId, page, limit);
    }
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
