import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('[getCurrentSeason] Supabase error:', error?.message);
      return { id: '', academy_id: academyId, name: '', start_date: '', end_date: '', status: 'upcoming', theme: '', rewards: [] };
    }

    return {
      id: String(data.id),
      academy_id: String(data.academy_id),
      name: String(data.name ?? ''),
      start_date: String(data.start_date ?? ''),
      end_date: String(data.end_date ?? ''),
      status: (data.status ?? 'active') as SeasonStatus,
      theme: String(data.theme ?? ''),
      rewards: (data.rewards ?? []) as SeasonRewardTier[],
    };
  } catch (error) {
    console.warn('[getCurrentSeason] Fallback:', error);
    return { id: '', academy_id: academyId, name: '', start_date: '', end_date: '', status: 'upcoming', theme: '', rewards: [] };
  }
}

export async function getSeasonLeaderboard(seasonId: string, category?: string): Promise<LeaderboardEntry[]> {
  try {
    if (isMock()) {
      const { mockGetSeasonLeaderboard } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonLeaderboard(seasonId, category);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('season_leaderboard')
      .select('*')
      .eq('season_id', seasonId)
      .order('points', { ascending: false })
      .limit(50);

    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error || !data) {
      console.warn('[getSeasonLeaderboard] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      student_id: String(row.student_id ?? ''),
      student_name: String(row.student_name ?? ''),
      avatar_url: String(row.avatar_url ?? ''),
      points: Number(row.points ?? 0),
      rank: Number(row.rank ?? 0),
      tier: (row.tier ?? 'bronze') as SeasonTier,
    }));
  } catch (error) {
    console.warn('[getSeasonLeaderboard] Fallback:', error);
    return [];
  }
}

export async function getSeasonRewards(seasonId: string): Promise<SeasonRewardTier[]> {
  try {
    if (isMock()) {
      const { mockGetSeasonRewards } = await import('@/lib/mocks/seasons.mock');
      return mockGetSeasonRewards(seasonId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('seasons')
      .select('rewards')
      .eq('id', seasonId)
      .single();

    if (error || !data) {
      console.warn('[getSeasonRewards] Supabase error:', error?.message);
      return [];
    }

    return (data.rewards ?? []) as SeasonRewardTier[];
  } catch (error) {
    console.warn('[getSeasonRewards] Fallback:', error);
    return [];
  }
}

export async function getMySeasonProgress(studentId: string, seasonId: string): Promise<SeasonProgress> {
  try {
    if (isMock()) {
      const { mockGetMySeasonProgress } = await import('@/lib/mocks/seasons.mock');
      return mockGetMySeasonProgress(studentId, seasonId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('season_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('season_id', seasonId)
      .single();

    if (error || !data) {
      console.warn('[getMySeasonProgress] Supabase error:', error?.message);
      return { season_id: seasonId, student_id: studentId, season_points: 0, rank: 0, tier: 'bronze', achievements_this_season: [], streak_this_season: 0, classes_attended_this_season: 0 };
    }

    return {
      season_id: String(data.season_id),
      student_id: String(data.student_id),
      season_points: Number(data.season_points ?? 0),
      rank: Number(data.rank ?? 0),
      tier: (data.tier ?? 'bronze') as SeasonTier,
      achievements_this_season: (data.achievements_this_season ?? []) as string[],
      streak_this_season: Number(data.streak_this_season ?? 0),
      classes_attended_this_season: Number(data.classes_attended_this_season ?? 0),
    };
  } catch (error) {
    console.warn('[getMySeasonProgress] Fallback:', error);
    return { season_id: seasonId, student_id: studentId, season_points: 0, rank: 0, tier: 'bronze', achievements_this_season: [], streak_this_season: 0, classes_attended_this_season: 0 };
  }
}
