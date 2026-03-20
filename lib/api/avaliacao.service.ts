import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import type { BeltLevel } from '@/lib/types';

// ── DTOs ─────────────────────────────────────────────────────────────

export interface StudentForEvaluationDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  total_classes: number;
  last_evaluation_date: string | null;
  academy_id: string;
  started_at: string;
  attendance_count: number;
}

export interface EvaluationRecordDTO {
  id: string;
  date: string;
  professor_name: string;
  tecnica: number;
  disciplina: number;
  evolucao: number;
  consistencia: number;
  observations: string;
}

export interface VideoRecommendationDTO {
  id: string;
  title: string;
  url: string;
  belt_level: BeltLevel;
  duration: number;
  criteria: string;
}

export interface EvaluationHistoryDTO {
  records: EvaluationRecordDTO[];
  recommendations: VideoRecommendationDTO[];
}

export interface SaveEvaluationPayload {
  student_id: string;
  academy_id: string;
  tecnica: number;
  disciplina: number;
  evolucao: number;
  consistencia: number;
  observations: string;
}

export interface SaveEvaluationResultDTO {
  id: string;
  student_id: string;
  date: string;
  tecnica: number;
  disciplina: number;
  evolucao: number;
  consistencia: number;
  observations: string;
  notification_sent: boolean;
}

// ── Service Functions ────────────────────────────────────────────────

export async function getStudentForEvaluation(studentId: string): Promise<StudentForEvaluationDTO> {
  try {
    if (isMock()) {
      const { mockGetStudentForEvaluation } = await import('@/lib/mocks/avaliacao.mock');
      return mockGetStudentForEvaluation(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get student with profile, belt, class count, and last evaluation
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        belt,
        academy_id,
        started_at,
        profiles!inner(display_name, avatar)
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      console.warn('[getStudentForEvaluation] Supabase error:', studentError?.message ?? 'Not found');
      return { student_id: studentId, display_name: '', avatar: null, belt: 'white' as BeltLevel, total_classes: 0, last_evaluation_date: null, academy_id: '', started_at: '', attendance_count: 0 };
    }

    // Count total attendance
    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    // Get last evaluation date
    const { data: lastEval } = await supabase
      .from('evaluations')
      .select('created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1);

    const profiles = student.profiles as Record<string, unknown>;

    return {
      student_id: student.id as string,
      display_name: (profiles.display_name ?? '') as string,
      avatar: (profiles.avatar ?? null) as string | null,
      belt: student.belt as BeltLevel,
      total_classes: attendanceCount ?? 0,
      last_evaluation_date: lastEval?.[0]?.created_at ?? null,
      academy_id: student.academy_id as string,
      started_at: student.started_at as string,
      attendance_count: attendanceCount ?? 0,
    };
  } catch (error) {
    console.warn('[getStudentForEvaluation] Fallback:', error);
    return { student_id: studentId, display_name: '', avatar: null, belt: 'white' as BeltLevel, total_classes: 0, last_evaluation_date: null, academy_id: '', started_at: '', attendance_count: 0 };
  }
}

export async function getEvaluationHistory(studentId: string): Promise<EvaluationHistoryDTO> {
  try {
    if (isMock()) {
      const { mockGetEvaluationHistory } = await import('@/lib/mocks/avaliacao.mock');
      return mockGetEvaluationHistory(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get all evaluations grouped by date
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        criteria,
        score,
        created_at,
        observations,
        profiles!evaluations_professor_id_fkey(display_name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[getEvaluationHistory] Supabase error:', error.message);
      return { records: [], recommendations: [] };
    }

    // Group evaluations by date into records
    const dateMap = new Map<string, EvaluationRecordDTO>();
    for (const ev of evaluations ?? []) {
      const dateKey = new Date(ev.created_at).toISOString().split('T')[0];
      const profiles = ev.profiles as Record<string, unknown> | null;
      const profName = (profiles?.display_name ?? '') as string;

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          id: ev.id,
          date: dateKey,
          professor_name: profName,
          tecnica: 0,
          disciplina: 0,
          evolucao: 0,
          consistencia: 0,
          observations: (ev.observations ?? '') as string,
        });
      }

      const record = dateMap.get(dateKey)!;
      const criteria = ev.criteria as string;
      const score = ev.score as number;

      if (criteria === 'technique') record.tecnica = score;
      else if (criteria === 'discipline') record.disciplina = score;
      else if (criteria === 'evolution') record.evolucao = score;
      else if (criteria === 'attendance') record.consistencia = score;
    }

    const records = [...dateMap.values()];

    // Get student's belt to recommend appropriate videos
    const { data: student } = await supabase
      .from('students')
      .select('belt, academy_id')
      .eq('id', studentId)
      .single();

    // Get video recommendations for weakest areas
    let recommendations: VideoRecommendationDTO[] = [];
    if (student) {
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, url, belt_level, duration')
        .eq('academy_id', student.academy_id)
        .lte('belt_level', student.belt)
        .limit(5);

      recommendations = (videos ?? []).map((v: Record<string, unknown>) => ({
        id: v.id as string,
        title: v.title as string,
        url: `/conteudo/${v.id}`,
        belt_level: v.belt_level as BeltLevel,
        duration: v.duration as number,
        criteria: 'tecnica',
      }));
    }

    return { records, recommendations };
  } catch (error) {
    console.warn('[getEvaluationHistory] Fallback:', error);
    return { records: [], recommendations: [] };
  }
}

export async function saveEvaluation(data: SaveEvaluationPayload): Promise<SaveEvaluationResultDTO> {
  try {
    if (isMock()) {
      const { mockSaveEvaluation } = await import('@/lib/mocks/avaliacao.mock');
      return mockSaveEvaluation(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[saveEvaluation] Not authenticated');
      return { id: '', student_id: data.student_id, date: '', tecnica: 0, disciplina: 0, evolucao: 0, consistencia: 0, observations: '', notification_sent: false };
    }

    const now = new Date().toISOString();

    // Insert 4 evaluation criteria
    const entries = [
      { criteria: 'technique', score: data.tecnica },
      { criteria: 'discipline', score: data.disciplina },
      { criteria: 'evolution', score: data.evolucao },
      { criteria: 'attendance', score: data.consistencia },
    ];

    const { error: insertError } = await supabase
      .from('evaluations')
      .insert(
        entries.map((e) => ({
          student_id: data.student_id,
          professor_id: user.id,
          criteria: e.criteria,
          score: e.score,
          observations: data.observations,
          created_at: now,
          updated_at: now,
        })),
      );

    if (insertError) {
      console.warn('[saveEvaluation] Supabase error:', insertError.message);
      return { id: '', student_id: data.student_id, date: now, tecnica: data.tecnica, disciplina: data.disciplina, evolucao: data.evolucao, consistencia: data.consistencia, observations: data.observations, notification_sent: false };
    }

    trackFeatureUsage('grades', 'create');

    // Send notification to student
    await supabase.from('notifications').insert({
      user_id: data.student_id,
      type: 'evaluation',
      title: 'Nova avaliacao registrada',
      body: 'Seu professor registrou uma nova avaliacao. Confira seu progresso!',
      created_at: now,
    });

    return {
      id: `eval-${Date.now()}`,
      student_id: data.student_id,
      date: now,
      tecnica: data.tecnica,
      disciplina: data.disciplina,
      evolucao: data.evolucao,
      consistencia: data.consistencia,
      observations: data.observations,
      notification_sent: true,
    };
  } catch (error) {
    console.warn('[saveEvaluation] Fallback:', error);
    return { id: '', student_id: data.student_id, date: '', tecnica: 0, disciplina: 0, evolucao: 0, consistencia: 0, observations: '', notification_sent: false };
  }
}

export async function promoteBelt(
  studentId: string,
  toBelt: BeltLevel,
  academyId: string,
): Promise<{ success: boolean; new_belt: BeltLevel }> {
  try {
    if (isMock()) {
      const { mockPromoteBelt } = await import('@/lib/mocks/avaliacao.mock');
      return mockPromoteBelt(studentId, toBelt);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[promoteBelt] Not authenticated');
      return { success: false, new_belt: toBelt };
    }

    // Get current student belt
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('belt')
      .eq('id', studentId)
      .eq('academy_id', academyId)
      .single();

    if (studentError || !student) {
      console.warn('[promoteBelt] Student not found:', studentError?.message);
      return { success: false, new_belt: toBelt };
    }

    const now = new Date().toISOString();

    // Create progression record
    const { error: progressionError } = await supabase.from('progressions').insert({
      student_id: studentId,
      evaluated_by: user.id,
      from_belt: student.belt,
      to_belt: toBelt,
      created_at: now,
      updated_at: now,
    });

    if (progressionError) {
      console.warn('[promoteBelt] Progression error:', progressionError.message);
      return { success: false, new_belt: toBelt };
    }

    // Update student belt
    const { error: updateError } = await supabase
      .from('students')
      .update({ belt: toBelt, updated_at: now })
      .eq('id', studentId)
      .eq('academy_id', academyId);

    if (updateError) {
      console.warn('[promoteBelt] Update error:', updateError.message);
      return { success: false, new_belt: toBelt };
    }

    // Notify student
    await supabase.from('notifications').insert({
      user_id: studentId,
      type: 'belt_promotion',
      title: 'Promocao de Faixa!',
      body: `Parabens! Voce foi promovido para a faixa ${toBelt}!`,
      created_at: now,
    });

    return { success: true, new_belt: toBelt };
  } catch (error) {
    console.warn('[promoteBelt] Fallback:', error);
    return { success: false, new_belt: toBelt };
  }
}
