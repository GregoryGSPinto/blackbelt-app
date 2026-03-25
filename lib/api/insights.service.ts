import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      console.error('[generateInsights] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Insight[];
  } catch (error) {
    console.error('[generateInsights] Fallback:', error);
    return [];
  }
}
