import { isMock } from '@/lib/env';
import type { ScheduleSlot } from '@/lib/types';

export interface WeeklyScheduleSlot {
  class_id: string;
  modality_name: string;
  professor_name: string;
  unit_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  enrolled_count: number;
  max_students: number;
  is_enrolled: boolean;
}

export interface WeeklySchedule {
  slots: WeeklyScheduleSlot[];
}

export interface ConflictResult {
  has_conflict: boolean;
  conflicting_class_id?: string;
  conflicting_modality?: string;
  conflicting_time?: string;
}

export async function getGrade(academyId: string, unitId?: string): Promise<WeeklySchedule> {
  try {
    if (isMock()) {
      const { mockGetGrade } = await import('@/lib/mocks/horarios.mock');
      return mockGetGrade(academyId, unitId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('classes')
      .select(`
        id,
        schedule,
        capacity,
        modalities(name),
        profiles!classes_professor_id_fkey(display_name),
        units!inner(name, academy_id),
        class_enrollments(count)
      `)
      .eq('units.academy_id', academyId);

    if (unitId) query = query.eq('unit_id', unitId);

    const { data, error } = await query;
    if (error) {
      console.error('[getGrade] query error:', error.message);
      return { slots: [] };
    }

    // Get current user's student ID for is_enrolled check
    const { data: { user } } = await supabase.auth.getUser();
    let studentIds: string[] = [];
    if (user) {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id);
      studentIds = (students ?? []).map((s: { id: string }) => s.id);
    }

    const enrolledClassIds = new Set<string>();
    if (studentIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .in('student_id', studentIds)
        .eq('status', 'active');
      (enrollments ?? []).forEach((e: { class_id: string }) => enrolledClassIds.add(e.class_id));
    }

    const slots: WeeklyScheduleSlot[] = [];
    for (const row of data ?? []) {
      const schedule = (row.schedule as ScheduleSlot[]) ?? [];
      const modalities = row.modalities as Record<string, unknown> | null;
      const profiles = row.profiles as Record<string, unknown> | null;
      const units = row.units as Record<string, unknown> | null;
      const enrollments = row.class_enrollments as Array<Record<string, number>> | null;

      for (const slot of schedule) {
        slots.push({
          class_id: row.id,
          modality_name: (modalities?.name ?? '') as string,
          professor_name: (profiles?.display_name ?? '') as string,
          unit_name: (units?.name ?? '') as string,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          enrolled_count: enrollments?.[0]?.count ?? 0,
          max_students: row.capacity ?? 30,
          is_enrolled: enrolledClassIds.has(row.id),
        });
      }
    }

    return { slots };
  } catch (error) {
    console.error('[getGrade] Fallback:', error);
    return { slots: [] };
  }
}

export async function checkConflict(professorId: string, schedule: ScheduleSlot[]): Promise<ConflictResult> {
  try {
    if (isMock()) {
      const { mockCheckConflict } = await import('@/lib/mocks/horarios.mock');
      return mockCheckConflict(professorId, schedule);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get all classes for this professor
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, schedule, modalities(name)')
      .eq('professor_id', professorId);
    if (error) {
      console.error('[checkConflict] query error:', error.message);
      return { has_conflict: false };
    }

    // Check for time overlaps
    for (const cls of classes ?? []) {
      const existingSchedule = (cls.schedule as ScheduleSlot[]) ?? [];
      for (const existing of existingSchedule) {
        for (const newSlot of schedule) {
          if (
            existing.day_of_week === newSlot.day_of_week &&
            existing.start_time < newSlot.end_time &&
            existing.end_time > newSlot.start_time
          ) {
            const modalities = cls.modalities as Record<string, unknown> | null;
            return {
              has_conflict: true,
              conflicting_class_id: cls.id,
              conflicting_modality: (modalities?.name ?? '') as string,
              conflicting_time: `${existing.start_time}-${existing.end_time}`,
            };
          }
        }
      }
    }

    return { has_conflict: false };
  } catch (error) {
    console.error('[checkConflict] Fallback:', error);
    return { has_conflict: false };
  }
}
