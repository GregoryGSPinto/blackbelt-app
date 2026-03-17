import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    if (error) throw new ServiceError(500, 'evaluation.getStudents', error.message);

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
    handleServiceError(error, 'evaluation.getEvaluableStudents');
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
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new ServiceError(500, 'evaluation.timeline', error.message);

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
      comment: (row.comment ?? '') as string,
      created_at: row.created_at as string,
    }));

    return {
      student_id: studentId,
      student_name: evaluations[0]?.student_name ?? '',
      evaluations,
    };
  } catch (error) {
    handleServiceError(error, 'evaluation.getStudentEvaluationTimeline');
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
    if (!user) throw new ServiceError(401, 'evaluation.create', 'Nao autenticado');

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
        comment: payload.comment,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) throw new ServiceError(500, 'evaluation.create', error?.message ?? 'Erro ao salvar');

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
      comment: (data.comment ?? '') as string,
      created_at: data.created_at as string,
    };
  } catch (error) {
    handleServiceError(error, 'evaluation.createEvaluation');
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

    if (error) throw new ServiceError(500, 'evaluation.classes', error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const modality = row.modalities as Record<string, unknown>;
      return {
        class_id: row.id as string,
        class_name: (modality?.name ?? 'Turma') as string,
      };
    });
  } catch (error) {
    handleServiceError(error, 'evaluation.getProfessorClasses');
  }
}
