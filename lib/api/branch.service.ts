import { isMock } from '@/lib/env';
import type { Branch, CreateBranchPayload, BranchStats } from '@/lib/types/branch';

const emptyBranch = (id: string = ''): Branch => ({
  id, academyId: '', name: '', address: '', city: '', state: '', phone: '', managerName: '', managerId: '', totalStudents: 0, totalProfessors: 0, totalClasses: 0, active: true, createdAt: '',
});

export async function listBranches(academyId: string): Promise<Branch[]> {
  try {
    if (isMock()) {
      const { mockListBranches } = await import('@/lib/mocks/branch.mock');
      return mockListBranches(academyId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('parent_academy_id', academyId)
        .order('name');
      if (error || !data) {
        console.error('[listBranches] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>): Branch => ({
        id: (row.id as string) || '',
        academyId,
        name: (row.name as string) || '',
        address: (row.address as string) || '',
        city: (row.city as string) || '',
        state: (row.state as string) || '',
        phone: (row.phone as string) || '',
        managerName: (row.manager_name as string) || '',
        managerId: (row.manager_id as string) || '',
        totalStudents: (row.student_count as number) || 0,
        totalProfessors: (row.professor_count as number) || 0,
        totalClasses: (row.class_count as number) || 0,
        active: (row.status as string) !== 'inactive',
        createdAt: (row.created_at as string) || '',
      }));
    } catch {
      console.error('[branch.listBranches] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listBranches] Fallback:', error);
    return [];
  }
}

export async function getBranch(branchId: string): Promise<Branch> {
  try {
    if (isMock()) {
      const { mockGetBranch } = await import('@/lib/mocks/branch.mock');
      return mockGetBranch(branchId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', branchId)
        .single();
      if (error || !data) {
        console.error('[getBranch] Query failed:', error?.message);
        return emptyBranch(branchId);
      }
      return {
        id: (data.id as string) || branchId,
        academyId: (data.parent_academy_id as string) || '',
        name: (data.name as string) || '',
        address: (data.address as string) || '',
        city: (data.city as string) || '',
        state: (data.state as string) || '',
        phone: (data.phone as string) || '',
        managerName: (data.manager_name as string) || '',
        managerId: (data.manager_id as string) || '',
        totalStudents: (data.student_count as number) || 0,
        totalProfessors: (data.professor_count as number) || 0,
        totalClasses: (data.class_count as number) || 0,
        active: (data.status as string) !== 'inactive',
        createdAt: (data.created_at as string) || '',
      };
    } catch {
      console.error('[branch.getBranch] API not available, returning empty');
      return emptyBranch(branchId);
    }
  } catch (error) {
    console.error('[getBranch] Fallback:', error);
    return emptyBranch(branchId);
  }
}

export async function createBranch(
  academyId: string,
  payload: CreateBranchPayload,
): Promise<Branch> {
  try {
    if (isMock()) {
      const { mockCreateBranch } = await import('@/lib/mocks/branch.mock');
      return mockCreateBranch(academyId, payload);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('units')
        .insert({
          parent_academy_id: academyId,
          name: payload.name,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          phone: payload.phone,
          manager_id: payload.managerId,
        })
        .select()
        .single();
      if (error || !row) {
        console.error('[createBranch] Insert failed:', error?.message);
        return { ...emptyBranch(), academyId, name: payload.name };
      }
      return {
        id: (row.id as string) || '',
        academyId,
        name: payload.name,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        phone: payload.phone,
        managerName: '',
        managerId: payload.managerId,
        totalStudents: 0,
        totalProfessors: 0,
        totalClasses: 0,
        active: true,
        createdAt: (row.created_at as string) || '',
      };
    } catch {
      console.error('[branch.createBranch] API not available, using mock fallback');
      const { mockCreateBranch } = await import('@/lib/mocks/branch.mock');
      return mockCreateBranch(academyId, payload);
    }
  } catch (error) {
    console.error('[createBranch] Fallback:', error);
    return emptyBranch();
  }
}

export async function getBranchStats(academyId: string): Promise<BranchStats[]> {
  try {
    if (isMock()) {
      const { mockBranchStats } = await import('@/lib/mocks/branch.mock');
      return mockBranchStats(academyId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('units')
        .select('id, name, student_count')
        .eq('parent_academy_id', academyId);
      if (error || !data) {
        console.error('[getBranchStats] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>): BranchStats => ({
        branchId: (row.id as string) || '',
        branchName: (row.name as string) || '',
        students: (row.student_count as number) || 0,
        revenue: 0,
        retention: 0,
        attendance: 0,
      }));
    } catch {
      console.error('[branch.getBranchStats] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[getBranchStats] Fallback:', error);
    return [];
  }
}
