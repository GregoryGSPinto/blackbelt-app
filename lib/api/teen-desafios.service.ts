import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    // API not yet implemented — use mock
    const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
      return mockGetDesafios(studentId);
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
    // API not yet implemented — use mock
    const { mockClaimReward } = await import('@/lib/mocks/teen-desafios.mock');
      return mockClaimReward(desafioId);
  } catch (error) {
    handleServiceError(error, 'teen.desafios.claim');
  }
}
