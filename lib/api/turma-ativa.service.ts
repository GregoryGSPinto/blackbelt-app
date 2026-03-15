import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Attendance, BeltLevel } from '@/lib/types';

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
    const res = await fetch(`/api/turma-ativa?professorId=${professorId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new ServiceError(res.status, 'turmaAtiva.get');
    return res.json();
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
    const res = await fetch('/api/turma-ativa/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'turmaAtiva.save');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmaAtiva.save');
  }
}
