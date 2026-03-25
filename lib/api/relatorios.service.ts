import { isMock } from '@/lib/env';

export type ReportType = 'presenca' | 'evolucao' | 'financeiro' | 'retencao' | 'performance';

export interface ReportFilters {
  type: ReportType;
  from: string;
  to: string;
  turma_id?: string;
}

export interface ReportDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface ReportResult {
  type: ReportType;
  title: string;
  data: ReportDataPoint[];
  summary: Record<string, string | number>;
}

export async function getReport(academyId: string, filters: ReportFilters): Promise<ReportResult> {
  const empty: ReportResult = { type: filters.type, title: '', data: [], summary: {} };

  try {
    if (isMock()) {
      const { mockGetReport } = await import('@/lib/mocks/relatorios.mock');
      return mockGetReport(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .rpc('get_report', {
        p_academy_id: academyId,
        p_type: filters.type,
        p_from: filters.from,
        p_to: filters.to,
        p_turma_id: filters.turma_id ?? null,
      });

    if (error || !data) {
      console.error('[getReport] Supabase error:', error?.message);
      return empty;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return (row as ReportResult) ?? empty;
  } catch (error) {
    console.error('[getReport] Fallback:', error);
    return empty;
  }
}

export async function exportReport(_academyId: string, _filters: ReportFilters, _format: 'pdf' | 'excel'): Promise<void> {
  // Placeholder — real implementation in Phase 8
}
