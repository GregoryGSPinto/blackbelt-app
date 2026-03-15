import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    const params = new URLSearchParams({ academyId });
    if (unitId) params.set('unitId', unitId);
    const res = await fetch(`/api/horarios?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'horarios.getGrade');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'horarios.getGrade');
  }
}

export async function checkConflict(professorId: string, schedule: ScheduleSlot[]): Promise<ConflictResult> {
  try {
    if (isMock()) {
      const { mockCheckConflict } = await import('@/lib/mocks/horarios.mock');
      return mockCheckConflict(professorId, schedule);
    }
    const res = await fetch('/api/horarios/conflict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professorId, schedule }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'horarios.checkConflict');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'horarios.checkConflict');
  }
}
