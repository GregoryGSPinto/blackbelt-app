import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Class, ScheduleSlot, Student, BeltLevel, EnrollmentStatus } from '@/lib/types';

export interface ClassFilters {
  modalityId?: string;
  unitId?: string;
  professorId?: string;
}

export interface ClassWithDetails extends Class {
  modality_name: string;
  professor_name: string;
  unit_name: string;
  enrolled_count: number;
  max_students: number;
}

export interface ClassDetail extends ClassWithDetails {
  enrolled_students: EnrolledStudentDTO[];
}

export interface EnrolledStudentDTO {
  student_id: string;
  profile_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
}

export interface CreateClassRequest {
  modality_id: string;
  unit_id: string;
  professor_id: string;
  schedule: ScheduleSlot[];
  max_students: number;
}

export interface UpdateClassRequest {
  modality_id?: string;
  unit_id?: string;
  professor_id?: string;
  schedule?: ScheduleSlot[];
  max_students?: number;
}

export async function listClasses(academyId: string, filters?: ClassFilters): Promise<ClassWithDetails[]> {
  try {
    if (isMock()) {
      const { mockListClasses } = await import('@/lib/mocks/turmas.mock');
      return mockListClasses(academyId, filters);
    }
    const params = new URLSearchParams({ academyId });
    if (filters?.modalityId) params.set('modalityId', filters.modalityId);
    if (filters?.unitId) params.set('unitId', filters.unitId);
    if (filters?.professorId) params.set('professorId', filters.professorId);
    const res = await fetch(`/api/turmas?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'turmas.list');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmas.list');
  }
}

export async function getClassById(id: string): Promise<ClassDetail> {
  try {
    if (isMock()) {
      const { mockGetClassById } = await import('@/lib/mocks/turmas.mock');
      return mockGetClassById(id);
    }
    const res = await fetch(`/api/turmas/${id}`);
    if (!res.ok) throw new ServiceError(res.status, 'turmas.getById');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmas.getById');
  }
}

export async function createClass(data: CreateClassRequest): Promise<Class> {
  try {
    if (isMock()) {
      const { mockCreateClass } = await import('@/lib/mocks/turmas.mock');
      return mockCreateClass(data);
    }
    const res = await fetch('/api/turmas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'turmas.create');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmas.create');
  }
}

export async function updateClass(id: string, data: UpdateClassRequest): Promise<Class> {
  try {
    if (isMock()) {
      const { mockUpdateClass } = await import('@/lib/mocks/turmas.mock');
      return mockUpdateClass(id, data);
    }
    const res = await fetch(`/api/turmas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'turmas.update');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmas.update');
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteClass } = await import('@/lib/mocks/turmas.mock');
      return mockDeleteClass(id);
    }
    const res = await fetch(`/api/turmas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new ServiceError(res.status, 'turmas.delete');
  } catch (error) {
    handleServiceError(error, 'turmas.delete');
  }
}

export async function getClassesByProfessor(professorId: string): Promise<ClassWithDetails[]> {
  try {
    if (isMock()) {
      const { mockGetClassesByProfessor } = await import('@/lib/mocks/turmas.mock');
      return mockGetClassesByProfessor(professorId);
    }
    const res = await fetch(`/api/turmas?professorId=${professorId}`);
    if (!res.ok) throw new ServiceError(res.status, 'turmas.getByProfessor');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'turmas.getByProfessor');
  }
}
