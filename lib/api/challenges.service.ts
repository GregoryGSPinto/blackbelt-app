import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type ChallengeType = 'presenca' | 'streak' | 'social' | 'conteudo' | 'avaliacao';

export interface ChallengeDTO {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  reward: string;
  badge?: string;
  active: boolean;
  participantCount: number;
}

export async function listChallenges(academyId: string): Promise<ChallengeDTO[]> {
  try {
    if (isMock()) {
      const { mockListChallenges } = await import('@/lib/mocks/challenges.mock');
      return mockListChallenges(academyId);
    }
    try {
      const res = await fetch(`/api/challenges?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'challenges.list');
      return res.json();
    } catch {
      console.warn('[challenges.listChallenges] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'challenges.list'); }
}

export async function createChallenge(academyId: string, data: Omit<ChallengeDTO, 'id' | 'progress' | 'participantCount'>): Promise<ChallengeDTO> {
  try {
    if (isMock()) {
      const { mockCreateChallenge } = await import('@/lib/mocks/challenges.mock');
      return mockCreateChallenge(academyId, data);
    }
    try {
      const res = await fetch(`/api/challenges`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...data }) });
      if (!res.ok) throw new ServiceError(res.status, 'challenges.create');
      return res.json();
    } catch {
      console.warn('[challenges.createChallenge] API not available, using fallback');
      return {} as ChallengeDTO;
    }
  } catch (error) { handleServiceError(error, 'challenges.create'); }
}
