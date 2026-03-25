import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface FamilyCalendarEventDTO {
  id: string;
  child_name: string;
  child_avatar: string | null;
  class_name: string;
  day_of_week: number;
  day_label: string;
  time: string;
  color: string;
}

export interface FamilyCalendarDTO {
  profile_id: string;
  week_start: string;
  week_end: string;
  events: FamilyCalendarEventDTO[];
}

export interface MonthlyChildReportDTO {
  student_id: string;
  display_name: string;
  attendance_count: number;
  attendance_total: number;
  attendance_percent: number;
  xp_gained: number;
  belt_current: string;
  achievements_count: number;
  highlights: string[];
}

export interface MonthlyPaymentSummaryDTO {
  child_name: string;
  plan_name: string;
  amount: number;
  status: 'em_dia' | 'pendente' | 'atrasado';
}

export interface MonthlyReportDTO {
  profile_id: string;
  month_label: string;
  month: string;
  children: MonthlyChildReportDTO[];
  payments: MonthlyPaymentSummaryDTO[];
  total_paid: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getFamilyCalendar(profileId: string): Promise<FamilyCalendarDTO> {
  try {
    if (isMock()) {
      const { mockGetFamilyCalendar } = await import('@/lib/mocks/agenda-familiar.mock');
      return mockGetFamilyCalendar(profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('family_calendar')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error || !data) {
      console.error('[getFamilyCalendar] Supabase error:', error?.message);
      return { profile_id: profileId, week_start: '', week_end: '', events: [] };
    }

    return data as unknown as FamilyCalendarDTO;
  } catch (error) {
    console.error('[getFamilyCalendar] Fallback:', error);
    return { profile_id: profileId, week_start: '', week_end: '', events: [] };
  }
}

export async function getMonthlyReport(profileId: string, month: string): Promise<MonthlyReportDTO> {
  try {
    if (isMock()) {
      const { mockGetMonthlyReport } = await import('@/lib/mocks/agenda-familiar.mock');
      return mockGetMonthlyReport(profileId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('family_monthly_reports')
      .select('*')
      .eq('profile_id', profileId)
      .eq('month', month)
      .single();

    if (error || !data) {
      console.error('[getMonthlyReport] Supabase error:', error?.message);
      return { profile_id: profileId, month_label: '', month, children: [], payments: [], total_paid: 0 };
    }

    return data as unknown as MonthlyReportDTO;
  } catch (error) {
    console.error('[getMonthlyReport] Fallback:', error);
    return { profile_id: profileId, month_label: '', month, children: [], payments: [], total_paid: 0 };
  }
}
