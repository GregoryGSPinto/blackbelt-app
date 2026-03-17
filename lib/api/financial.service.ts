import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';

export async function listMensalidades(
  academyId: string,
  filters?: { month?: string; status?: string; search?: string },
): Promise<Mensalidade[]> {
  try {
    if (isMock()) {
      const { mockListMensalidades } = await import('@/lib/mocks/financial.mock');
      return mockListMensalidades(academyId, filters);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.listMensalidades');
  }
}

export async function markAsPaid(
  mensalidadeId: string,
  method: 'PIX' | 'boleto' | 'cartao',
): Promise<Mensalidade> {
  try {
    if (isMock()) {
      const { mockMarkAsPaid } = await import('@/lib/mocks/financial.mock');
      return mockMarkAsPaid(mensalidadeId, method);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.markAsPaid');
  }
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) {
      const { mockGetFinancialSummary } = await import('@/lib/mocks/financial.mock');
      return mockGetFinancialSummary(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.getSummary');
  }
}

export async function getRevenueChart(academyId: string): Promise<FinancialChartPoint[]> {
  try {
    if (isMock()) {
      const { mockGetRevenueChart } = await import('@/lib/mocks/financial.mock');
      return mockGetRevenueChart(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.getRevenueChart');
  }
}

export async function getOverdueList(academyId: string): Promise<OverdueItem[]> {
  try {
    if (isMock()) {
      const { mockGetOverdueList } = await import('@/lib/mocks/financial.mock');
      return mockGetOverdueList(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.getOverdueList');
  }
}

export async function generateMonthlyBills(_academyId: string, _month: string): Promise<{ generated: number }> {
  try {
    if (isMock()) {
      return { generated: 172 };
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'financial.generateMonthlyBills');
  }
}
