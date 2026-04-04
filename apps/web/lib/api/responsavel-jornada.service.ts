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

const BELT_LABELS: Record<string, string> = {
  white: 'Faixa Branca',
  gray: 'Faixa Cinza',
  yellow: 'Faixa Amarela',
  orange: 'Faixa Laranja',
  green: 'Faixa Verde',
  blue: 'Faixa Azul',
  purple: 'Faixa Roxa',
  brown: 'Faixa Marrom',
  black: 'Faixa Preta',
};

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

    // Try denormalized table first
    const { data, error } = await supabase
      .from('student_journeys')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!error && data) {
      return data as unknown as JornadaDependente;
    }

    // Fallback: build from students + attendance + progressions
    return await buildJornadaFromTables(supabase, studentId);
  } catch (error) {
    logServiceError(error, 'responsavel-jornada');
    return {
      student_id: studentId,
      display_name: '',
      belt: 'white',
      belt_label: 'Faixa Branca',
      started_at: new Date().toISOString(),
      total_classes: 0,
      total_days: 0,
      milestones: [],
    };
  }
}

async function buildJornadaFromTables(
  supabase: ReturnType<Awaited<typeof import('@/lib/supabase/client')>['createBrowserClient']>,
  studentId: string,
): Promise<JornadaDependente> {
  // 1. Get student info
  const { data: student } = await supabase
    .from('students')
    .select('id, profile_id, belt, started_at')
    .eq('id', studentId)
    .maybeSingle();

  if (!student) {
    return {
      student_id: studentId,
      display_name: '',
      belt: 'white',
      belt_label: 'Faixa Branca',
      started_at: new Date().toISOString(),
      total_classes: 0,
      total_days: 0,
      milestones: [],
    };
  }

  const s = student as Record<string, unknown>;

  // 2. Get profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', s.profile_id as string)
    .maybeSingle();

  // 3. Get total attendance count
  const { count: totalClasses } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId);

  // 4. Get belt progressions as milestones
  const milestones: JornadaMilestone[] = [];

  const { data: progressions } = await supabase
    .from('progressions')
    .select('id, from_belt, to_belt, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (progressions) {
    for (const p of (progressions as Array<{ id: string; from_belt: string; to_belt: string; created_at: string }>)) {
      milestones.push({
        id: p.id,
        title: `Promovido a ${BELT_LABELS[p.to_belt] ?? p.to_belt}`,
        description: `Avancou de ${BELT_LABELS[p.from_belt] ?? p.from_belt} para ${BELT_LABELS[p.to_belt] ?? p.to_belt}`,
        date: p.created_at,
        type: 'belt',
        emoji: '🥋',
      });
    }
  }

  const belt = (s.belt as string) ?? 'white';
  const startedAt = (s.started_at as string) ?? new Date().toISOString();
  const totalDays = Math.floor((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24));

  return {
    student_id: studentId,
    display_name: (profile as Record<string, unknown>)?.display_name as string ?? '',
    belt,
    belt_label: BELT_LABELS[belt] ?? 'Faixa Branca',
    started_at: startedAt,
    total_classes: totalClasses ?? 0,
    total_days: totalDays,
    milestones,
  };
}
