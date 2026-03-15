import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/analytics/retention?academyId=${academyId}&months=${months}`);
    if (!res.ok) throw new ServiceError(res.status, 'analytics.retention');
    return res.json();
  } catch (error) { handleServiceError(error, 'analytics.retention'); }
}

export async function getChurnRisk(academyId: string): Promise<ChurnRiskDTO[]> {
  try {
    if (isMock()) {
      const { mockGetChurnRisk } = await import('@/lib/mocks/analytics.mock');
      return mockGetChurnRisk(academyId);
    }
    const res = await fetch(`/api/analytics/churn-risk?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'analytics.churnRisk');
    return res.json();
  } catch (error) { handleServiceError(error, 'analytics.churnRisk'); }
}

export async function getRevenueForecasting(academyId: string, months: number): Promise<ForecastDTO> {
  try {
    if (isMock()) {
      const { mockGetRevenueForecasting } = await import('@/lib/mocks/analytics.mock');
      return mockGetRevenueForecasting(academyId, months);
    }
    const res = await fetch(`/api/analytics/revenue-forecast?academyId=${academyId}&months=${months}`);
    if (!res.ok) throw new ServiceError(res.status, 'analytics.forecast');
    return res.json();
  } catch (error) { handleServiceError(error, 'analytics.forecast'); }
}

export async function getProfessorPerformance(academyId: string): Promise<ProfessorMetricsDTO[]> {
  try {
    if (isMock()) {
      const { mockGetProfessorPerformance } = await import('@/lib/mocks/analytics.mock');
      return mockGetProfessorPerformance(academyId);
    }
    const res = await fetch(`/api/analytics/professor-performance?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'analytics.professorPerf');
    return res.json();
  } catch (error) { handleServiceError(error, 'analytics.professorPerf'); }
}

export async function getClassOccupancy(academyId: string): Promise<OccupancyDTO[]> {
  try {
    if (isMock()) {
      const { mockGetClassOccupancy } = await import('@/lib/mocks/analytics.mock');
      return mockGetClassOccupancy(academyId);
    }
    const res = await fetch(`/api/analytics/occupancy?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'analytics.occupancy');
    return res.json();
  } catch (error) { handleServiceError(error, 'analytics.occupancy'); }
}
