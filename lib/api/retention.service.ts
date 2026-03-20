import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────────

export interface RetentionSummary {
  currentRetention: number;
  retentionGoal: number;
  churnRate: number;
  avgTimeBeforeCancel: number; // months
  totalActive: number;
  totalChurned: number;
  classWithMostChurn: string;
}

export interface RetentionMonthData {
  month: string;
  retention: number;
  churned: number;
  newStudents: number;
}

export type ChurnReason = 'financial' | 'schedule' | 'moved' | 'injury' | 'motivation' | 'unknown';

export interface ChurnReasonData {
  reason: ChurnReason;
  label: string;
  count: number;
  percentage: number;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  avatar: string | null;
  belt: string;
  className: string;
  modality: string;
  daysWithoutTraining: number;
  trend: 'declining' | 'stable' | 'improving';
  lastCheckin: string | null;
  contacted: boolean;
}

export interface RetentionFilters {
  period?: '3m' | '6m' | '12m';
  className?: string;
  modality?: string;
}

export interface RetentionData {
  summary: RetentionSummary;
  monthlyData: RetentionMonthData[];
  churnReasons: ChurnReasonData[];
  atRiskStudents: AtRiskStudent[];
}

// ── Service functions ──────────────────────────────────────────────────

export async function getRetentionData(
  academyId: string,
  filters?: RetentionFilters,
): Promise<RetentionData> {
  try {
    if (isMock()) {
      const { mockGetRetentionData } = await import('@/lib/mocks/retention.mock');
      return mockGetRetentionData(academyId, filters);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (filters?.period) params.set('period', filters.period);
      if (filters?.className) params.set('className', filters.className);
      if (filters?.modality) params.set('modality', filters.modality);
      const res = await fetch(`/api/retention?${params}`);
      if (!res.ok) {
        console.warn('[getRetentionData] error:', `HTTP ${res.status}`);
        return { summary: { currentRetention: 0, retentionGoal: 0, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' }, monthlyData: [], churnReasons: [], atRiskStudents: [] } as RetentionData;
      }
      return res.json();
    } catch {
      console.warn('[retention.getRetentionData] API not available, using fallback');
      return { summary: { currentRetention: 0, retentionGoal: 0, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' }, monthlyData: [], churnReasons: [], atRiskStudents: [] } as RetentionData;
    }
  } catch (error) {
    console.warn('[getRetentionData] Fallback:', error);
    return { summary: { currentRetention: 0, retentionGoal: 0, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' }, monthlyData: [], churnReasons: [], atRiskStudents: [] } as RetentionData;
  }
}

export async function markStudentContacted(
  studentId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkContacted } = await import('@/lib/mocks/retention.mock');
      return mockMarkContacted(studentId);
    }
    try {
      const res = await fetch(`/api/retention/contact/${studentId}`, {
        method: 'POST',
      });
      if (!res.ok) {
        console.warn('[markStudentContacted] error:', `HTTP ${res.status}`);
      }
    } catch {
      console.warn('[retention.markStudentContacted] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[markStudentContacted] Fallback:', error);
  }
}
