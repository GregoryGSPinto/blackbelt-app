import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/responsavel/jornada/${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.jornada');
      return res.json();
    } catch {
      console.warn('[responsavel-jornada.getJornadaDependente] API not available, using mock fallback');
      const { mockGetJornadaDependente } = await import('@/lib/mocks/responsavel-jornada.mock');
      return mockGetJornadaDependente(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'responsavel.jornada');
  }
}
