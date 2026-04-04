import { isMock } from '@/lib/env';
import type { RankedStudent } from '@/lib/api/xp.service';
import { logServiceError } from '@/lib/api/errors';

export async function getByAcademia(academyId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_xp')
      .select('*')
      .eq('academy_id', academyId)
      .order('total_xp', { ascending: false })
      .limit(50);
    if (error) {
      logServiceError(error, 'ranking');
      return [];
    }
    return (data ?? []) as unknown as RankedStudent[];
  } catch (error) {
    logServiceError(error, 'ranking');
    return [];
  }
}

export async function getByTurma(classId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(classId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_xp')
      .select('*')
      .eq('class_id', classId)
      .order('total_xp', { ascending: false })
      .limit(50);
    if (error) {
      logServiceError(error, 'ranking');
      return [];
    }
    return (data ?? []) as unknown as RankedStudent[];
  } catch (error) {
    logServiceError(error, 'ranking');
    return [];
  }
}
