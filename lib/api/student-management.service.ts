import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { AdminStudentItem, StudentManagementStats } from '@/lib/types/student-management';

export async function listStudents(
  academyId: string,
  filters?: { search?: string; belt?: string; status?: string; turma?: string },
): Promise<AdminStudentItem[]> {
  try {
    if (isMock()) {
      const { mockListStudents } = await import('@/lib/mocks/student-management.mock');
      return mockListStudents(academyId, filters);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'studentManagement.list');
  }
}

export async function getStudentManagementStats(
  academyId: string,
): Promise<StudentManagementStats> {
  try {
    if (isMock()) {
      const { mockGetStudentManagementStats } = await import(
        '@/lib/mocks/student-management.mock'
      );
      return mockGetStudentManagementStats(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'studentManagement.stats');
  }
}

export async function deactivateStudent(studentId: string): Promise<AdminStudentItem> {
  try {
    if (isMock()) {
      const { mockDeactivateStudent } = await import('@/lib/mocks/student-management.mock');
      return mockDeactivateStudent(studentId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'studentManagement.deactivate');
  }
}
