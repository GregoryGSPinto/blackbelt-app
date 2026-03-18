import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface DesafioTeen {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'diario' | 'semanal' | 'mensal' | 'especial';
  xp_reward: number;
  progress: number;
  target: number;
  completed: boolean;
  completed_at: string | null;
  expires_at: string;
}

export interface DesafiosOverview {
  active: DesafioTeen[];
  completed: DesafioTeen[];
  total_xp_earned: number;
  streak_bonus: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getDesafios(studentId: string): Promise<DesafiosOverview> {
  try {
    if (isMock()) {
      const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
      return mockGetDesafios(studentId);
    }
    try {
      const res = await fetch(`/api/teen/desafios?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'teen.desafios');
      return res.json();
    } catch {
      console.warn('[teen-desafios.getDesafios] API not available, using mock fallback');
      const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
      return mockGetDesafios(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'teen.desafios');
  }
}

export async function claimReward(desafioId: string): Promise<{ xp_earned: number }> {
  try {
    if (isMock()) {
      const { mockClaimReward } = await import('@/lib/mocks/teen-desafios.mock');
      return mockClaimReward(desafioId);
    }
    try {
      const res = await fetch(`/api/teen/desafios/${desafioId}/claim`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'teen.desafios.claim');
      return res.json();
    } catch {
      console.warn('[teen-desafios.claimReward] API not available, using mock fallback');
      const { mockClaimReward } = await import('@/lib/mocks/teen-desafios.mock');
      return mockClaimReward(desafioId);
    }
  } catch (error) {
    handleServiceError(error, 'teen.desafios.claim');
  }
}
