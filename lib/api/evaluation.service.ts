import { isMock } from '@/lib/env';
import type {
  StudentEvaluation,
  EvaluableStudent,
  CreateEvaluationPayload,
  EvaluationTimeline,
} from '@/lib/types/evaluation';

// ── Service Functions ────────────────────────────────────────────────

/**
 * Lista alunos avaliáveis pelo professor, opcionalmente filtrados por turma.
 */
export async function getEvaluableStudents(
  professorId: string,
  classId?: string,
): Promise<EvaluableStudent[]> {
  try {
    if (isMock()) {
      const { mockGetEvaluableStudents } = await import('@/lib/mocks/evaluation.mock');
      return mockGetEvaluableStudents(professorId, classId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('class_enrollments')
      .select(`
        student_id,
        class_id,
        classes!inner(id, professor_id, modalities(name)),
        students!inner(id, belt, profiles!inner(display_name, avatar))
      `)
      .eq('classes.professor_id', professorId)
      .eq('status', 'active');

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[getEvaluableStudents] Supabase error:', error.message);
      return [];
    }

    const students: EvaluableStudent[] = (data ?? []).map((row: Record<string, unknown>) => {
      const student = row.students as Record<string, unknown>;
      const profile = student.profiles as Record<string, unknown>;
      const cls = row.classes as Record<string, unknown>;
      const modality = cls.modalities as Record<string, unknown>;

      return {
        student_id: row.student_id as string,
        display_name: (profile.display_name ?? '') as string,
        avatar: (profile.avatar ?? null) as string | null,
        belt: student.belt as string,
        class_id: row.class_id as string,
        class_name: (modality.name ?? '') as string,
        last_evaluation_date: null,
        evaluation_count: 0,
      };
    });

    return students;
  } catch (error) {
    console.error('[getEvaluableStudents] Fallback:', error);
    return [];
  }
}

/**
 * Busca timeline de avaliacoes de um aluno.
 */
export async function getStudentEvaluationTimeline(
  studentId: string,
): Promise<EvaluationTimeline> {
  try {
    if (isMock()) {
      const { mockGetStudentEvaluationTimeline } = await import('@/lib/mocks/evaluation.mock');
      return mockGetStudentEvaluationTimeline(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('student_evaluations')
      .select('id, student_id, student_name, professor_id, class_id, technique, posture, evolution, behavior, conditioning, theory, discipline, comment, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getStudentEvaluationTimeline] Supabase error:', error.message);
      return { student_id: studentId, student_name: '', evaluations: [] };
    }

    const evaluations: StudentEvaluation[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      student_id: row.student_id as string,
      student_name: (row.student_name ?? '') as string,
      professor_id: (row.professor_id ?? '') as string,
      class_id: (row.class_id ?? '') as string,
      technique: row.technique as number,
      posture: row.posture as number,
      evolution: row.evolution as number,
      behavior: row.behavior as number,
      conditioning: (row.conditioning as number) ?? 5,
      theory: (row.theory as number) ?? 5,
      discipline: (row.discipline as number) ?? 5,
      comment: (row.comment ?? '') as string,
      created_at: row.created_at as string,
    }));

    return {
      student_id: studentId,
      student_name: evaluations[0]?.student_name ?? '',
      evaluations,
    };
  } catch (error) {
    console.error('[getStudentEvaluationTimeline] Fallback:', error);
    return { student_id: studentId, student_name: '', evaluations: [] };
  }
}

/**
 * Salva uma nova avaliacao.
 */
export async function createEvaluation(
  payload: CreateEvaluationPayload,
): Promise<StudentEvaluation> {
  try {
    if (isMock()) {
      const { mockCreateEvaluation } = await import('@/lib/mocks/evaluation.mock');
      return mockCreateEvaluation(payload);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[createEvaluation] Not authenticated');
      return {} as StudentEvaluation;
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('student_evaluations')
      .insert({
        student_id: payload.student_id,
        professor_id: user.id,
        class_id: payload.class_id,
        technique: payload.technique,
        posture: payload.posture,
        evolution: payload.evolution,
        behavior: payload.behavior,
        conditioning: payload.conditioning,
        theory: payload.theory,
        discipline: payload.discipline,
        comment: payload.comment,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[createEvaluation] Supabase error:', error?.message ?? 'No data');
      return {} as StudentEvaluation;
    }

    return {
      id: data.id as string,
      student_id: data.student_id as string,
      student_name: '',
      professor_id: data.professor_id as string,
      class_id: data.class_id as string,
      technique: data.technique as number,
      posture: data.posture as number,
      evolution: data.evolution as number,
      behavior: data.behavior as number,
      conditioning: (data.conditioning as number) ?? 5,
      theory: (data.theory as number) ?? 5,
      discipline: (data.discipline as number) ?? 5,
      comment: (data.comment ?? '') as string,
      created_at: data.created_at as string,
    };
  } catch (error) {
    console.error('[createEvaluation] Fallback:', error);
    return {} as StudentEvaluation;
  }
}

/**
 * Lista turmas do professor (para filtro).
 */
export async function getProfessorClasses(
  professorId: string,
): Promise<Array<{ class_id: string; class_name: string }>> {
  try {
    if (isMock()) {
      const { mockGetProfessorClasses } = await import('@/lib/mocks/evaluation.mock');
      return mockGetProfessorClasses(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('classes')
      .select('id, modalities(name)')
      .eq('professor_id', professorId);

    if (error) {
      console.error('[getProfessorClasses] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const modality = row.modalities as Record<string, unknown>;
      return {
        class_id: row.id as string,
        class_name: (modality?.name ?? 'Turma') as string,
      };
    });
  } catch (error) {
    console.error('[getProfessorClasses] Fallback:', error);
    return [];
  }
}
