import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel, ScheduleSlot } from '@/lib/types';

export interface AlunoDashboardDTO {
  proximaAula: ProximaAulaDTO | null;
  progressoFaixa: ProgressoFaixaDTO;
  frequenciaMes: FrequenciaMesDTO;
  streak: number;
  conteudoRecomendado: ConteudoRecomendadoDTO[];
  ultimasConquistas: ConquistaRecenteDTO[];
}

export interface ProximaAulaDTO {
  class_id: string;
  modality_name: string;
  professor_name: string;
  start_time: string;
  end_time: string;
  unit_name: string;
}

export interface ProgressoFaixaDTO {
  faixa_atual: BeltLevel;
  proxima_faixa: BeltLevel;
  percentual: number;
  aulas_necessarias: number;
  aulas_concluidas: number;
}

export interface FrequenciaMesDTO {
  total_aulas: number;
  presencas: number;
  dias_presentes: number[];
}

export interface ConteudoRecomendadoDTO {
  video_id: string;
  title: string;
  duration: number;
  belt_level: BeltLevel;
}

export interface ConquistaRecenteDTO {
  id: string;
  name: string;
  type: string;
  granted_at: string;
}

const BELT_ORDER: BeltLevel[] = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'] as BeltLevel[];
const BELT_THRESHOLDS = [0, 20, 30, 40, 50, 60, 80, 100, 150];

export async function getAlunoDashboard(studentId: string): Promise<AlunoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetAlunoDashboard } = await import('@/lib/mocks/aluno.mock');
      return mockGetAlunoDashboard(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('belt, academy_id')
      .eq('id', studentId)
      .single();
    if (studentError) throw new ServiceError(404, 'aluno.dashboard', studentError.message);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallel queries
    const [enrollmentsRes, attendanceRes, monthAttendanceRes, achievementsRes, videosRes] = await Promise.all([
      supabase.from('class_enrollments')
        .select('class_id, classes(id, schedule, modalities(name), profiles!classes_professor_id_fkey(display_name), units(name))')
        .eq('student_id', studentId)
        .eq('status', 'active'),
      supabase.from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),
      supabase.from('attendance')
        .select('checked_at')
        .eq('student_id', studentId)
        .gte('checked_at', startOfMonth),
      supabase.from('achievements')
        .select('id, type, granted_at')
        .eq('student_id', studentId)
        .order('granted_at', { ascending: false })
        .limit(5),
      supabase.from('videos')
        .select('id, title, duration, belt_level')
        .eq('academy_id', student.academy_id)
        .eq('belt_level', student.belt)
        .limit(3),
    ]);

    // Next class
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let proximaAula: ProximaAulaDTO | null = null;

    for (const enrollment of enrollmentsRes.data ?? []) {
      const cls = enrollment.classes as Record<string, unknown> | null;
      if (!cls) continue;
      const schedule = (cls.schedule as ScheduleSlot[]) ?? [];
      const modalities = cls.modalities as Record<string, unknown> | null;
      const profiles = cls.profiles as Record<string, unknown> | null;
      const units = cls.units as Record<string, unknown> | null;

      for (const slot of schedule) {
        if (slot.day_of_week === currentDay && slot.start_time > currentTime) {
          if (!proximaAula || slot.start_time < proximaAula.start_time) {
            proximaAula = {
              class_id: cls.id as string,
              modality_name: (modalities?.name ?? '') as string,
              professor_name: (profiles?.display_name ?? '') as string,
              start_time: slot.start_time,
              end_time: slot.end_time,
              unit_name: (units?.name ?? '') as string,
            };
          }
        }
      }
    }

    // Belt progress
    const currentBelt = student.belt as BeltLevel;
    const beltIndex = BELT_ORDER.indexOf(currentBelt);
    const nextBeltIndex = Math.min(beltIndex + 1, BELT_ORDER.length - 1);
    const nextBelt = BELT_ORDER[nextBeltIndex];
    const totalAttendance = attendanceRes.count ?? 0;
    const requiredForNext = BELT_THRESHOLDS[nextBeltIndex] ?? 150;
    const requiredForCurrent = BELT_THRESHOLDS[beltIndex] ?? 0;
    const progressRange = requiredForNext - requiredForCurrent;
    const currentProgress = totalAttendance - requiredForCurrent;
    const percentual = progressRange > 0 ? Math.min(100, Math.round((currentProgress / progressRange) * 100)) : 100;

    // Monthly frequency
    const monthAttendance = monthAttendanceRes.data ?? [];
    const diasPresentes = monthAttendance.map((a: { checked_at: string }) =>
      new Date(a.checked_at).getDate()
    );

    // Streak calculation
    let streak = 0;
    const { data: recentAttendance } = await supabase
      .from('attendance')
      .select('checked_at')
      .eq('student_id', studentId)
      .order('checked_at', { ascending: false })
      .limit(90);

    if (recentAttendance && recentAttendance.length > 0) {
      const dates: string[] = [...new Set<string>(
        recentAttendance.map((a: { checked_at: string }) =>
          new Date(a.checked_at).toISOString().split('T')[0]
        )
      )].sort().reverse();

      let checkDate = new Date().toISOString().split('T')[0];
      for (const date of dates) {
        if (date === checkDate) {
          streak++;
          const prev = new Date(checkDate);
          prev.setDate(prev.getDate() - 1);
          checkDate = prev.toISOString().split('T')[0];
        } else if (date < checkDate) {
          break;
        }
      }
    }

    // Achievements
    const achievementNames: Record<string, string> = {
      attendance_streak: 'Sequência de Presenças',
      belt_promotion: 'Promoção de Faixa',
      class_milestone: 'Marco de Aulas',
      custom: 'Conquista Especial',
    };

    const ultimasConquistas: ConquistaRecenteDTO[] = (achievementsRes.data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: achievementNames[a.type as string] ?? (a.type as string),
      type: a.type as string,
      granted_at: a.granted_at as string,
    }));

    // Recommended content
    const conteudoRecomendado: ConteudoRecomendadoDTO[] = (videosRes.data ?? []).map((v: Record<string, unknown>) => ({
      video_id: v.id as string,
      title: v.title as string,
      duration: v.duration as number,
      belt_level: v.belt_level as BeltLevel,
    }));

    return {
      proximaAula,
      progressoFaixa: {
        faixa_atual: currentBelt,
        proxima_faixa: nextBelt,
        percentual,
        aulas_necessarias: requiredForNext - requiredForCurrent,
        aulas_concluidas: Math.max(0, currentProgress),
      },
      frequenciaMes: {
        total_aulas: (enrollmentsRes.data ?? []).length * 4, // Approximate monthly classes
        presencas: monthAttendance.length,
        dias_presentes: diasPresentes,
      },
      streak,
      conteudoRecomendado,
      ultimasConquistas,
    };
  } catch (error) {
    handleServiceError(error, 'aluno.dashboard');
  }
}
