import { isMock } from '@/lib/env';
import type { AdminStudentItem, StudentManagementStats } from '@/lib/types/student-management';
import { logServiceError } from '@/lib/api/errors';
import { listStudentFinancialRows } from '@/lib/api/student-billing.service';

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

    const [studentsRes, financialRows] = await Promise.all([
      supabase
        .from('students')
        .select(`
          id, profile_id, belt, started_at, academy_id,
          profiles!students_profile_id_fkey(display_name, avatar, email, phone),
          class_enrollments(classes(modalities(name)))
        `)
        .eq('academy_id', academyId),
      listStudentFinancialRows(academyId, { search: filters?.search }),
    ]);

    if (studentsRes.error) {
      logServiceError(studentsRes.error, 'student-management');
      return [];
    }

    const financialMap = new Map(financialRows.map((row) => [row.profile_id, row]));

    let results: AdminStudentItem[] = (studentsRes.data ?? []).map((student: Record<string, unknown>) => {
      const profile = student.profiles as Record<string, unknown> | null;
      const financial = financialMap.get(student.profile_id as string);
      const enrollments = student.class_enrollments as Array<Record<string, unknown>> | null;
      const turmas = (enrollments ?? [])
        .map((enrollment) => {
          const cls = enrollment.classes as Record<string, unknown> | null;
          const modality = cls?.modalities as Record<string, unknown> | null;
          return (modality?.name ?? '') as string;
        })
        .filter(Boolean);

      return {
        id: student.id as string,
        profile_id: student.profile_id as string,
        display_name: (profile?.display_name ?? '') as string,
        email: (profile?.email ?? '') as string,
        phone: (profile?.phone ?? '') as string,
        belt: student.belt as AdminStudentItem['belt'],
        turmas,
        attendance_rate: 0,
        mensalidade_status:
          financial?.financial_status === 'atrasado'
            ? 'atrasado'
            : financial?.financial_status === 'vence_hoje' || financial?.financial_status === 'vence_em_breve'
              ? 'pendente'
              : 'em_dia',
        billing_type: financial?.financial_model ?? 'particular',
        monthly_amount: financial?.amount_cents ?? 0,
        payment_method_default: financial?.payment_method_default ?? 'none',
        recurrence: financial?.recurrence ?? 'none',
        next_due_date: financial?.next_due_date ?? null,
        checkin_goal_status: financial?.checkin_goal_status ?? 'ok',
        current_month_checkins: financial?.current_month_checkins ?? 0,
        monthly_checkin_minimum: financial?.monthly_checkin_minimum ?? 0,
        alert_sent_today: financial?.alert_sent_today ?? false,
        status: filters?.status === 'inactive' ? 'inactive' : 'active',
        started_at: (student.started_at ?? '') as string,
        avatar_url: (profile?.avatar ?? null) as string | null,
      } satisfies AdminStudentItem;
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter((row) =>
        row.display_name.toLowerCase().includes(term) || row.email.toLowerCase().includes(term),
      );
    }
    if (filters?.belt) results = results.filter((row) => row.belt === filters.belt);
    if (filters?.turma) results = results.filter((row) => row.turmas.includes(filters.turma ?? ''));
    if (filters?.status) results = results.filter((row) => row.status === filters.status);

    return results;
  } catch (error) {
    logServiceError(error, 'student-management');
    return [];
  }
}

export async function getStudentManagementStats(
  academyId: string,
): Promise<StudentManagementStats> {
  try {
    if (isMock()) {
      const { mockGetStudentManagementStats } = await import('@/lib/mocks/student-management.mock');
      return mockGetStudentManagementStats(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [studentsRes, newRes] = await Promise.all([
      supabase.from('students').select('belt').eq('academy_id', academyId),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', startOfMonth),
    ]);

    const students = studentsRes.data ?? [];
    const byBelt: Record<string, number> = {};
    for (const student of students) {
      byBelt[student.belt] = (byBelt[student.belt] ?? 0) + 1;
    }

    return {
      total_active: students.length,
      new_this_month: newRes.count ?? 0,
      inactive: 0,
      by_belt: byBelt,
    };
  } catch (error) {
    logServiceError(error, 'student-management');
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
      .eq('profile_id', studentId)
      .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']);

    if (error) {
      logServiceError(error, 'student-management');
    }

    return {
      id: studentId,
      profile_id: studentId,
      display_name: '',
      email: '',
      phone: '',
      belt: 'white' as AdminStudentItem['belt'],
      turmas: [],
      attendance_rate: 0,
      mensalidade_status: 'em_dia',
      billing_type: 'particular',
      monthly_amount: 0,
      payment_method_default: 'none',
      recurrence: 'none',
      next_due_date: null,
      checkin_goal_status: 'ok',
      current_month_checkins: 0,
      monthly_checkin_minimum: 0,
      alert_sent_today: false,
      status: 'inactive',
      started_at: '',
      avatar_url: null,
    };
  } catch (error) {
    logServiceError(error, 'student-management');
    return {
      id: studentId,
      profile_id: studentId,
      display_name: '',
      email: '',
      phone: '',
      belt: 'white' as AdminStudentItem['belt'],
      turmas: [],
      attendance_rate: 0,
      mensalidade_status: 'em_dia',
      billing_type: 'particular',
      monthly_amount: 0,
      payment_method_default: 'none',
      recurrence: 'none',
      next_due_date: null,
      checkin_goal_status: 'ok',
      current_month_checkins: 0,
      monthly_checkin_minimum: 0,
      alert_sent_today: false,
      status: 'inactive',
      started_at: '',
      avatar_url: null,
    };
  }
}
