import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';
import { logServiceError, handleServiceError } from '@/lib/api/errors';

type InvRow = {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  payment_notes: string | null;
  manual_payment: boolean;
  subscriptions: {
    student_id: string;
    students: { profiles: { display_name: string } | null } | null;
    plans: { academy_id: string } | null;
  } | null;
};

const INVOICE_SELECT = `
  id, amount, status, due_date, paid_at, payment_method, payment_notes, manual_payment,
  subscriptions!inner(
    student_id,
    students(profiles(display_name)),
    plans!inner(academy_id)
  )
`;

function mapStatus(status: string, dueDate: string): 'pago' | 'pendente' | 'atrasado' | 'isento' {
  if (status === 'paid') return 'pago';
  const overdue = new Date(dueDate) < new Date();
  return overdue ? 'atrasado' : 'pendente';
}

function toMensalidade(inv: InvRow): Mensalidade {
  const sub = inv.subscriptions;
  const studentName = (sub?.students?.profiles?.display_name ?? 'Aluno') as string;
  return {
    id: inv.id,
    student_id: sub?.student_id ?? '',
    student_name: studentName,
    academy_id: (sub?.plans?.academy_id ?? '') as string,
    amount: inv.amount,
    due_date: inv.due_date,
    status: mapStatus(inv.status, inv.due_date),
    paid_at: inv.paid_at,
    payment_method: inv.payment_method as Mensalidade['payment_method'],
    payment_notes: inv.payment_notes ?? null,
    manual_payment: inv.manual_payment ?? false,
    reference_month: inv.due_date?.slice(0, 7) ?? '',
  };
}

export async function listMensalidades(
  academyId: string,
  filters?: { month?: string; status?: string; search?: string },
): Promise<Mensalidade[]> {
  if (isMock()) {
    const { mockListMensalidades } = await import('@/lib/mocks/financial.mock');
    return mockListMensalidades(academyId, filters);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('subscriptions.plans.academy_id', academyId)
      .order('due_date', { ascending: false });
    if (filters?.month) {
      const start = `${filters.month}-01`;
      const [y, m] = filters.month.split('-').map(Number);
      const end = new Date(y, m, 0).toISOString().slice(0, 10);
      query = query.gte('due_date', start).lte('due_date', end);
    }
    const { data, error } = await query;
    if (error) {
      logServiceError(error, 'financial');
      return [];
    }
    let results = (data ?? []).map((inv: unknown) => toMensalidade(inv as InvRow));
    if (filters?.status) results = results.filter((m: Mensalidade) => m.status === filters.status);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter((m: Mensalidade) => m.student_name.toLowerCase().includes(s));
    }
    return results;
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function markAsPaid(
  invoiceId: string,
  method: 'PIX' | 'boleto' | 'cartao',
): Promise<Mensalidade> {
  if (isMock()) {
    const { mockMarkAsPaid } = await import('@/lib/mocks/financial.mock');
    return mockMarkAsPaid(invoiceId, method);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: method })
    .eq('id', invoiceId)
    .select(INVOICE_SELECT)
    .single();
  if (error) {
    logServiceError(error, 'financial');
    throw new Error(`[markAsPaid] Failed to mark as paid: ${error.message}`);
  }
  trackFeatureUsage('financial', 'create', { method });
  return toMensalidade(data as unknown as InvRow);
}

export async function markAsManuallyPaid(
  invoiceId: string,
  paymentMethod: string,
  notes: string,
): Promise<Mensalidade> {
  if (isMock()) {
    const { mockMarkAsManuallyPaid } = await import('@/lib/mocks/financial.mock');
    return mockMarkAsManuallyPaid(invoiceId, paymentMethod, notes);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        payment_notes: notes || null,
        manual_payment: true,
      })
      .eq('id', invoiceId)
      .select(INVOICE_SELECT)
      .single();
    if (error) {
      handleServiceError(error, 'financial.markAsManuallyPaid');
    }
    trackFeatureUsage('financial', 'create', { method: paymentMethod, manual: true });
    return toMensalidade(data as unknown as InvRow);
  } catch (error) {
    handleServiceError(error, 'financial.markAsManuallyPaid');
  }
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  if (isMock()) {
    const { mockGetFinancialSummary } = await import('@/lib/mocks/financial.mock');
    return mockGetFinancialSummary(academyId);
  }

  const empty: FinancialSummary = { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 };
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const endOfPrev = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

    const [curRes, prevRes] = await Promise.all([
      supabase.from('invoices').select('amount, status, due_date, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).gte('due_date', startOfMonth).lte('due_date', endOfMonth),
      supabase.from('invoices').select('amount, status, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).gte('due_date', startOfPrev).lte('due_date', endOfPrev),
    ]);

    type Row = { amount: number; status: string; due_date?: string };
    const cur = (curRes.data ?? []) as Row[];
    const prev = (prevRes.data ?? []) as Row[];

    const paidCur = cur.filter((i) => i.status === 'paid');
    const revenue_this_month = paidCur.reduce((s, i) => s + i.amount, 0);
    const revenue_last_month = prev.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

    const today = now.toISOString().slice(0, 10);
    const unpaid = cur.filter((i) => i.status !== 'paid');
    const overdue = unpaid.filter((i) => (i.due_date ?? '') < today);
    const pending = unpaid.filter((i) => (i.due_date ?? '') >= today);

    return {
      revenue_this_month,
      revenue_last_month,
      pending_amount: pending.reduce((s, i) => s + i.amount, 0),
      overdue_amount: overdue.reduce((s, i) => s + i.amount, 0),
      overdue_count: overdue.length,
      paid_count: paidCur.length,
      total_count: cur.length,
      ticket_medio: paidCur.length > 0 ? Math.round(revenue_this_month / paidCur.length) : 0,
    };
  } catch (error) {
    logServiceError(error, 'financial');
    return empty;
  }
}

export async function getRevenueChart(academyId: string): Promise<FinancialChartPoint[]> {
  if (isMock()) {
    const { mockGetRevenueChart } = await import('@/lib/mocks/financial.mock');
    return mockGetRevenueChart(academyId);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const now = new Date();
    const points: FinancialChartPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const start = d.toISOString().slice(0, 10);
      const end = monthEnd.toISOString().slice(0, 10);
      const { data } = await supabase
        .from('invoices')
        .select('amount, status, subscriptions!inner(plans!inner(academy_id))')
        .eq('subscriptions.plans.academy_id', academyId)
        .gte('due_date', start)
        .lte('due_date', end);
      type Row = { amount: number; status: string };
      const rows = (data ?? []) as Row[];
      const receita = rows.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
      const pendente = rows.filter((r) => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);
      points.push({ month: d.toLocaleDateString('pt-BR', { month: 'short' }), receita, pendente });
    }
    return points;
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function getOverdueList(academyId: string): Promise<OverdueItem[]> {
  if (isMock()) {
    const { mockGetOverdueList } = await import('@/lib/mocks/financial.mock');
    return mockGetOverdueList(academyId);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('subscriptions.plans.academy_id', academyId)
      .in('status', ['open', 'uncollectible'])
      .lt('due_date', today);
    if (error) {
      logServiceError(error, 'financial');
      return [];
    }
    const now = Date.now();
    return (data ?? []).map((inv: unknown) => {
      const row = inv as InvRow;
      const sub = row.subscriptions;
      return {
        student_id: sub?.student_id ?? '',
        student_name: (sub?.students?.profiles?.display_name ?? 'Aluno') as string,
        amount: row.amount,
        due_date: row.due_date,
        days_overdue: Math.floor((now - new Date(row.due_date).getTime()) / 86400000),
        reference_month: row.due_date?.slice(0, 7) ?? '',
      };
    });
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function generateMonthlyBills(_academyId: string, _month: string): Promise<{ generated: number }> {
  if (isMock()) {
    return { generated: 172 };
  }

  logServiceError(new Error('fallback — not yet connected to Supabase'), 'financial');
  throw new Error('[generateMonthlyBills] Not yet connected to Supabase');
}
