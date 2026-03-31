import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import {
  getMemberBilling,
  getPaymentHistory,
  type MemberBilling,
  type StudentInvoice,
} from '@/lib/api/student-billing.service';
import type { BeltLevel } from '@/lib/types/domain';

export interface AdminStudentDetail {
  student_id: string;
  profile_id: string;
  academy_id: string;
  membership_id: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  belt: BeltLevel;
  started_at: string;
  role: string;
  turmas: string[];
  attendance_total: number;
  attendance_this_month: number;
  last_attendance_at: string | null;
  payment_history: StudentInvoice[];
  financial_profile: MemberBilling | null;
  alerts: Array<{
    id: string;
    recipient_type: 'student' | 'guardian' | 'owner';
    alert_kind: 'checkin_goal' | 'financial_status';
    channel: string;
    status: string;
    alert_reference_date: string;
    remaining_checkins: number | null;
    message: string | null;
    sent_at: string;
  }>;
}

interface ResolvedStudent {
  student_id: string;
  profile_id: string;
  academy_id: string;
  belt: BeltLevel;
  started_at: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

async function getSupabase() {
  const { createBrowserClient } = await import('@/lib/supabase/client');
  return createBrowserClient();
}

async function resolveStudent(studentOrProfileId: string, academyId: string): Promise<ResolvedStudent | null> {
  const supabase = await getSupabase();

  const baseSelect = `
    id, profile_id, academy_id, belt, started_at,
    profiles!students_profile_id_fkey(display_name, email, phone, avatar)
  `;

  const [{ data: byStudent }, { data: byProfile }] = await Promise.all([
    supabase.from('students').select(baseSelect).eq('academy_id', academyId).eq('id', studentOrProfileId).maybeSingle(),
    supabase.from('students').select(baseSelect).eq('academy_id', academyId).eq('profile_id', studentOrProfileId).maybeSingle(),
  ]);

  const row = (byStudent ?? byProfile) as Record<string, unknown> | null;
  if (!row) return null;

  const profile = row.profiles as Record<string, unknown> | null;
  return {
    student_id: row.id as string,
    profile_id: row.profile_id as string,
    academy_id: row.academy_id as string,
    belt: row.belt as BeltLevel,
    started_at: row.started_at as string,
    display_name: (profile?.display_name ?? 'Aluno') as string,
    email: (profile?.email ?? '') as string,
    phone: (profile?.phone ?? '') as string,
    avatar_url: (profile?.avatar ?? null) as string | null,
  };
}

export async function getAdminStudentDetail(
  studentOrProfileId: string,
  academyId: string,
): Promise<AdminStudentDetail | null> {
  try {
    if (isMock()) return null;

    const resolved = await resolveStudent(studentOrProfileId, academyId);
    if (!resolved) return null;

    const supabase = await getSupabase();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      membershipRes,
      enrollmentsRes,
      attendanceTotalRes,
      attendanceMonthRes,
      lastAttendanceRes,
      alertsRes,
    ] = await Promise.all([
      supabase
        .from('memberships')
        .select('id, role')
        .eq('academy_id', academyId)
        .eq('profile_id', resolved.profile_id)
        .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
        .maybeSingle(),
      supabase
        .from('class_enrollments')
        .select('classes(modalities(name))')
        .eq('student_id', resolved.student_id)
        .eq('status', 'active'),
      supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', resolved.student_id),
      supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', resolved.student_id)
        .gte('checked_at', monthStart),
      supabase
        .from('attendance')
        .select('checked_at')
        .eq('student_id', resolved.student_id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('student_financial_alerts')
        .select('id, recipient_type, alert_kind, channel, status, alert_reference_date, remaining_checkins, message, sent_at')
        .eq('academy_id', academyId)
        .eq('profile_id', resolved.profile_id)
        .order('sent_at', { ascending: false })
        .limit(20),
    ]);

    const membership = membershipRes.data as { id: string; role: string } | null;
    if (!membership?.id) return null;

    const financialProfile = await getMemberBilling(membership.id);
    const paymentHistory = await getPaymentHistory(academyId, resolved.profile_id);

    const turmas = (enrollmentsRes.data ?? [])
      .map((row: Record<string, unknown>) => {
        const classes = row.classes as Record<string, unknown> | null;
        const modality = classes?.modalities as Record<string, unknown> | null;
        return (modality?.name ?? '') as string;
      })
      .filter(Boolean);

    return {
      ...resolved,
      membership_id: membership.id,
      role: membership.role,
      turmas,
      attendance_total: attendanceTotalRes.count ?? 0,
      attendance_this_month: attendanceMonthRes.count ?? 0,
      last_attendance_at: (lastAttendanceRes.data?.checked_at as string | undefined) ?? null,
      payment_history: paymentHistory,
      financial_profile: financialProfile,
      alerts: (alertsRes.data ?? []) as AdminStudentDetail['alerts'],
    };
  } catch (error) {
    logServiceError(error, 'admin-student-detail');
    return null;
  }
}
