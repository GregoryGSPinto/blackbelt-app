import { isMock } from '@/lib/env';
import type { AnalyticsOverview, StudentAnalytics, ChurnPrediction } from '@/lib/types/analytics';
import { logServiceError } from '@/lib/api/errors';

export interface CohortData {
  cohort_month: string;
  total_students: number;
  retention: number[];
}

export interface ChurnRiskDTO {
  student_id: string;
  student_name: string;
  belt: string;
  days_absent: number;
  frequency_trend: 'declining' | 'stable' | 'improving';
  risk_level: 'high' | 'medium' | 'low';
  last_class_date: string;
}

export interface ForecastDTO {
  current_mrr: number;
  projected_mrr: number[];
  churn_rate: number;
  growth_rate: number;
  months: string[];
}

export interface ProfessorMetricsDTO {
  professor_id: string;
  professor_name: string;
  avg_attendance: number;
  retention_rate: number;
  avg_evaluation: number;
  total_classes: number;
  total_students: number;
}

export interface OccupancyDTO {
  class_id: string;
  class_name: string;
  modality: string;
  capacity: number;
  enrolled: number;
  avg_present: number;
  occupancy_rate: number;
  day_of_week: number;
  time: string;
}

export async function getRetentionCohort(academyId: string, months: number): Promise<CohortData[]> {
  if (isMock()) {
    const { mockGetRetentionCohort } = await import('@/lib/mocks/analytics.mock');
    return mockGetRetentionCohort(academyId, months);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .rpc('get_retention_cohort', { p_academy_id: academyId, p_months: months });

  if (error || !data) {
    logServiceError(error, 'analytics');
    return [];
  }

  return (data as Record<string, unknown>[]).map((d) => ({
    cohort_month: (d.cohort_month as string) ?? '',
    total_students: (d.total_students as number) ?? 0,
    retention: (d.retention as number[]) ?? [],
  }));
}

export async function getChurnRisk(academyId: string): Promise<ChurnRiskDTO[]> {
  if (isMock()) {
    const { mockGetChurnRisk } = await import('@/lib/mocks/analytics.mock');
    return mockGetChurnRisk(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .rpc('get_churn_risk', { p_academy_id: academyId });

  if (error || !data) {
    logServiceError(error, 'analytics');
    return [];
  }

  return (data as Record<string, unknown>[]).map((d) => ({
    student_id: (d.student_id as string) ?? '',
    student_name: (d.student_name as string) ?? '',
    belt: (d.belt as string) ?? '',
    days_absent: (d.days_absent as number) ?? 0,
    frequency_trend: (d.frequency_trend as ChurnRiskDTO['frequency_trend']) ?? 'stable',
    risk_level: (d.risk_level as ChurnRiskDTO['risk_level']) ?? 'low',
    last_class_date: (d.last_class_date as string) ?? '',
  }));
}

export async function getRevenueForecasting(academyId: string, months: number): Promise<ForecastDTO> {
  if (isMock()) {
    const { mockGetRevenueForecasting } = await import('@/lib/mocks/analytics.mock');
    return mockGetRevenueForecasting(academyId, months);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .rpc('get_revenue_forecast', { p_academy_id: academyId, p_months: months });

  if (error || !data) {
    logServiceError(error, 'analytics');
    return { current_mrr: 0, projected_mrr: [], churn_rate: 0, growth_rate: 0, months: [] };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    current_mrr: (row?.current_mrr as number) ?? 0,
    projected_mrr: (row?.projected_mrr as number[]) ?? [],
    churn_rate: (row?.churn_rate as number) ?? 0,
    growth_rate: (row?.growth_rate as number) ?? 0,
    months: (row?.months as string[]) ?? [],
  };
}

export async function getProfessorPerformance(academyId: string): Promise<ProfessorMetricsDTO[]> {
  if (isMock()) {
    const { mockGetProfessorPerformance } = await import('@/lib/mocks/analytics.mock');
    return mockGetProfessorPerformance(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('professor_metrics')
    .select('professor_id, professor_name, avg_attendance, retention_rate, avg_evaluation, total_classes, total_students, academy_id')
    .eq('academy_id', academyId);

  if (error || !data) {
    logServiceError(error, 'analytics');
    return [];
  }

  return (data as Record<string, unknown>[]).map((d) => ({
    professor_id: (d.professor_id as string) ?? '',
    professor_name: (d.professor_name as string) ?? '',
    avg_attendance: (d.avg_attendance as number) ?? 0,
    retention_rate: (d.retention_rate as number) ?? 0,
    avg_evaluation: (d.avg_evaluation as number) ?? 0,
    total_classes: (d.total_classes as number) ?? 0,
    total_students: (d.total_students as number) ?? 0,
  }));
}

// ── Analytics Overview (P-053) ────────────────────────────────

export async function getAnalyticsOverview(
  academyId: string,
  period?: { start: string; end: string },
): Promise<AnalyticsOverview> {
  const emptyOverview: AnalyticsOverview = {
    studentsTimeline: [],
    revenueTimeline: [],
    retentionTimeline: [],
    attendanceByClass: [],
    popularHours: [],
    topModalities: [],
    comparison: {
      currentMonth: { students: 0, revenue: 0, retention: 0, attendance: 0 },
      previousMonth: { students: 0, revenue: 0, retention: 0, attendance: 0 },
      sameMonthLastYear: null,
    },
  };

  if (isMock()) {
    const { mockAnalyticsOverview } = await import('@/lib/mocks/analytics.mock');
    return mockAnalyticsOverview(academyId, period);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const params: Record<string, string> = { p_academy_id: academyId };
  if (period) {
    params.p_start = period.start;
    params.p_end = period.end;
  }
  const { data, error } = await supabase
    .rpc('get_analytics_overview', params);

  if (error || !data) {
    logServiceError(error, 'analytics');
    return emptyOverview;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return (row as AnalyticsOverview) ?? emptyOverview;
}

// ── Student Analytics (P-055) ─────────────────────────────────

export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
  const empty: StudentAnalytics = {
    studentId,
    attendanceHistory: [],
    quizScores: [],
    videoHoursPerWeek: [],
    comparisonWithAvg: {
      attendance: { student: 0, classAvg: 0 },
      quizAvg: { student: 0, classAvg: 0 },
      videoHours: { student: 0, classAvg: 0 },
    },
  };

  if (isMock()) {
    const { mockStudentAnalytics } = await import('@/lib/mocks/analytics.mock');
    return mockStudentAnalytics(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .rpc('get_student_analytics', { p_student_id: studentId });

  if (error || !data) {
    logServiceError(error, 'analytics');
    return empty;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return (row as StudentAnalytics) ?? empty;
}

// ── Churn Predictions (P-056) ─────────────────────────────────

export async function getChurnPredictions(academyId: string): Promise<ChurnPrediction[]> {
  if (isMock()) {
    const { mockChurnPredictions } = await import('@/lib/mocks/analytics.mock');
    return mockChurnPredictions(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .rpc('get_churn_predictions', { p_academy_id: academyId });

  if (error || !data) {
    logServiceError(error, 'analytics');
    return [];
  }

  return (data as ChurnPrediction[]) ?? [];
}

export async function getClassOccupancy(academyId: string): Promise<OccupancyDTO[]> {
  if (isMock()) {
    const { mockGetClassOccupancy } = await import('@/lib/mocks/analytics.mock');
    return mockGetClassOccupancy(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('class_occupancy')
    .select('class_id, class_name, modality, capacity, enrolled, avg_present, occupancy_rate, day_of_week, time, academy_id')
    .eq('academy_id', academyId);

  if (error || !data) {
    logServiceError(error, 'analytics');
    return [];
  }

  return (data as Record<string, unknown>[]).map((d) => ({
    class_id: (d.class_id as string) ?? '',
    class_name: (d.class_name as string) ?? '',
    modality: (d.modality as string) ?? '',
    capacity: (d.capacity as number) ?? 0,
    enrolled: (d.enrolled as number) ?? 0,
    avg_present: (d.avg_present as number) ?? 0,
    occupancy_rate: (d.occupancy_rate as number) ?? 0,
    day_of_week: (d.day_of_week as number) ?? 0,
    time: (d.time as string) ?? '',
  }));
}
