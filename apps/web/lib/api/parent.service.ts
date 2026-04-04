import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

export interface ParentDashboardDTO {
  filhos: FilhoResumoDTO[];
  notificacoes: NotificacaoParentDTO[];
}

export interface FilhoResumoDTO {
  student_id: string;
  profile_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  belt_label: string;
  idade: number;
  role: string;
  presenca_mes: { total: number; presentes: number };
  ultima_aula: string | null;
  proxima_aula: string | null;
  pagamento_status: 'em_dia' | 'pendente' | 'atrasado';
  streak: number;
}

export interface NotificacaoParentDTO {
  id: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
}

const BELT_LABELS: Record<string, string> = {
  white: 'Faixa Branca',
  gray: 'Faixa Cinza',
  yellow: 'Faixa Amarela',
  orange: 'Faixa Laranja',
  green: 'Faixa Verde',
  blue: 'Faixa Azul',
  purple: 'Faixa Roxa',
  brown: 'Faixa Marrom',
  black: 'Faixa Preta',
};

export async function getParentDashboard(parentId: string): Promise<ParentDashboardDTO> {
  if (isMock()) {
    const { mockGetParentDashboard } = await import('@/lib/mocks/parent.mock');
    return mockGetParentDashboard(parentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // 1. Fetch children linked via guardian_links
  const { data: links, error: linksError } = await supabase
    .from('guardian_links')
    .select('child_id')
    .eq('guardian_id', parentId);

  if (linksError) {
    logServiceError(linksError, 'parent');
    return { filhos: [], notificacoes: [] };
  }

  const childProfileIds = (links ?? []).map((l: Record<string, unknown>) => l.child_id as string);
  if (childProfileIds.length === 0) {
    return { filhos: [], notificacoes: [] };
  }

  // 2. Fetch children's profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar, role, birth_date')
    .in('id', childProfileIds);

  const profileMap = new Map(
    ((profiles ?? []) as Array<{ id: string; display_name: string; avatar: string | null; role: string; birth_date: string | null }>)
      .map(p => [p.id, p])
  );

  // 3. Fetch student records for these children
  const { data: students } = await supabase
    .from('students')
    .select('id, profile_id, belt, started_at')
    .in('profile_id', childProfileIds);

  const studentByProfile = new Map(
    ((students ?? []) as Array<{ id: string; profile_id: string; belt: string; started_at: string }>)
      .map(s => [s.profile_id, s])
  );

  // 4. Fetch current month attendance for all students
  const studentIds = ((students ?? []) as Array<{ id: string }>).map(s => s.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const attendanceCounts = new Map<string, { total: number; presentes: number }>();
  const lastAttendanceMap = new Map<string, string>();

  if (studentIds.length > 0) {
    // Count attendance this month per student
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('student_id, checked_at')
      .in('student_id', studentIds)
      .gte('checked_at', monthStart)
      .lte('checked_at', monthEnd)
      .order('checked_at', { ascending: false });

    if (attendanceData) {
      for (const a of (attendanceData as Array<{ student_id: string; checked_at: string }>)) {
        const existing = attendanceCounts.get(a.student_id);
        if (existing) {
          existing.presentes++;
        } else {
          attendanceCounts.set(a.student_id, { total: 0, presentes: 1 });
          lastAttendanceMap.set(a.student_id, a.checked_at);
        }
      }
    }

    // Get class enrollments to determine total expected classes
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('student_id, class_id')
      .in('student_id', studentIds)
      .eq('status', 'active');

    if (enrollments) {
      const enrolledPerStudent = new Map<string, number>();
      for (const e of (enrollments as Array<{ student_id: string }>)) {
        enrolledPerStudent.set(e.student_id, (enrolledPerStudent.get(e.student_id) ?? 0) + 1);
      }
      // Estimate total = enrolled classes * ~4 weeks
      for (const [sid, count] of enrolledPerStudent) {
        const existing = attendanceCounts.get(sid);
        if (existing) {
          existing.total = count * 4;
        } else {
          attendanceCounts.set(sid, { total: count * 4, presentes: 0 });
        }
      }
    }
  }

  // 5. Build filhos array
  const filhos: FilhoResumoDTO[] = childProfileIds.map((profileId: string) => {
    const profile = profileMap.get(profileId);
    const student = studentByProfile.get(profileId);
    const birthDate = profile?.birth_date ? new Date(profile.birth_date) : null;
    const age = birthDate
      ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    const belt = (student?.belt ?? 'white') as BeltLevel;
    const studentId = student?.id ?? '';
    const attn = attendanceCounts.get(studentId) ?? { total: 0, presentes: 0 };

    return {
      student_id: studentId,
      profile_id: profileId,
      display_name: profile?.display_name ?? '',
      avatar: profile?.avatar ?? null,
      belt,
      belt_label: BELT_LABELS[belt] ?? 'Faixa Branca',
      idade: age,
      role: profile?.role ?? 'aluno_kids',
      presenca_mes: attn,
      ultima_aula: lastAttendanceMap.get(studentId) ?? null,
      proxima_aula: null,
      pagamento_status: 'em_dia' as const,
      streak: 0,
    };
  });

  // 6. Fetch notifications for this parent
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('id, message, type, created_at, read')
    .eq('profile_id', parentId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (notifError) {
    logServiceError(notifError, 'parent');
  }

  const notificacoes: NotificacaoParentDTO[] = (notifications ?? []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    message: n.message as string,
    type: n.type as string,
    time: n.created_at as string,
    read: n.read as boolean,
  }));

  return { filhos, notificacoes };
}
