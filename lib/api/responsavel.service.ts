import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types/domain';

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
  const { data, error } = await supabase
    .from('guardian_dashboards')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error || !data) {
    console.error('[getGuardianDashboard] Supabase error:', error?.message);
    const { mockGetGuardianDashboard } = await import('@/lib/mocks/responsavel.mock');
    return mockGetGuardianDashboard(profileId);
  }
  return data as unknown as GuardianDashboardDTO;
}
