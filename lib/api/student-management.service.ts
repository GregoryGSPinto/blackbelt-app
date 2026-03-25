import { isMock } from '@/lib/env';
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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('students')
      .select(`
        id, profile_id, belt, started_at, academy_id,
        profiles!students_profile_id_fkey(display_name, avatar, user_id),
        memberships!inner(status),
        class_enrollments(classes(modalities(name)))
      `)
      .eq('academy_id', academyId);

    if (filters?.belt) query = query.eq('belt', filters.belt);
    if (filters?.status) query = query.eq('memberships.status', filters.status);

    const { data, error } = await query;
    if (error) {
      console.error('[listStudents] Supabase error:', error.message);
      return [];
    }

    let results = (data ?? []).map((s: Record<string, unknown>) => {
      const profile = s.profiles as Record<string, unknown> | null;
      const memberships = s.memberships as Array<Record<string, unknown>> | null;
      const enrollments = s.class_enrollments as Array<Record<string, unknown>> | null;
      const turmas = (enrollments ?? []).map((e: Record<string, unknown>) => {
        const cls = e.classes as Record<string, unknown> | null;
        const mod = cls?.modalities as Record<string, unknown> | null;
        return (mod?.name ?? '') as string;
      }).filter(Boolean);

      return {
        id: s.id as string,
        profile_id: s.profile_id as string,
        display_name: (profile?.display_name ?? '') as string,
        email: '',
        phone: '',
        belt: s.belt as AdminStudentItem['belt'],
        turmas,
        attendance_rate: 0,
        mensalidade_status: 'em_dia' as const,
        status: ((memberships?.[0]?.status ?? 'active') === 'active' ? 'active' : 'inactive') as AdminStudentItem['status'],
        started_at: (s.started_at ?? '') as string,
        avatar_url: (profile?.avatar ?? null) as string | null,
      };
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter((r: AdminStudentItem) => r.display_name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term));
    }

    return results;
  } catch (error) {
    console.error('[listStudents] Fallback:', error);
    return [];
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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [studentsRes, newRes, inactiveRes] = await Promise.all([
      supabase.from('students').select('belt').eq('academy_id', academyId),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', startOfMonth),
      supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'inactive'),
    ]);

    const students = studentsRes.data ?? [];
    const byBelt: Record<string, number> = {};
    for (const s of students) {
      byBelt[s.belt] = (byBelt[s.belt] ?? 0) + 1;
    }

    return {
      total_active: students.length,
      new_this_month: newRes.count ?? 0,
      inactive: inactiveRes.count ?? 0,
      by_belt: byBelt,
    };
  } catch (error) {
    console.error('[getStudentManagementStats] Fallback:', error);
    return { total_active: 0, new_this_month: 0, inactive: 0, by_belt: {} };
  }
}

export async function deactivateStudent(studentId: string): Promise<AdminStudentItem> {
  try {
    if (isMock()) {
      const { mockDeactivateStudent } = await import('@/lib/mocks/student-management.mock');
      return mockDeactivateStudent(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('memberships')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('profile_id', studentId);

    if (error) {
      console.error('[deactivateStudent] Supabase error:', error.message);
    }

    return { id: studentId, profile_id: '', display_name: '', email: '', phone: '', belt: 'white' as AdminStudentItem['belt'], turmas: [], attendance_rate: 0, mensalidade_status: 'em_dia', status: 'inactive', started_at: '', avatar_url: null };
  } catch (error) {
    console.error('[deactivateStudent] Fallback:', error);
    return { id: studentId, profile_id: '', display_name: '', email: '', phone: '', belt: 'white' as AdminStudentItem['belt'], turmas: [], attendance_rate: 0, mensalidade_status: 'em_dia', status: 'inactive', started_at: '', avatar_url: null };
  }
}
