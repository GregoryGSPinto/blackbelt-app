import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { RankedStudent } from '@/lib/api/xp.service';

export async function getByAcademia(academyId: string): Promise<RankedStudent[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/xp.mock');
      return mockGetLeaderboard(academyId);
    }
    const res = await fetch(`/api/ranking?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'ranking.byAcademia');
    return res.json();
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
    const res = await fetch(`/api/ranking/turma?classId=${classId}`);
    if (!res.ok) throw new ServiceError(res.status, 'ranking.byTurma');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'ranking.byTurma');
  }
}
