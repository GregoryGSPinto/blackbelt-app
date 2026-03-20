import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import type { PlayerProfile, LeaderboardEntry, Badge } from '@/lib/types/gamification';

export async function getPlayerProfile(userId: string): Promise<PlayerProfile> {
  try {
    if (isMock()) {
      const { mockGetPlayerProfile } = await import('@/lib/mocks/gamification.mock');
      return mockGetPlayerProfile(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch player XP data
    const { data: xpData, error: xpError } = await supabase
      .from('gamification_xp')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (xpError || !xpData) {
      console.warn('[getPlayerProfile] No XP data found, returning defaults');
      return {
        userId,
        name: '',
        role: 'student',
        totalXP: 0,
        level: 1,
        levelName: 'Faixa Branca Lv.1',
        xpForNextLevel: 100,
        xpProgress: 0,
        streak: 0,
        badges: [],
        rank: 0,
      };
    }

    // Fetch badges for this user
    const { data: badgeRows } = await supabase
      .from('gamification_badges')
      .select('*')
      .eq('user_id', userId);

    const badges: Badge[] = (badgeRows ?? []).map((b: Record<string, unknown>) => ({
      id: String(b.id ?? ''),
      name: String(b.name ?? ''),
      description: String(b.description ?? ''),
      icon: String(b.icon ?? ''),
      unlocked: Boolean(b.unlocked),
      unlockedAt: b.unlocked_at ? String(b.unlocked_at) : null,
      progress: Number(b.progress ?? 0),
      requirement: Number(b.requirement ?? 0),
      current: Number(b.current ?? 0),
      category: (b.category as Badge['category']) ?? 'achievement',
    }));

    const { getLevelInfo } = await import('@/lib/types/gamification');
    const levelInfo = getLevelInfo(Number(xpData.total_xp ?? 0));

    return {
      userId,
      name: String(xpData.name ?? ''),
      role: (xpData.role as 'student' | 'professor') ?? 'student',
      totalXP: Number(xpData.total_xp ?? 0),
      level: levelInfo.level,
      levelName: levelInfo.name,
      xpForNextLevel: levelInfo.xpForNext,
      xpProgress: levelInfo.progress,
      streak: Number(xpData.streak ?? 0),
      badges,
      rank: Number(xpData.rank ?? 0),
    };
  } catch (error) {
    console.warn('[getPlayerProfile] Fallback:', error);
    return {
      userId,
      name: '',
      role: 'student',
      totalXP: 0,
      level: 1,
      levelName: 'Faixa Branca Lv.1',
      xpForNextLevel: 100,
      xpProgress: 0,
      streak: 0,
      badges: [],
      rank: 0,
    };
  }
}

export async function getLeaderboard(
  academyId: string,
  classId?: string,
): Promise<LeaderboardEntry[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/gamification.mock');
      return mockGetLeaderboard(academyId, classId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('gamification_xp')
      .select('user_id, name, total_xp, rank, badge_count')
      .eq('academy_id', academyId)
      .order('total_xp', { ascending: false })
      .limit(50);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[getLeaderboard] Supabase error:', error.message);
      return [];
    }

    const { getLevelInfo } = await import('@/lib/types/gamification');

    return (data ?? []).map((row: Record<string, unknown>, idx: number) => {
      const xp = Number(row.total_xp ?? 0);
      const info = getLevelInfo(xp);
      return {
        rank: idx + 1,
        userId: String(row.user_id ?? ''),
        name: String(row.name ?? ''),
        totalXP: xp,
        level: info.level,
        levelName: info.name,
        badges: Number(row.badge_count ?? 0),
      };
    });
  } catch (error) {
    console.warn('[getLeaderboard] Fallback:', error);
    return [];
  }
}

export async function getAllBadges(): Promise<Badge[]> {
  try {
    if (isMock()) {
      const { mockGetAllBadges } = await import('@/lib/mocks/gamification.mock');
      return mockGetAllBadges();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('gamification_badge_definitions')
      .select('*')
      .order('name');

    if (error) {
      console.warn('[getAllBadges] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((b: Record<string, unknown>) => ({
      id: String(b.id ?? ''),
      name: String(b.name ?? ''),
      description: String(b.description ?? ''),
      icon: String(b.icon ?? ''),
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: Number(b.requirement ?? 0),
      current: 0,
      category: (b.category as Badge['category']) ?? 'achievement',
    }));
  } catch (error) {
    console.warn('[getAllBadges] Fallback:', error);
    return [];
  }
}

export async function awardXP(
  userId: string,
  eventType: string,
  amount: number,
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Award XP', { amount, userId, eventType });
      return { newTotal: 1250 + amount, levelUp: false, newLevel: 13 };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Call an RPC that atomically awards XP and returns updated totals
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_event_type: eventType,
      p_amount: amount,
    });

    if (error || !data) {
      console.warn('[awardXP] Supabase RPC error:', error?.message);
      return { newTotal: amount, levelUp: false, newLevel: 1 };
    }

    return {
      newTotal: Number(data.new_total ?? amount),
      levelUp: Boolean(data.level_up),
      newLevel: Number(data.new_level ?? 1),
    };
  } catch (error) {
    console.warn('[awardXP] Fallback:', error);
    return { newTotal: amount, levelUp: false, newLevel: 1 };
  }
}
