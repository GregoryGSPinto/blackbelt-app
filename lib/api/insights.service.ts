import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type InsightSeverity = 'info' | 'warning' | 'critical';
export type InsightType = 'CHURN_ALERT' | 'REVENUE_DROP' | 'CLASS_FULL' | 'CLASS_EMPTY' | 'BELT_READY' | 'PAYMENT_OVERDUE' | 'ATTENDANCE_RECORD' | 'PROFESSOR_HIGHLIGHT';

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  actionUrl: string;
  data: Record<string, unknown>;
  created_at: string;
}

export async function generateInsights(academyId: string): Promise<Insight[]> {
  try {
    if (isMock()) {
      const { mockGenerateInsights } = await import('@/lib/mocks/insights.mock');
      return mockGenerateInsights(academyId);
    }
    try {
      const res = await fetch(`/api/insights?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'insights.generate');
      return res.json();
    } catch {
      console.warn('[insights.generateInsights] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'insights.generate'); }
}
