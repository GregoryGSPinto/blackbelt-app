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
    console.warn('[financial.listMensalidades] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[financial.markAsPaid] fallback — not yet connected to Supabase');
    return { id: mensalidadeId, student_id: '', student_name: '', academy_id: '', amount: 0, due_date: '', status: 'pago', paid_at: new Date().toISOString(), payment_method: method, reference_month: '' } as Mensalidade;
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
    console.warn('[financial.getSummary] fallback — not yet connected to Supabase');
    return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 } as FinancialSummary;
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
    console.warn('[financial.getRevenueChart] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[financial.getOverdueList] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'financial.getOverdueList');
  }
}

export async function generateMonthlyBills(_academyId: string, _month: string): Promise<{ generated: number }> {
  try {
    if (isMock()) {
      return { generated: 172 };
    }
    console.warn('[financial.generateMonthlyBills] fallback — not yet connected to Supabase');
    return { generated: 0 };
  } catch (error) {
    handleServiceError(error, 'financial.generateMonthlyBills');
  }
}
