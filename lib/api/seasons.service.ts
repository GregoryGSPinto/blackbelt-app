import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type SeasonStatus = 'upcoming' | 'active' | 'ended';
export type SeasonTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface SeasonRewardTier {
  rank_range: string;
  reward_type: string;
  reward_value: string;
}

export interface SeasonDTO {
  id: string;
  academy_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SeasonStatus;
  theme: string;
  rewards: SeasonRewardTier[];
}

export interface SeasonProgress {
  season_id: string;
  student_id: string;
  season_points: number;
  rank: number;
  tier: SeasonTier;
  achievements_this_season: string[];
  streak_this_season: number;
  classes_attended_this_season: number;
}

export interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  avatar_url: string;
  points: number;
  rank: number;
  tier: SeasonTier;
}

/** Points table: check-in=10, challenge=25-100, achievement=50, positive eval=30, bring friend=100 */

export async function getCurrentSeason(academyId: string): Promise<SeasonDTO> {
  try {
    if (isMock()) {
      const { mockGetCurrentSeason } = await import('@/lib/mocks/seasons.mock');
      return mockGetCurrentSeason(academyId);
    }
    try {
      const res = await fetch(`/api/seasons/current?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'seasons.getCurrent');
      return res.json();
    } catch {
      console.warn('[seasons.getCurrentSeason] API not available, using mock fallback');
      const { mockGetCurrentSeason } = await import('@/lib/mocks/seasons.mock');
      return mockGetCurrentSeason(academyId);
    }
  } catch (error) { handleServiceError(error, 'seasons.getCurrent'); }
}

export async function getSeasonLeaderboard(seasonId: string, category?: string): Promise<LeaderboardEntry[]> {
  try {
    if (isMock()) {
      const { mockGetSeasonLeaderboard } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonLeaderboard(seasonId, category);
    }
    try {
      const params = new URLSearchParams({ seasonId });
      if (category) params.set('category', category);
      const res = await fetch(`/api/seasons/leaderboard?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'seasons.leaderboard');
      return res.json();
    } catch {
      console.warn('[seasons.getSeasonLeaderboard] API not available, using mock fallback');
      const { mockGetSeasonLeaderboard } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonLeaderboard(seasonId, category);
    }
  } catch (error) { handleServiceError(error, 'seasons.leaderboard'); }
}

export async function getSeasonRewards(seasonId: string): Promise<SeasonRewardTier[]> {
  try {
    if (isMock()) {
      const { mockGetSeasonRewards } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonRewards(seasonId);
    }
    try {
      const res = await fetch(`/api/seasons/${seasonId}/rewards`);
      if (!res.ok) throw new ServiceError(res.status, 'seasons.rewards');
      return res.json();
    } catch {
      console.warn('[seasons.getSeasonRewards] API not available, using mock fallback');
      const { mockGetSeasonRewards } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonRewards(seasonId);
    }
  } catch (error) { handleServiceError(error, 'seasons.rewards'); }
}

export async function getMySeasonProgress(studentId: string, seasonId: string): Promise<SeasonProgress> {
  try {
    if (isMock()) {
      const { mockGetMySeasonProgress } = await import('@/lib/mocks/seasons.mock');
      return mockGetMySeasonProgress(studentId, seasonId);
    }
    try {
      const res = await fetch(`/api/seasons/${seasonId}/progress?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'seasons.myProgress');
      return res.json();
    } catch {
      console.warn('[seasons.getMySeasonProgress] API not available, using mock fallback');
      const { mockGetMySeasonProgress } = await import('@/lib/mocks/seasons.mock');
      return mockGetMySeasonProgress(studentId, seasonId);
    }
  } catch (error) { handleServiceError(error, 'seasons.myProgress'); }
}
