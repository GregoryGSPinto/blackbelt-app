import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface JornadaMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'belt' | 'achievement' | 'streak' | 'competition' | 'special';
  emoji: string;
}

export interface JornadaDependente {
  student_id: string;
  display_name: string;
  belt: string;
  belt_label: string;
  started_at: string;
  total_classes: number;
  total_days: number;
  milestones: JornadaMilestone[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getJornadaDependente(studentId: string): Promise<JornadaDependente> {
  try {
    if (isMock()) {
      const { mockGetJornadaDependente } = await import('@/lib/mocks/responsavel-jornada.mock');
      return mockGetJornadaDependente(studentId);
    }
    // API not yet implemented — use mock
    const { mockGetJornadaDependente } = await import('@/lib/mocks/responsavel-jornada.mock');
      return mockGetJornadaDependente(studentId);
  } catch (error) {
    handleServiceError(error, 'responsavel.jornada');
  }
}
