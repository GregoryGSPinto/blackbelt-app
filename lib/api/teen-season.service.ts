import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface SeasonInfo {
  id: string;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
}

export interface MySeasonProgress {
  points: number;
  rank: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  next_tier_at: number;
  achievements_count: number;
}

export interface SeasonReward {
  id: string;
  tier_required: string;
  name: string;
  description: string;
  unlocked: boolean;
  claimed: boolean;
}

export interface SeasonRankEntry {
  rank: number;
  student_name: string;
  avatar: string | null;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  is_current_user: boolean;
}

export interface TeenSeasonPass {
  season: SeasonInfo;
  my_progress: MySeasonProgress;
  rewards: SeasonReward[];
  leaderboard: SeasonRankEntry[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getTeenSeasonPass(studentId: string): Promise<TeenSeasonPass> {
  try {
    if (isMock()) {
      const { mockGetTeenSeasonPass } = await import('@/lib/mocks/teen-season.mock');
      return mockGetTeenSeasonPass(studentId);
    }
    try {
      const res = await fetch(`/api/teen/season?studentId=${studentId}`);
      if (!res.ok) {
        console.warn('[getTeenSeasonPass] error:', `HTTP ${res.status}`);
        return { season: { id: '', name: '', theme: '', start_date: '', end_date: '', days_remaining: 0 }, my_progress: { points: 0, rank: 0, tier: 'bronze', next_tier_at: 0, achievements_count: 0 }, rewards: [], leaderboard: [] };
      }
      return res.json();
    } catch {
      console.warn('[teen-season.getTeenSeasonPass] API not available, using fallback');
      return { season: { id: '', name: '', theme: '', start_date: '', end_date: '', days_remaining: 0 }, my_progress: { points: 0, rank: 0, tier: 'bronze', next_tier_at: 0, achievements_count: 0 }, rewards: [], leaderboard: [] };
    }
  } catch (error) {
    console.warn('[getTeenSeasonPass] Fallback:', error);
    return { season: { id: '', name: '', theme: '', start_date: '', end_date: '', days_remaining: 0 }, my_progress: { points: 0, rank: 0, tier: 'bronze', next_tier_at: 0, achievements_count: 0 }, rewards: [], leaderboard: [] };
  }
}

export async function claimSeasonReward(rewardId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockClaimSeasonReward } = await import('@/lib/mocks/teen-season.mock');
      return mockClaimSeasonReward(rewardId);
    }
    try {
      const res = await fetch(`/api/teen/season/rewards/${rewardId}/claim`, { method: 'POST' });
      if (!res.ok) {
        console.warn('[claimSeasonReward] error:', `HTTP ${res.status}`);
      }
    } catch {
      console.warn('[teen-season.claimSeasonReward] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[claimSeasonReward] Fallback:', error);
  }
}
