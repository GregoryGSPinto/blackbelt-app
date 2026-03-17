import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    try {
      const res = await fetch(`/api/xp?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'xp.get');
      return res.json();
    } catch {
      console.warn('[xp.getXP] API not available, using fallback');
      return {} as XPDTO;
    }
  } catch (error) {
    handleServiceError(error, 'xp.get');
  }
}

export async function getLeaderboard(academyId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
    }
    try {
      const res = await fetch(`/api/xp/leaderboard?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'xp.leaderboard');
      return res.json();
    } catch {
      console.warn('[xp.getLeaderboard] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'xp.leaderboard');
  }
}
