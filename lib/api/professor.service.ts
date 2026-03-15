import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel, ScheduleSlot } from '@/lib/types';

export interface ProfessorDashboardDTO {
  proximaAula: ProximaAulaDTO | null;
  aulaAtiva: AulaAtivaDTO | null;
  minhasTurmas: TurmaResumoDTO[];
  meusAlunos: AlunoResumoDTO[];
  mensagensRecentes: MensagemPreviewDTO[];
}

export interface ProximaAulaDTO {
  class_id: string;
  modality_name: string;
  start_time: string;
  end_time: string;
  unit_name: string;
  enrolled_count: number;
}

export interface AulaAtivaDTO {
  class_id: string;
  modality_name: string;
  present_count: number;
  total_count: number;
}

export interface TurmaResumoDTO {
  class_id: string;
  modality_name: string;
  enrolled_count: number;
  schedule_text: string;
  presenca_media: number;
}

export interface AlunoResumoDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  ultima_presenca: string | null;
}

export interface MensagemPreviewDTO {
  conversation_id: string;
  from_name: string;
  preview: string;
  time: string;
  unread: boolean;
}

export async function getProfessorDashboard(professorId: string): Promise<ProfessorDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetProfessorDashboard } = await import('@/lib/mocks/professor.mock');
      return mockGetProfessorDashboard(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get professor's classes with details
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        schedule,
        capacity,
        modalities(name),
        units(name),
        class_enrollments(count)
      `)
      .eq('professor_id', professorId);
    if (error) throw new ServiceError(500, 'professor.dashboard', error.message);

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    let proximaAula: ProximaAulaDTO | null = null;
    let aulaAtiva: AulaAtivaDTO | null = null;
    const minhasTurmas: TurmaResumoDTO[] = [];

    for (const cls of classes ?? []) {
      const schedule = (cls.schedule as ScheduleSlot[]) ?? [];
      const modalities = cls.modalities as Record<string, unknown> | null;
      const units = cls.units as Record<string, unknown> | null;
      const enrollments = cls.class_enrollments as Array<Record<string, number>> | null;
      const enrolledCount = enrollments?.[0]?.count ?? 0;

      // Schedule text for display
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const scheduleText = schedule
        .map((s: ScheduleSlot) => `${dayNames[s.day_of_week]} ${s.start_time}-${s.end_time}`)
        .join(', ');

      minhasTurmas.push({
        class_id: cls.id,
        modality_name: (modalities?.name ?? '') as string,
        enrolled_count: enrolledCount,
        schedule_text: scheduleText,
        presenca_media: 0, // Would need historical attendance calc
      });

      for (const slot of schedule) {
        if (slot.day_of_week === currentDay) {
          if (slot.start_time <= currentTime && slot.end_time >= currentTime) {
            // Active class
            const { count: presentCount } = await supabase
              .from('attendance')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', cls.id)
              .gte('checked_at', todayStart.toISOString());

            aulaAtiva = {
              class_id: cls.id,
              modality_name: (modalities?.name ?? '') as string,
              present_count: presentCount ?? 0,
              total_count: enrolledCount,
            };
          } else if (slot.start_time > currentTime && !proximaAula) {
            proximaAula = {
              class_id: cls.id,
              modality_name: (modalities?.name ?? '') as string,
              start_time: slot.start_time,
              end_time: slot.end_time,
              unit_name: (units?.name ?? '') as string,
              enrolled_count: enrolledCount,
            };
          }
        }
      }
    }

    // Get unique students across all classes
    const classIds = (classes ?? []).map((c: { id: string }) => c.id);
    let meusAlunos: AlunoResumoDTO[] = [];

    if (classIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select(`
          student_id,
          students(
            id,
            belt,
            profiles(display_name, avatar)
          )
        `)
        .in('class_id', classIds)
        .eq('status', 'active');

      const seenStudents = new Set<string>();
      meusAlunos = (enrollments ?? [])
        .filter((e: Record<string, unknown>) => {
          const sid = e.student_id as string;
          if (seenStudents.has(sid)) return false;
          seenStudents.add(sid);
          return true;
        })
        .map((e: Record<string, unknown>) => {
          const student = e.students as Record<string, unknown> | null;
          const profile = student?.profiles as Record<string, unknown> | null;
          return {
            student_id: e.student_id as string,
            display_name: (profile?.display_name ?? '') as string,
            avatar: (profile?.avatar ?? null) as string | null,
            belt: (student?.belt ?? 'white') as BeltLevel,
            ultima_presenca: null,
          };
        });
    }

    // Recent messages (simplified)
    const { data: { user } } = await supabase.auth.getUser();
    let mensagensRecentes: MensagemPreviewDTO[] = [];

    if (user) {
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, created_at, from_id, profiles!messages_from_id_fkey(display_name)')
        .eq('to_id', professorId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      mensagensRecentes = (messages ?? []).map((m: Record<string, unknown>) => {
        const profiles = m.profiles as Record<string, unknown> | null;
        return {
          conversation_id: m.id as string,
          from_name: (profiles?.display_name ?? '') as string,
          preview: ((m.content as string) ?? '').substring(0, 50),
          time: m.created_at as string,
          unread: true,
        };
      });
    }

    return {
      proximaAula,
      aulaAtiva,
      minhasTurmas,
      meusAlunos,
      mensagensRecentes,
    };
  } catch (error) {
    handleServiceError(error, 'professor.dashboard');
  }
}
