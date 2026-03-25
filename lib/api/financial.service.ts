import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';

export async function listMensalidades(
  academyId: string,
  filters?: { month?: string; status?: string; search?: string },
): Promise<Mensalidade[]> {
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
    console.error('[listMensalidades] error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as Mensalidade[];
}

export async function markAsPaid(
  mensalidadeId: string,
  method: 'PIX' | 'boleto' | 'cartao',
): Promise<Mensalidade> {
  if (isMock()) {
    const { mockMarkAsPaid } = await import('@/lib/mocks/financial.mock');
    return mockMarkAsPaid(mensalidadeId, method);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('mensalidades').update({ status: 'pago', paid_at: new Date().toISOString(), payment_method: method }).eq('id', mensalidadeId).select().single();
  if (error) {
    console.error('[markAsPaid] error:', error.message);
    throw new Error(`[markAsPaid] Failed to mark as paid: ${error.message}`);
  }
  trackFeatureUsage('financial', 'create', { method });
  return data as unknown as Mensalidade;
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  if (isMock()) {
    const { mockGetFinancialSummary } = await import('@/lib/mocks/financial.mock');
    return mockGetFinancialSummary(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('mensalidades').select('status, amount').eq('academy_id', academyId);
  if (error || !data) {
    console.error('[getFinancialSummary] error:', error?.message ?? 'no data');
    return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 } as FinancialSummary;
  }
  return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: data.length, ticket_medio: 0 } as FinancialSummary;
}

export async function getRevenueChart(academyId: string): Promise<FinancialChartPoint[]> {
  if (isMock()) {
    const { mockGetRevenueChart } = await import('@/lib/mocks/financial.mock');
    return mockGetRevenueChart(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('mensalidades').select('reference_month, amount, status').eq('academy_id', academyId).eq('status', 'pago');
  if (error) {
    console.error('[getRevenueChart] error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as FinancialChartPoint[];
}

export async function getOverdueList(academyId: string): Promise<OverdueItem[]> {
  if (isMock()) {
    const { mockGetOverdueList } = await import('@/lib/mocks/financial.mock');
    return mockGetOverdueList(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('mensalidades').select('*').eq('academy_id', academyId).eq('status', 'vencido');
  if (error) {
    console.error('[getOverdueList] error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as OverdueItem[];
}

export async function generateMonthlyBills(_academyId: string, _month: string): Promise<{ generated: number }> {
  if (isMock()) {
    return { generated: 172 };
  }

  console.error('[financial.generateMonthlyBills] fallback — not yet connected to Supabase');
  throw new Error('[generateMonthlyBills] Not yet connected to Supabase');
}
