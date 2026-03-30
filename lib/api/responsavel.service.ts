import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types/domain';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export type WeekdayAttendance = 'present' | 'absent' | 'pending' | 'none';

export interface ChildWeekAttendanceDTO {
  mon: WeekdayAttendance;
  tue: WeekdayAttendance;
  wed: WeekdayAttendance;
  thu: WeekdayAttendance;
  fri: WeekdayAttendance;
}

export interface JourneyMilestoneDTO {
  id: string;
  title: string;
  date: string;
  emoji: string;
}

export interface TeacherMessagePreviewDTO {
  id: string;
  teacher_name: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface ChildPaymentDTO {
  plan_name: string;
  price: number;
  status: 'em_dia' | 'pendente' | 'atrasado';
}

export interface ChildHealthScoreDTO {
  score: number;
  label: string;
  color: string;
}

export interface GuardianChildDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  age: number;
  belt: BeltLevel;
  belt_label: string;
  frequency_percent: number;
  payment: ChildPaymentDTO;
  health_score: ChildHealthScoreDTO;
  week_attendance: ChildWeekAttendanceDTO;
  journey_milestones: JourneyMilestoneDTO[];
  messages: TeacherMessagePreviewDTO[];
}

export interface GuardianConsolidatedDTO {
  total_monthly: number;
  child_count: number;
}

export interface GuardianDashboardDTO {
  profile_id: string;
  guardian_name: string;
  children: GuardianChildDTO[];
  consolidated: GuardianConsolidatedDTO | null;
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

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getGuardianDashboard(profileId: string): Promise<GuardianDashboardDTO> {
  if (isMock()) {
    const { mockGetGuardianDashboard } = await import('@/lib/mocks/responsavel.mock');
    return mockGetGuardianDashboard(profileId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Try denormalized table first
  const { data, error } = await supabase
    .from('guardian_dashboards')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!error && data) {
    return data as unknown as GuardianDashboardDTO;
  }

  // Fallback: build from guardian_links + students + attendance
  try {
    return await buildGuardianDashboardFromTables(supabase, profileId);
  } catch (err) {
    logServiceError(err, 'responsavel');
    return {
      profile_id: profileId,
      guardian_name: '',
      children: [],
      consolidated: null,
    };
  }
}

async function buildGuardianDashboardFromTables(
  supabase: ReturnType<Awaited<typeof import('@/lib/supabase/client')>['createBrowserClient']>,
  profileId: string,
): Promise<GuardianDashboardDTO> {
  // 1. Get guardian name
  const { data: guardianProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', profileId)
    .maybeSingle();

  // 2. Get children via guardian_links
  const { data: links } = await supabase
    .from('guardian_links')
    .select('child_id')
    .eq('guardian_id', profileId);

  const childProfileIds = (links ?? []).map((l: Record<string, unknown>) => l.child_id as string);
  if (childProfileIds.length === 0) {
    return {
      profile_id: profileId,
      guardian_name: (guardianProfile as Record<string, unknown>)?.display_name as string ?? '',
      children: [],
      consolidated: null,
    };
  }

  // 3. Get children profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar, birth_date')
    .in('id', childProfileIds);

  const profileMap = new Map(
    ((profiles ?? []) as Array<{ id: string; display_name: string; avatar: string | null; birth_date: string | null }>)
      .map(p => [p.id, p])
  );

  // 4. Get student records
  const { data: students } = await supabase
    .from('students')
    .select('id, profile_id, belt')
    .in('profile_id', childProfileIds);

  const studentByProfile = new Map(
    ((students ?? []) as Array<{ id: string; profile_id: string; belt: string }>)
      .map(s => [s.profile_id, s])
  );
  const studentIds = ((students ?? []) as Array<{ id: string }>).map(s => s.id);

  // 5. Get this week's attendance
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const weekAttendanceByStudent = new Map<string, Set<number>>();
  const totalAttendanceByStudent = new Map<string, number>();

  if (studentIds.length > 0) {
    const { data: weekAttendance } = await supabase
      .from('attendance')
      .select('student_id, checked_at')
      .in('student_id', studentIds)
      .gte('checked_at', monday.toISOString())
      .lte('checked_at', friday.toISOString());

    for (const a of ((weekAttendance ?? []) as Array<{ student_id: string; checked_at: string }>)) {
      const daysSet = weekAttendanceByStudent.get(a.student_id) ?? new Set<number>();
      const d = new Date(a.checked_at);
      daysSet.add(d.getDay()); // 0=Sun, 1=Mon, ...
      weekAttendanceByStudent.set(a.student_id, daysSet);
    }

    // Get total attendance count for frequency calculation
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: monthAttendance } = await supabase
      .from('attendance')
      .select('student_id')
      .in('student_id', studentIds)
      .gte('checked_at', monthStart);

    for (const a of ((monthAttendance ?? []) as Array<{ student_id: string }>)) {
      totalAttendanceByStudent.set(a.student_id, (totalAttendanceByStudent.get(a.student_id) ?? 0) + 1);
    }
  }

  // 6. Build children array
  const children: GuardianChildDTO[] = childProfileIds.map((pid: string) => {
    const profile = profileMap.get(pid);
    const student = studentByProfile.get(pid);
    const birthDate = profile?.birth_date ? new Date(profile.birth_date) : null;
    const age = birthDate
      ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    const belt = (student?.belt ?? 'white') as BeltLevel;
    const studentId = student?.id ?? '';
    const weekDays = weekAttendanceByStudent.get(studentId) ?? new Set<number>();
    const monthCount = totalAttendanceByStudent.get(studentId) ?? 0;
    // Estimate frequency as monthly attendance / expected (assume ~20 class days)
    const freqPercent = Math.min(100, Math.round((monthCount / 20) * 100));

    const todayDow = now.getDay();
    function dayStatus(dow: number): WeekdayAttendance {
      if (weekDays.has(dow)) return 'present';
      if (dow < todayDow) return 'absent';
      if (dow === todayDow) return 'pending';
      return 'none';
    }

    return {
      student_id: studentId,
      display_name: profile?.display_name ?? '',
      avatar: profile?.avatar ?? null,
      age,
      belt,
      belt_label: BELT_LABELS[belt] ?? 'Faixa Branca',
      frequency_percent: freqPercent,
      payment: { plan_name: '', price: 0, status: 'em_dia' as const },
      health_score: { score: freqPercent, label: freqPercent >= 80 ? 'Excelente' : freqPercent >= 60 ? 'Bom' : 'Regular', color: freqPercent >= 80 ? '#10b981' : freqPercent >= 60 ? '#f59e0b' : '#ef4444' },
      week_attendance: {
        mon: dayStatus(1),
        tue: dayStatus(2),
        wed: dayStatus(3),
        thu: dayStatus(4),
        fri: dayStatus(5),
      },
      journey_milestones: [],
      messages: [],
    };
  });

  return {
    profile_id: profileId,
    guardian_name: (guardianProfile as Record<string, unknown>)?.display_name as string ?? '',
    children,
    consolidated: {
      total_monthly: 0,
      child_count: children.length,
    },
  };
}
