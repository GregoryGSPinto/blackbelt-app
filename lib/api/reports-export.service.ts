import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export async function generatePresencaReport(academyId: string, period: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório de Presença — ${period}`, academyId);
    }
    try {
      const res = await fetch(`/api/reports/presenca?academyId=${academyId}&period=${period}`);
      return res.blob();
    } catch {
      console.warn('[reports-export.generatePresencaReport] API not available, using fallback');
      return {} as Blob;
    }
  } catch (error) { handleServiceError(error, 'reports.presenca'); }
}

export async function generateFinanceiroReport(academyId: string, period: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório Financeiro — ${period}`, academyId);
    }
    try {
      const res = await fetch(`/api/reports/financeiro?academyId=${academyId}&period=${period}`);
      return res.blob();
    } catch {
      console.warn('[reports-export.generateFinanceiroReport] API not available, using fallback');
      return {} as Blob;
    }
  } catch (error) { handleServiceError(error, 'reports.financeiro'); }
}

export async function generateAlunoReport(studentId: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório do Aluno`, studentId);
    }
    try {
      const res = await fetch(`/api/reports/aluno/${studentId}`);
      return res.blob();
    } catch {
      console.warn('[reports-export.generateAlunoReport] API not available, using fallback');
      return {} as Blob;
    }
  } catch (error) { handleServiceError(error, 'reports.aluno'); }
}

export async function generateRankingReport(academyId: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Ranking Geral`, academyId);
    }
    try {
      const res = await fetch(`/api/reports/ranking?academyId=${academyId}`);
      return res.blob();
    } catch {
      console.warn('[reports-export.generateRankingReport] API not available, using fallback');
      return {} as Blob;
    }
  } catch (error) { handleServiceError(error, 'reports.ranking'); }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
