import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { AnalyticsOverview, StudentAnalytics, ChurnPrediction } from '@/lib/types/analytics';

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
  try {
    if (isMock()) {
      const { mockGetRetentionCohort } = await import('@/lib/mocks/analytics.mock');
      return mockGetRetentionCohort(academyId, months);
    }
    // API not yet implemented — use mock
    const { mockGetRetentionCohort } = await import('@/lib/mocks/analytics.mock');
      return mockGetRetentionCohort(academyId, months);
  } catch (error) { handleServiceError(error, 'analytics.retention'); }
}

export async function getChurnRisk(academyId: string): Promise<ChurnRiskDTO[]> {
  try {
    if (isMock()) {
      const { mockGetChurnRisk } = await import('@/lib/mocks/analytics.mock');
      return mockGetChurnRisk(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetChurnRisk } = await import('@/lib/mocks/analytics.mock');
      return mockGetChurnRisk(academyId);
  } catch (error) { handleServiceError(error, 'analytics.churnRisk'); }
}

export async function getRevenueForecasting(academyId: string, months: number): Promise<ForecastDTO> {
  try {
    if (isMock()) {
      const { mockGetRevenueForecasting } = await import('@/lib/mocks/analytics.mock');
      return mockGetRevenueForecasting(academyId, months);
    }
    // API not yet implemented — use mock
    const { mockGetRevenueForecasting } = await import('@/lib/mocks/analytics.mock');
      return mockGetRevenueForecasting(academyId, months);
  } catch (error) { handleServiceError(error, 'analytics.forecast'); }
}

export async function getProfessorPerformance(academyId: string): Promise<ProfessorMetricsDTO[]> {
  try {
    if (isMock()) {
      const { mockGetProfessorPerformance } = await import('@/lib/mocks/analytics.mock');
      return mockGetProfessorPerformance(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetProfessorPerformance } = await import('@/lib/mocks/analytics.mock');
      return mockGetProfessorPerformance(academyId);
  } catch (error) { handleServiceError(error, 'analytics.professorPerf'); }
}

// ── Analytics Overview (P-053) ────────────────────────────────

export async function getAnalyticsOverview(
  academyId: string,
  period?: { start: string; end: string },
): Promise<AnalyticsOverview> {
  try {
    if (isMock()) {
      const { mockAnalyticsOverview } = await import('@/lib/mocks/analytics.mock');
      return mockAnalyticsOverview(academyId, period);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (period) {
        params.set('start', period.start);
        params.set('end', period.end);
      }
      const res = await fetch(`/api/analytics/overview?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'analytics.overview');
      return res.json();
    } catch {
      console.warn('[analytics.getAnalyticsOverview] API not available, using mock fallback');
      const { mockAnalyticsOverview } = await import('@/lib/mocks/analytics.mock');
      return mockAnalyticsOverview(academyId, period);
    }

  } catch (error) { handleServiceError(error, 'analytics.overview'); }
}

// ── Student Analytics (P-055) ─────────────────────────────────

export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
  try {
    if (isMock()) {
      const { mockStudentAnalytics } = await import('@/lib/mocks/analytics.mock');
      return mockStudentAnalytics(studentId);
    }
    // API not yet implemented — use mock
    const { mockStudentAnalytics } = await import('@/lib/mocks/analytics.mock');
      return mockStudentAnalytics(studentId);
  } catch (error) { handleServiceError(error, 'analytics.student'); }
}

// ── Churn Predictions (P-056) ─────────────────────────────────

export async function getChurnPredictions(academyId: string): Promise<ChurnPrediction[]> {
  try {
    if (isMock()) {
      const { mockChurnPredictions } = await import('@/lib/mocks/analytics.mock');
      return mockChurnPredictions(academyId);
    }
    // API not yet implemented — use mock
    const { mockChurnPredictions } = await import('@/lib/mocks/analytics.mock');
      return mockChurnPredictions(academyId);
  } catch (error) { handleServiceError(error, 'analytics.churn'); }
}

export async function getClassOccupancy(academyId: string): Promise<OccupancyDTO[]> {
  try {
    if (isMock()) {
      const { mockGetClassOccupancy } = await import('@/lib/mocks/analytics.mock');
      return mockGetClassOccupancy(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetClassOccupancy } = await import('@/lib/mocks/analytics.mock');
      return mockGetClassOccupancy(academyId);
  } catch (error) { handleServiceError(error, 'analytics.occupancy'); }
}
