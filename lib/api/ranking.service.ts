import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { RankedStudent } from '@/lib/api/xp.service';

export async function getByAcademia(academyId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
  } catch (error) {
    handleServiceError(error, 'ranking.byAcademia');
  }
}

export async function getByTurma(classId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(classId);
    }
    // API not yet implemented — use mock
    const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(classId);
  } catch (error) {
    handleServiceError(error, 'ranking.byTurma');
  }
}
