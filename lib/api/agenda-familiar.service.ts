import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/agenda-familiar/calendar?profileId=${profileId}`);
      if (!res.ok) throw new ServiceError(res.status, 'agenda-familiar.calendar');
      return res.json();
    } catch {
      console.warn('[agenda-familiar.getFamilyCalendar] API not available, using fallback');
      return { profile_id: '', week_start: '', week_end: '', events: [] } as FamilyCalendarDTO;
    }
  } catch (error) {
    handleServiceError(error, 'agenda-familiar.calendar');
  }
}

export async function getMonthlyReport(profileId: string, month: string): Promise<MonthlyReportDTO> {
  try {
    if (isMock()) {
      const { mockGetMonthlyReport } = await import('@/lib/mocks/agenda-familiar.mock');
      return mockGetMonthlyReport(profileId, month);
    }
    try {
      const res = await fetch(`/api/agenda-familiar/report?profileId=${profileId}&month=${month}`);
      if (!res.ok) throw new ServiceError(res.status, 'agenda-familiar.report');
      return res.json();
    } catch {
      console.warn('[agenda-familiar.getMonthlyReport] API not available, using fallback');
      return { profile_id: '', month_label: '', month: '', children: [], payments: [], total_paid: 0 } as MonthlyReportDTO;
    }
  } catch (error) {
    handleServiceError(error, 'agenda-familiar.report');
  }
}
