import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types';

export interface XPDTO {
  xp: number;
  level: number;
  nextLevelXP: number;
  rank: number;
}

export interface RankedStudent {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  xp: number;
  level: number;
  rank: number;
}

export async function getXP(studentId: string): Promise<XPDTO> {
  try {
    if (isMock()) {
      const { mockGetXP } = await import('@/lib/mocks/xp.mock');
      return mockGetXP(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('student_xp')
      .select('xp, level, next_level_xp, rank')
      .eq('student_id', studentId)
      .single();

    if (error || !data) {
      console.warn('[getXP] Supabase error:', error?.message);
      return { xp: 0, level: 1, nextLevelXP: 100, rank: 0 };
    }

    return {
      xp: data.xp ?? 0,
      level: data.level ?? 1,
      nextLevelXP: data.next_level_xp ?? 100,
      rank: data.rank ?? 0,
    };
  } catch (error) {
    console.warn('[getXP] Fallback:', error);
    return { xp: 0, level: 1, nextLevelXP: 100, rank: 0 };
  }
}

export async function getLeaderboard(academyId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('student_xp')
      .select('student_id, display_name, avatar, belt, xp, level, rank')
      .eq('academy_id', academyId)
      .order('xp', { ascending: false })
      .limit(50);

    if (error || !data) {
      console.warn('[getLeaderboard] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      student_id: String(row.student_id ?? ''),
      display_name: String(row.display_name ?? ''),
      avatar: row.avatar ? String(row.avatar) : null,
      belt: (row.belt ?? 'branca') as BeltLevel,
      xp: Number(row.xp ?? 0),
      level: Number(row.level ?? 1),
      rank: Number(row.rank ?? 0),
    }));
  } catch (error) {
    console.warn('[getLeaderboard] Fallback:', error);
    return [];
  }
}
