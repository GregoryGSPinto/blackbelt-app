import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel, ScheduleSlot } from '@/lib/types';

// ── Base DTOs ──────────────────────────────────────────────────────────

export interface AlunoDashboardDTO {
  student_name: string;
  avatar_url: string | null;
  ranking_position: number;
  total_academy_students: number;
  membro_desde: string;
  proximaAula: ProximaAulaDTO | null;
  aulaAgora: boolean;
  proximaAulaAmanha: ProximaAulaDTO | null;
  progressoFaixa: ProgressoFaixaDTO;
  frequenciaMes: FrequenciaMesDTO;
  frequenciaMesAnteriorPct: number;
  streak: number;
  conteudoRecomendado: ConteudoRecomendadoDTO[];
  continuarAssistindo: ContinuarAssistindoDTO | null;
  ultimasConquistas: ConquistaRecenteDTO[];
  proximaConquista: ProximaConquistaDTO | null;
  semana: DiaSemanaDTO[];
}

export interface ProximaAulaDTO {
  class_id: string;
  modality_name: string;
  level_label: string;
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
  requisitos: RequisitoFaixaDTO[];
}

export interface RequisitoFaixaDTO {
  label: string;
  atual: number;
  necessario: number;
  completo: boolean;
}

export interface FrequenciaMesDTO {
  total_aulas: number;
  presencas: number;
  dias_presentes: number[];
  mes_label: string;
}

export interface ConteudoRecomendadoDTO {
  video_id: string;
  title: string;
  duration: number;
  belt_level: BeltLevel;
}

export interface ContinuarAssistindoDTO {
  video_id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  watched_seconds: number;
  progress_pct: number;
}

export interface ConquistaRecenteDTO {
  id: string;
  name: string;
  icon: string;
  type: string;
  granted_at: string;
}

export interface ProximaConquistaDTO {
  name: string;
  icon: string;
  description: string;
  progress_current: number;
  progress_target: number;
}

export type DiaStatus = 'done' | 'scheduled' | 'rest' | 'missed';

export interface DiaSemanaDTO {
  day_label: string;
  day_short: string;
  date: string;
  status: DiaStatus;
  classes: string[];
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
      .select('belt, academy_id, started_at, profiles!students_profile_id_fkey(display_name, avatar)')
      .eq('id', studentId)
      .single();
    if (studentError) throw new ServiceError(404, 'aluno.dashboard', studentError.message);

    const studentProfile = student.profiles as Record<string, unknown> | null;
    const studentName = ((studentProfile?.display_name ?? 'Aluno') as string).split(' ')[0];
    const avatarUrl = (studentProfile?.avatar ?? null) as string | null;

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
              level_label: '',
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
      attendance_streak: 'Sequencia de Presencas',
      belt_promotion: 'Promocao de Faixa',
      class_milestone: 'Marco de Aulas',
      custom: 'Conquista Especial',
    };
    const achievementIcons: Record<string, string> = {
      attendance_streak: '\uD83D\uDD25',
      belt_promotion: '\uD83E\uDD4B',
      class_milestone: '\uD83C\uDFC5',
      custom: '\u2B50',
    };

    const ultimasConquistas: ConquistaRecenteDTO[] = (achievementsRes.data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: achievementNames[a.type as string] ?? (a.type as string),
      icon: achievementIcons[a.type as string] ?? '\u2B50',
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

    // Ranking (simple count of students with more attendance)
    const { count: studentsAbove } = await supabase
      .rpc('count_students_above_attendance', {
        p_academy_id: student.academy_id,
        p_attendance_count: totalAttendance,
      });
    const rankingPosition = (studentsAbove ?? 0) + 1;

    const { count: totalAcademyStudents } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', student.academy_id);

    // Previous month frequency %
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const { data: prevMonthAttendance } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .gte('checked_at', prevMonth.toISOString())
      .lte('checked_at', prevMonthEnd.toISOString());
    const prevMonthCount = (prevMonthAttendance as unknown as { count: number })?.count ?? 0;
    const prevMonthTotal = (enrollmentsRes.data ?? []).length * 4;
    const frequenciaMesAnteriorPct = prevMonthTotal > 0
      ? Math.round((prevMonthCount / prevMonthTotal) * 100)
      : 0;

    // Month label
    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Build week schedule (Mon-Sat)
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const weekFull = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
    const monday = new Date(now);
    const dayOfWeek = now.getDay();
    const mondayDiff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    monday.setDate(now.getDate() + mondayDiff);

    const semana: DiaSemanaDTO[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dDay = d.getDay();
      const isPast = d < now && d.toDateString() !== now.toDateString();

      // Check enrolled classes for this day
      const dayClasses: string[] = [];
      for (const enrollment of enrollmentsRes.data ?? []) {
        const cls = enrollment.classes as Record<string, unknown> | null;
        if (!cls) continue;
        const schedule = (cls.schedule as ScheduleSlot[]) ?? [];
        const mod = cls.modalities as Record<string, unknown> | null;
        for (const slot of schedule) {
          if (slot.day_of_week === dDay) {
            dayClasses.push(`${(mod?.name ?? '') as string} ${slot.start_time}`);
          }
        }
      }

      let status: DiaStatus;
      if (dayClasses.length === 0) {
        status = 'rest';
      } else if (isPast) {
        // Check if attended
        const attended = diasPresentes.includes(d.getDate()) && d.getMonth() === now.getMonth();
        status = attended ? 'done' : 'missed';
      } else {
        status = 'scheduled';
      }

      return {
        day_label: weekFull[dDay],
        day_short: weekDays[dDay],
        date: d.toISOString().split('T')[0],
        status,
        classes: dayClasses,
      };
    });

    return {
      student_name: studentName,
      avatar_url: avatarUrl,
      ranking_position: rankingPosition,
      total_academy_students: totalAcademyStudents ?? 0,
      membro_desde: student.started_at as string,
      proximaAula,
      aulaAgora: proximaAula ? false : false, // computed client-side
      proximaAulaAmanha: null, // TODO: compute tomorrow's class
      progressoFaixa: {
        faixa_atual: currentBelt,
        proxima_faixa: nextBelt,
        percentual,
        aulas_necessarias: requiredForNext - requiredForCurrent,
        aulas_concluidas: Math.max(0, currentProgress),
        requisitos: [
          {
            label: 'Presencas',
            atual: Math.max(0, currentProgress),
            necessario: requiredForNext - requiredForCurrent,
            completo: currentProgress >= (requiredForNext - requiredForCurrent),
          },
        ],
      },
      frequenciaMes: {
        total_aulas: (enrollmentsRes.data ?? []).length * 4,
        presencas: monthAttendance.length,
        dias_presentes: diasPresentes,
        mes_label: monthNames[now.getMonth()],
      },
      frequenciaMesAnteriorPct,
      streak,
      conteudoRecomendado,
      continuarAssistindo: null, // TODO: fetch from video_watch_history
      ultimasConquistas,
      proximaConquista: null, // TODO: compute next achievement
      semana,
    };
  } catch (error) {
    handleServiceError(error, 'aluno.dashboard');
  }
}
