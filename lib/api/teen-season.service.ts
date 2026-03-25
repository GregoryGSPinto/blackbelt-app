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
    const EMPTY: TeenSeasonPass = { season: { id: '', name: '', theme: '', start_date: '', end_date: '', days_remaining: 0 }, my_progress: { points: 0, rank: 0, tier: 'bronze', next_tier_at: 0, achievements_count: 0 }, rewards: [], leaderboard: [] };

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const now = new Date();
      // Season = current quarter
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
      const daysRemaining = Math.max(0, Math.ceil((quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const quarterNames = ['Temporada 1', 'Temporada 2', 'Temporada 3', 'Temporada 4'];
      const quarterIndex = Math.floor(now.getMonth() / 3);

      const season: SeasonInfo = {
        id: `season-${now.getFullYear()}-Q${quarterIndex + 1}`,
        name: quarterNames[quarterIndex],
        theme: 'bjj',
        start_date: quarterStart.toISOString().split('T')[0],
        end_date: quarterEnd.toISOString().split('T')[0],
        days_remaining: daysRemaining,
      };

      // Parallel queries: XP for this student, XP for all students in season, achievements for this student, reward definitions
      const [myXpRes, allXpRes, myAchRes, rewardDefsRes] = await Promise.all([
        supabase.from('xp_ledger')
          .select('amount')
          .eq('student_id', studentId)
          .gte('created_at', quarterStart.toISOString()),
        supabase.from('xp_ledger')
          .select('student_id, amount, students!inner(profiles!students_profile_id_fkey(display_name, avatar))')
          .gte('created_at', quarterStart.toISOString()),
        supabase.from('achievements')
          .select('id, type, granted_at')
          .eq('student_id', studentId)
          .gte('granted_at', quarterStart.toISOString()),
        supabase.from('achievement_definitions')
          .select('id, name, description, category, target')
          .eq('category', 'season_reward'),
      ]);

      // My points
      const myPoints = (myXpRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);

      // Tier calculation
      const getTier = (pts: number): 'bronze' | 'silver' | 'gold' | 'diamond' => {
        if (pts >= 1000) return 'diamond';
        if (pts >= 500) return 'gold';
        if (pts >= 200) return 'silver';
        return 'bronze';
      };
      const tierThresholds = { bronze: 200, silver: 500, gold: 1000, diamond: Infinity };
      const myTier = getTier(myPoints);
      const nextTierAt = tierThresholds[myTier] === Infinity ? myPoints : tierThresholds[myTier];

      // Leaderboard
      const xpByStudent = new Map<string, { points: number; name: string; avatar: string | null }>();
      for (const row of (allXpRes.data ?? []) as Record<string, unknown>[]) {
        const sid = String(row.student_id ?? '');
        const amt = Number(row.amount ?? 0);
        const s = row.students as Record<string, unknown> | null;
        const p = s?.profiles as Record<string, unknown> | null;
        const entry = xpByStudent.get(sid) ?? { points: 0, name: (p?.display_name ?? '') as string, avatar: (p?.avatar ?? null) as string | null };
        entry.points += amt;
        xpByStudent.set(sid, entry);
      }
      const sorted = Array.from(xpByStudent.entries()).sort((a, b) => b[1].points - a[1].points);
      const leaderboard: SeasonRankEntry[] = sorted.slice(0, 20).map(([sid, info], idx) => ({
        rank: idx + 1,
        student_name: info.name,
        avatar: info.avatar,
        points: info.points,
        tier: getTier(info.points),
        is_current_user: sid === studentId,
      }));
      const myRank = sorted.findIndex(([sid]) => sid === studentId) + 1;

      // Achievements count
      const achievementsCount = (myAchRes.data ?? []).length;

      // Rewards
      const earnedAchTypes = new Set((myAchRes.data ?? []).map((a: Record<string, unknown>) => String(a.type)));
      const rewards: SeasonReward[] = (rewardDefsRes.data ?? []).map((d: Record<string, unknown>) => {
        const tierReq = getTier(Number(d.target ?? 0));
        const unlocked = myPoints >= (Number(d.target ?? 0));
        return {
          id: String(d.id ?? ''),
          tier_required: tierReq,
          name: String(d.name ?? ''),
          description: String(d.description ?? ''),
          unlocked,
          claimed: earnedAchTypes.has(String(d.id)),
        };
      });

      return {
        season,
        my_progress: {
          points: myPoints,
          rank: myRank,
          tier: myTier,
          next_tier_at: nextTierAt,
          achievements_count: achievementsCount,
        },
        rewards,
        leaderboard,
      };
    } catch (err) {
      console.error('[getTeenSeasonPass] Supabase error, returning fallback:', err);
      return EMPTY;
    }
  } catch (error) {
    console.error('[getTeenSeasonPass] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get current user's student ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[claimSeasonReward] No authenticated user');
        return;
      }

      // Get the student record for this user
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle();

      if (!student) {
        console.error('[claimSeasonReward] No student record found');
        return;
      }

      // Insert into achievements to mark the reward as claimed
      const { error } = await supabase
        .from('achievements')
        .insert({
          student_id: student.id,
          type: 'custom',
          granted_at: new Date().toISOString(),
          granted_by: user.id,
        });

      if (error) {
        console.error('[claimSeasonReward] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[claimSeasonReward] Supabase error, using fallback:', err);
    }
  } catch (error) {
    console.error('[claimSeasonReward] Fallback:', error);
  }
}
