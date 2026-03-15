import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
  try {
    if (isMock()) {
      const { mockGetReport } = await import('@/lib/mocks/relatorios.mock');
      return mockGetReport(academyId, filters);
    }
    const params = new URLSearchParams({
      academyId,
      type: filters.type,
      from: filters.from,
      to: filters.to,
    });
    if (filters.turma_id) params.set('turma_id', filters.turma_id);
    const res = await fetch(`/api/reports?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'relatorios.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'relatorios.get');
  }
}

export async function exportReport(_academyId: string, _filters: ReportFilters, _format: 'pdf' | 'excel'): Promise<void> {
  // Placeholder — real implementation in Phase 8
}
