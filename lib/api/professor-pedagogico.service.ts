import { isMock } from '@/lib/env';
import type { BeltLevel, EvaluationCriteria, Evaluation, Progression } from '@/lib/types';

export interface ProgressoDTO {
  student_id: string;
  display_name: string;
  belt: BeltLevel;
  total_aulas: number;
  avaliacoes: EvaluationDTO[];
  historico_faixas: ProgressionDTO[];
}

export interface EvaluationDTO {
  id: string;
  class_id: string;
  criteria: EvaluationCriteria;
  score: number;
  date: string;
  professor_name: string;
}

export interface ProgressionDTO {
  id: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  date: string;
  evaluated_by_name: string;
}

export interface StudentWithProgress {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  total_aulas: number;
  media_avaliacoes: number;
}

export async function getProgressoAluno(studentId: string): Promise<ProgressoDTO> {
  try {
    if (isMock()) {
      const { mockGetProgressoAluno } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockGetProgressoAluno(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error || !data) {
      console.error('[getProgressoAluno] Supabase error:', error?.message);
      return {} as ProgressoDTO;
    }
    return data as unknown as ProgressoDTO;
  } catch (error) {
    console.error('[getProgressoAluno] Fallback:', error);
    return {} as ProgressoDTO;
  }
}

export async function avaliar(studentId: string, classId: string, criteria: EvaluationCriteria, score: number): Promise<Evaluation> {
  try {
    if (isMock()) {
      const { mockAvaliar } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockAvaliar(studentId, classId, criteria, score);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('evaluations')
      .insert({ student_id: studentId, class_id: classId, criteria, score })
      .select()
      .single();
    if (error || !data) {
      console.error('[avaliar] Supabase error:', error?.message);
      return {} as Evaluation;
    }
    return data as unknown as Evaluation;
  } catch (error) {
    console.error('[avaliar] Fallback:', error);
    return {} as Evaluation;
  }
}

export async function promoverFaixa(studentId: string, toBelt: BeltLevel): Promise<Progression> {
  try {
    if (isMock()) {
      const { mockPromoverFaixa } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockPromoverFaixa(studentId, toBelt);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('progressions')
      .insert({ student_id: studentId, to_belt: toBelt })
      .select()
      .single();
    if (error || !data) {
      console.error('[promoverFaixa] Supabase error:', error?.message);
      return {} as Progression;
    }
    return data as unknown as Progression;
  } catch (error) {
    console.error('[promoverFaixa] Fallback:', error);
    return {} as Progression;
  }
}

export async function getAlunosDaTurma(classId: string): Promise<StudentWithProgress[]> {
  try {
    if (isMock()) {
      const { mockGetAlunosDaTurma } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockGetAlunosDaTurma(classId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('class_students')
      .select('*, profiles(display_name, avatar, belt)')
      .eq('class_id', classId);
    if (error || !data) {
      console.error('[getAlunosDaTurma] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as StudentWithProgress[];
  } catch (error) {
    console.error('[getAlunosDaTurma] Fallback:', error);
    return [];
  }
}
