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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
