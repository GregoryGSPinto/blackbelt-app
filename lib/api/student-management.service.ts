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
    console.warn('[studentManagement.list] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[studentManagement.stats] fallback — not yet connected to Supabase');
    return { total_active: 0, new_this_month: 0, inactive: 0, by_belt: {} } as StudentManagementStats;
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
    console.warn('[studentManagement.deactivate] fallback — not yet connected to Supabase');
    return { id: studentId, profile_id: '', display_name: '', email: '', phone: '', belt: 'white' as import('@/lib/types/domain').BeltLevel, turmas: [], attendance_rate: 0, mensalidade_status: 'em_dia', status: 'inactive', started_at: '', avatar_url: null } as AdminStudentItem;
  } catch (error) {
    handleServiceError(error, 'studentManagement.deactivate');
  }
}
