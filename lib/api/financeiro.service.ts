import { isMock } from '@/lib/env';

// ── Types ─────────────────────────────────────────────────────────────

export interface DebtorRow {
  student_id: string;
  name: string;
  plan: string;
  amount: number;
  days_overdue: number;
}

export interface RecentPayment {
  id: string;
  name: string;
  plan: string;
  amount: number;
  method: 'PIX' | 'boleto' | 'cartao';
  date: string;
}

export interface PlanAnalysis {
  plan_id: string;
  plan_name: string;
  subscriber_count: number;
  revenue: number;
  pct_of_total: number;
}

export interface MonthlyRevenue {
  month: string;
  receita: number;
}

export interface FinanceiroData {
  receitaMes: number;
  receitaMesAnterior: number;
  metaMes: number;
  mrr: number;
  ticketMedio: number;
  inadimplenciaPct: number;
  previsaoProximoMes: number;
  debtors: DebtorRow[];
  recentPayments: RecentPayment[];
  planAnalysis: PlanAnalysis[];
  monthlyRevenue: MonthlyRevenue[];
}

// ── Service ───────────────────────────────────────────────────────────

export async function getFinanceiroData(academyId: string): Promise<FinanceiroData> {
  if (isMock()) {
    const { mockGetFinanceiroData } = await import('@/lib/mocks/financeiro.mock');
    return mockGetFinanceiroData(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Current month invoices (join through subscriptions → plans for academy_id)
  const { data: currentInvoices, error: invErr } = await supabase
    .from('invoices')
    .select('id, amount, status, due_date, subscription_id, subscriptions!inner(plans!inner(academy_id))')
    .eq('subscriptions.plans.academy_id', academyId)
    .gte('due_date', startOfMonth)
    .lte('due_date', endOfMonth);
  if (invErr) {
    console.error('[getFinanceiroData] Supabase error:', invErr.message);
    return { receitaMes: 0, receitaMesAnterior: 0, metaMes: 0, mrr: 0, ticketMedio: 0, inadimplenciaPct: 0, previsaoProximoMes: 0, debtors: [], recentPayments: [], planAnalysis: [], monthlyRevenue: [] };
  }

  // Previous month invoices
  const { data: prevInvoices } = await supabase
    .from('invoices')
    .select('id, amount, status, subscriptions!inner(plans!inner(academy_id))')
    .eq('subscriptions.plans.academy_id', academyId)
    .gte('due_date', startOfPrevMonth)
    .lte('due_date', endOfPrevMonth);

  type InvoiceRow = { id: string; amount: number; status: string; due_date: string; subscription_id?: string };
  const paidCurrent = (currentInvoices as InvoiceRow[] ?? []).filter((i: InvoiceRow) => i.status === 'paid');
  const receitaMes = paidCurrent.reduce((sum: number, i: InvoiceRow) => sum + i.amount, 0);

  const paidPrev = (prevInvoices as InvoiceRow[] ?? []).filter((i: InvoiceRow) => i.status === 'paid');
  const receitaMesAnterior = paidPrev.reduce((sum: number, i: InvoiceRow) => sum + i.amount, 0);

  const totalCurrent = (currentInvoices as InvoiceRow[] ?? []).reduce((sum: number, i: InvoiceRow) => sum + i.amount, 0);
  const inadimplenciaPct = totalCurrent > 0
    ? ((totalCurrent - receitaMes) / totalCurrent) * 100
    : 0;

  const ticketMedio = paidCurrent.length > 0 ? Math.round(receitaMes / paidCurrent.length) : 0;

  // Overdue invoices (debtors) — join through subscriptions → plans for academy filter
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select(`
      id, amount, due_date, status,
      subscriptions!inner(
        student_id,
        students(profiles(display_name)),
        plans!inner(name, academy_id)
      )
    `)
    .eq('subscriptions.plans.academy_id', academyId)
    .in('status', ['open', 'uncollectible'])
    .lt('due_date', now.toISOString().slice(0, 10));

  const debtors: DebtorRow[] = (overdueInvoices ?? []).map((inv: Record<string, unknown>) => {
    const sub = inv.subscriptions as Record<string, unknown> | null;
    const student = sub?.students as Record<string, unknown> | null;
    const profile = student?.profiles as Record<string, unknown> | null;
    const plan = sub?.plans as Record<string, unknown> | null;
    const dueDate = new Date(inv.due_date as string);
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      student_id: (sub?.student_id ?? '') as string,
      name: (profile?.display_name ?? '') as string,
      plan: (plan?.name ?? '') as string,
      amount: inv.amount as number,
      days_overdue: daysOverdue,
    };
  });

  // Recent paid invoices — join through subscriptions → plans for academy filter
  const { data: recentPaid } = await supabase
    .from('invoices')
    .select(`
      id, amount, due_date, status,
      subscriptions!inner(
        students(profiles(display_name)),
        plans!inner(name, academy_id)
      )
    `)
    .eq('subscriptions.plans.academy_id', academyId)
    .eq('status', 'paid')
    .order('updated_at', { ascending: false })
    .limit(10);

  const methods: Array<'PIX' | 'boleto' | 'cartao'> = ['PIX', 'boleto', 'cartao'];
  const recentPayments: RecentPayment[] = (recentPaid ?? []).map((inv: Record<string, unknown>, idx: number) => {
    const sub = inv.subscriptions as Record<string, unknown> | null;
    const student = sub?.students as Record<string, unknown> | null;
    const profile = student?.profiles as Record<string, unknown> | null;
    const plan = sub?.plans as Record<string, unknown> | null;
    return {
      id: inv.id as string,
      name: (profile?.display_name ?? '') as string,
      plan: (plan?.name ?? '') as string,
      amount: inv.amount as number,
      method: methods[idx % 3],
      date: (inv.due_date as string).slice(0, 10),
    };
  });

  // Plan analysis — subscriptions don't have academy_id, join through plans
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, plan_id, plans!inner(name, price, academy_id)')
    .eq('plans.academy_id', academyId)
    .eq('status', 'active');

  const planMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const sub of subscriptions ?? []) {
    const plan = (sub as Record<string, unknown>).plans as Record<string, unknown> | null;
    const pid = sub.plan_id;
    const existing = planMap.get(pid) ?? { name: (plan?.name ?? '') as string, count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += (plan?.price ?? 0) as number;
    planMap.set(pid, existing);
  }

  const totalRev = Array.from(planMap.values()).reduce((s, p) => s + p.revenue, 0);
  const planAnalysis: PlanAnalysis[] = Array.from(planMap.entries()).map(([pid, p]) => ({
    plan_id: pid,
    plan_name: p.name,
    subscriber_count: p.count,
    revenue: p.revenue,
    pct_of_total: totalRev > 0 ? Math.round((p.revenue / totalRev) * 100) : 0,
  }));

  // Monthly revenue (last 6 months)
  const monthlyRevenue: MonthlyRevenue[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const { data: monthInv } = await supabase
      .from('invoices')
      .select('amount, subscriptions!inner(plans!inner(academy_id))')
      .eq('subscriptions.plans.academy_id', academyId)
      .eq('status', 'paid')
      .gte('due_date', d.toISOString().slice(0, 10))
      .lte('due_date', monthEnd.toISOString().slice(0, 10));

    const receita = (monthInv ?? []).reduce((s: number, inv: { amount: number }) => s + inv.amount, 0);
    monthlyRevenue.push({
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
      receita,
    });
  }

  // Meta and forecast (simple estimate)
  const metaMes = Math.round(receitaMesAnterior * 1.1);
  const previsaoProximoMes = Math.round(receitaMes * 1.05);

  return {
    receitaMes,
    receitaMesAnterior,
    metaMes,
    mrr: receitaMes,
    ticketMedio,
    inadimplenciaPct: Math.round(inadimplenciaPct * 10) / 10,
    previsaoProximoMes,
    debtors,
    recentPayments,
    planAnalysis,
    monthlyRevenue,
  };
}
