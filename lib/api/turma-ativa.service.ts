import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Attendance, BeltLevel, ScheduleSlot } from '@/lib/types';

export interface ActiveClassStudent {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  is_present: boolean;
  checked_in_via_qr: boolean;
}

export interface ActiveClassDTO {
  class_id: string;
  modality_name: string;
  unit_name: string;
  start_time: string;
  end_time: string;
  students: ActiveClassStudent[];
}

export interface SaveAttendanceRequest {
  class_id: string;
  present_student_ids: string[];
}

export async function getActiveClass(professorId: string): Promise<ActiveClassDTO | null> {
  try {
    if (isMock()) {
      const { mockGetActiveClass } = await import('@/lib/mocks/turma-ativa.mock');
      return mockGetActiveClass(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get professor's classes
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        schedule,
        modalities(name),
        units(name)
      `)
      .eq('professor_id', professorId);
    if (error) throw new ServiceError(500, 'turmaAtiva.get', error.message);

    // Find class that's active now (matching current day/time)
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let activeClass: (typeof classes)[number] | null = null;
    let activeSlot: ScheduleSlot | null = null;

    for (const cls of classes ?? []) {
      const schedule = (cls.schedule as ScheduleSlot[]) ?? [];
      for (const slot of schedule) {
        if (slot.day_of_week === currentDay && slot.start_time <= currentTime && slot.end_time >= currentTime) {
          activeClass = cls;
          activeSlot = slot;
          break;
        }
      }
      if (activeClass) break;
    }

    if (!activeClass || !activeSlot) return null;

    // Get enrolled students
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
      .eq('class_id', activeClass.id)
      .eq('status', 'active');

    // Get today's attendance for this class
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('student_id, method')
      .eq('class_id', activeClass.id)
      .gte('checked_at', todayStart.toISOString());

    const presentSet = new Map<string, string>();
    for (const a of todayAttendance ?? []) {
      presentSet.set(a.student_id, a.method);
    }

    const students: ActiveClassStudent[] = (enrollments ?? []).map((e: Record<string, unknown>) => {
      const student = e.students as Record<string, unknown> | null;
      const profile = student?.profiles as Record<string, unknown> | null;
      const sid = e.student_id as string;
      return {
        student_id: sid,
        display_name: (profile?.display_name ?? '') as string,
        avatar: (profile?.avatar ?? null) as string | null,
        belt: (student?.belt ?? 'white') as BeltLevel,
        is_present: presentSet.has(sid),
        checked_in_via_qr: presentSet.get(sid) === 'qr_code',
      };
    });

    const modalities = activeClass.modalities as Record<string, unknown> | null;
    const units = activeClass.units as Record<string, unknown> | null;

    return {
      class_id: activeClass.id,
      modality_name: (modalities?.name ?? '') as string,
      unit_name: (units?.name ?? '') as string,
      start_time: activeSlot.start_time,
      end_time: activeSlot.end_time,
      students,
    };
  } catch (error) {
    handleServiceError(error, 'turmaAtiva.get');
  }
}

export async function saveAttendance(data: SaveAttendanceRequest): Promise<Attendance[]> {
  try {
    if (isMock()) {
      const { mockSaveAttendance } = await import('@/lib/mocks/turma-ativa.mock');
      return mockSaveAttendance(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date().toISOString();
    const records = data.present_student_ids.map((studentId) => ({
      student_id: studentId,
      class_id: data.class_id,
      method: 'manual' as const,
      checked_at: now,
    }));

    // Use upsert to avoid duplicate key errors for students already checked in
    const { data: result, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,class_id', ignoreDuplicates: true })
      .select();
    if (error) throw new ServiceError(400, 'turmaAtiva.save', error.message);

    return (result ?? []) as Attendance[];
  } catch (error) {
    handleServiceError(error, 'turmaAtiva.save');
  }
}
