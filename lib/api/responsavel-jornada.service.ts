import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_journeys')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'responsavel-jornada');
      const { mockGetJornadaDependente } = await import('@/lib/mocks/responsavel-jornada.mock');
      return mockGetJornadaDependente(studentId);
    }
    return data as unknown as JornadaDependente;
  } catch (error) {
    logServiceError(error, 'responsavel-jornada');
    const { mockGetJornadaDependente } = await import('@/lib/mocks/responsavel-jornada.mock');
    return mockGetJornadaDependente(studentId);
  }
}
