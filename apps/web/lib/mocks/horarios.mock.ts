import type { ScheduleSlot } from '@/lib/types';
import type { WeeklySchedule, WeeklyScheduleSlot, ConflictResult } from '@/lib/api/horarios.service';
import { MOCK_CLASSES } from '@/lib/mocks/turmas.mock';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetGrade(_academyId: string, unitId?: string): Promise<WeeklySchedule> {
  await delay();
  let classes = MOCK_CLASSES;
  if (unitId) classes = classes.filter((c) => c.unit_id === unitId);

  const slots: WeeklyScheduleSlot[] = [];
  for (const cls of classes) {
    for (const s of cls.schedule) {
      slots.push({
        class_id: cls.id,
        modality_name: cls.modality_name,
        professor_name: cls.professor_name,
        unit_name: cls.unit_name,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        enrolled_count: cls.enrolled_count,
        max_students: cls.max_students,
        is_enrolled: false,
      });
    }
  }

  slots.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));
  return { slots };
}

export async function mockCheckConflict(professorId: string, schedule: ScheduleSlot[]): Promise<ConflictResult> {
  await delay();
  const professorClasses = MOCK_CLASSES.filter((c) => c.professor_id === professorId);

  for (const newSlot of schedule) {
    for (const cls of professorClasses) {
      for (const existingSlot of cls.schedule) {
        if (existingSlot.day_of_week === newSlot.day_of_week) {
          const newStart = newSlot.start_time;
          const newEnd = newSlot.end_time;
          const exStart = existingSlot.start_time;
          const exEnd = existingSlot.end_time;

          if (newStart < exEnd && newEnd > exStart) {
            return {
              has_conflict: true,
              conflicting_class_id: cls.id,
              conflicting_modality: cls.modality_name,
              conflicting_time: `${existingSlot.day_of_week} ${exStart}-${exEnd}`,
            };
          }
        }
      }
    }
  }

  return { has_conflict: false };
}
