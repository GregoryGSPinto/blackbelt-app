import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type {
  ClassItem,
  ClassStudent,
  CreateClassDTO,
  UpdateClassDTO,
  ClassFilters,
  ScheduleEntry,
} from '@/lib/types/class';

// ────────────────────────────────────────────────────────────
// Class CRUD Service
// ────────────────────────────────────────────────────────────

export async function listClasses(
  academyId: string,
  filters?: ClassFilters,
): Promise<ClassItem[]> {
  try {
    if (isMock()) {
      const { mockListClasses } = await import('@/lib/mocks/class.mock');
      return mockListClasses(academyId, filters);
    }
    try {

      const params = new URLSearchParams({ academy_id: academyId });
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.professor_id) params.set('professor_id', filters.professor_id);

      const res = await fetch(`/api/classes?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'class.list');
      return res.json();
    } catch {
      console.warn('[class.listClasses] API not available, using mock fallback');
      const { mockListClasses } = await import('@/lib/mocks/class.mock');
      return mockListClasses(academyId, filters);
    }

  } catch (error) {
    handleServiceError(error, 'class.list');
  }
}

export async function getClass(id: string): Promise<ClassItem> {
  try {
    if (isMock()) {
      const { mockGetClass } = await import('@/lib/mocks/class.mock');
      return mockGetClass(id);
    }
    // API not yet implemented — use mock
    const { mockGetClass } = await import('@/lib/mocks/class.mock');
      return mockGetClass(id);
  } catch (error) {
    handleServiceError(error, 'class.get');
  }
}

export async function createClass(data: CreateClassDTO): Promise<ClassItem> {
  try {
    if (isMock()) {
      const { mockCreateClass } = await import('@/lib/mocks/class.mock');
      return mockCreateClass(data);
    }
    try {

      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'class.create');
      return res.json();
    } catch {
      console.warn('[class.createClass] API not available, using mock fallback');
      const { mockCreateClass } = await import('@/lib/mocks/class.mock');
      return mockCreateClass(data);
    }
  } catch (error) {
    handleServiceError(error, 'class.create');
  }
}

export async function updateClass(id: string, data: UpdateClassDTO): Promise<ClassItem> {
  try {
    if (isMock()) {
      const { mockUpdateClass } = await import('@/lib/mocks/class.mock');
      return mockUpdateClass(id, data);
    }
    try {

      const res = await fetch(`/api/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'class.update');
      return res.json();
    } catch {
      console.warn('[class.updateClass] API not available, using mock fallback');
      const { mockUpdateClass } = await import('@/lib/mocks/class.mock');
      return mockUpdateClass(id, data);
    }
  } catch (error) {
    handleServiceError(error, 'class.update');
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteClass } = await import('@/lib/mocks/class.mock');
      return mockDeleteClass(id);
    }
    try {

      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'class.delete');
    } catch {
      console.warn('[class.deleteClass] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'class.delete');
  }
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  try {
    if (isMock()) {
      const { mockGetClassStudents } = await import('@/lib/mocks/class.mock');
      return mockGetClassStudents(classId);
    }
    // API not yet implemented — use mock
    const { mockGetClassStudents } = await import('@/lib/mocks/class.mock');
      return mockGetClassStudents(classId);
  } catch (error) {
    handleServiceError(error, 'class.getStudents');
  }
}

export async function addStudent(classId: string, studentId: string): Promise<ClassStudent> {
  try {
    if (isMock()) {
      const { mockAddStudent } = await import('@/lib/mocks/class.mock');
      return mockAddStudent(classId, studentId);
    }
    try {

      const res = await fetch(`/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'class.addStudent');
      return res.json();
    } catch {
      console.warn('[class.addStudent] API not available, using mock fallback');
      const { mockAddStudent } = await import('@/lib/mocks/class.mock');
      return mockAddStudent(classId, studentId);
    }
  } catch (error) {
    handleServiceError(error, 'class.addStudent');
  }
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveStudent } = await import('@/lib/mocks/class.mock');
      return mockRemoveStudent(classId, studentId);
    }
    try {

      const res = await fetch(`/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new ServiceError(res.status, 'class.removeStudent');
    } catch {
      console.warn('[class.removeStudent] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'class.removeStudent');
  }
}

export async function getSchedule(academyId: string): Promise<ScheduleEntry[]> {
  try {
    if (isMock()) {
      const { mockGetSchedule } = await import('@/lib/mocks/class.mock');
      return mockGetSchedule(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetSchedule } = await import('@/lib/mocks/class.mock');
      return mockGetSchedule(academyId);
  } catch (error) {
    handleServiceError(error, 'class.getSchedule');
  }
}
