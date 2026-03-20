import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('mensalidades').select('*').eq('academy_id', academyId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.month) query = query.eq('reference_month', filters.month);
    const { data, error } = await query;
    if (error) {
      console.warn('[listMensalidades] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Mensalidade[];
  } catch (error) {
    console.warn('[listMensalidades] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('mensalidades').update({ status: 'pago', paid_at: new Date().toISOString(), payment_method: method }).eq('id', mensalidadeId).select().single();
    if (error) {
      console.warn('[markAsPaid] error:', error.message);
      return { id: mensalidadeId, student_id: '', student_name: '', academy_id: '', amount: 0, due_date: '', status: 'pago', paid_at: new Date().toISOString(), payment_method: method, reference_month: '' } as Mensalidade;
    }
    trackFeatureUsage('financial', 'create', { method });
    return data as unknown as Mensalidade;
  } catch (error) {
    console.warn('[markAsPaid] Fallback:', error);
    return { id: mensalidadeId, student_id: '', student_name: '', academy_id: '', amount: 0, due_date: '', status: 'pago', paid_at: new Date().toISOString(), payment_method: method, reference_month: '' } as Mensalidade;
  }
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) {
      const { mockGetFinancialSummary } = await import('@/lib/mocks/financial.mock');
      return mockGetFinancialSummary(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('mensalidades').select('status, amount').eq('academy_id', academyId);
    if (error || !data) {
      console.warn('[getFinancialSummary] error:', error?.message ?? 'no data');
      return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 } as FinancialSummary;
    }
    return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: data.length, ticket_medio: 0 } as FinancialSummary;
  } catch (error) {
    console.warn('[getFinancialSummary] Fallback:', error);
    return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 } as FinancialSummary;
  }
}

export async function getRevenueChart(academyId: string): Promise<FinancialChartPoint[]> {
  try {
    if (isMock()) {
      const { mockGetRevenueChart } = await import('@/lib/mocks/financial.mock');
      return mockGetRevenueChart(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('mensalidades').select('reference_month, amount, status').eq('academy_id', academyId).eq('status', 'pago');
    if (error) {
      console.warn('[getRevenueChart] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as FinancialChartPoint[];
  } catch (error) {
    console.warn('[getRevenueChart] Fallback:', error);
    return [];
  }
}

export async function getOverdueList(academyId: string): Promise<OverdueItem[]> {
  try {
    if (isMock()) {
      const { mockGetOverdueList } = await import('@/lib/mocks/financial.mock');
      return mockGetOverdueList(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('mensalidades').select('*').eq('academy_id', academyId).eq('status', 'vencido');
    if (error) {
      console.warn('[getOverdueList] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as OverdueItem[];
  } catch (error) {
    console.warn('[getOverdueList] Fallback:', error);
    return [];
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
    console.warn('[generateMonthlyBills] Fallback:', error);
    return { generated: 0 };
  }
}
