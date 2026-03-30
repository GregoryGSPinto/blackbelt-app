import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type BillingType = 'particular' | 'gympass' | 'totalpass' | 'smartfit' | 'cortesia' | 'funcionario' | 'bolsista' | 'avulso';
export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'boleto' | 'dinheiro' | 'transferencia' | 'asaas';
export type Recurrence = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'avulso';
export type BillingStatus = 'em_dia' | 'pendente' | 'atrasado' | 'cortesia' | 'gympass' | 'cancelado';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  particular: 'Particular',
  gympass: 'GymPass',
  totalpass: 'TotalPass',
  smartfit: 'Smart Fit',
  cortesia: 'Cortesia',
  funcionario: 'Funcionário',
  bolsista: 'Bolsista',
  avulso: 'Avulso',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credito: 'Cartão de Crédito',
  debito: 'Cartão de Débito',
  boleto: 'Boleto',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  asaas: 'Cobrança Automática (Asaas)',
};

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  avulso: 'Por aula',
};

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  em_dia: 'Em dia',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
  cortesia: 'Cortesia',
  gympass: 'GymPass/TotalPass',
  cancelado: 'Cancelado',
};

export const BILLING_STATUS_COLORS: Record<BillingStatus, { bg: string; text: string }> = {
  em_dia: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  pendente: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  atrasado: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  cortesia: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  gympass: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  cancelado: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
};

export interface MemberBilling {
  id: string; // membership id
  profile_id: string;
  display_name: string;
  billing_type: BillingType;
  payment_method: PaymentMethod | null;
  recurrence: Recurrence;
  monthly_amount: number; // centavos
  discount_percent: number;
  discount_reason: string | null;
  billing_day: number;
  billing_status: BillingStatus;
  contract_start: string | null;
  contract_end: string | null;
  billing_notes: string | null;
  asaas_subscription_id: string | null;
  asaas_customer_id: string | null;
}

export interface MemberBillingUpdate {
  billing_type?: BillingType;
  payment_method?: PaymentMethod | null;
  recurrence?: Recurrence;
  monthly_amount?: number;
  discount_percent?: number;
  discount_reason?: string | null;
  billing_day?: number;
  billing_status?: BillingStatus;
  contract_start?: string | null;
  contract_end?: string | null;
  billing_notes?: string | null;
}

export interface StudentInvoice {
  id: string;
  membership_id: string | null;
  profile_id: string;
  display_name: string;
  amount: number; // centavos
  discount: number;
  net_amount: number;
  status: InvoiceStatus;
  billing_type: string | null;
  payment_method: string | null;
  reference_month: string | null;
  due_date: string;
  paid_at: string | null;
  paid_amount: number | null;
  manual_payment: boolean;
  payment_notes: string | null;
}

export interface FinancialSummary {
  total_expected: number; // centavos
  total_received: number;
  total_pending: number;
  total_overdue: number;
  overdue_count: number;
  by_type: { type: BillingType; count: number; revenue: number }[];
}

// ────────────────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────────────────

function mockMemberBilling(): MemberBilling {
  return {
    id: 'mock-membership',
    profile_id: 'mock-profile',
    display_name: 'Aluno Teste',
    billing_type: 'particular',
    payment_method: 'pix',
    recurrence: 'mensal',
    monthly_amount: 14900,
    discount_percent: 0,
    discount_reason: null,
    billing_day: 10,
    billing_status: 'em_dia',
    contract_start: '2026-01-01',
    contract_end: null,
    billing_notes: null,
    asaas_subscription_id: null,
    asaas_customer_id: null,
  };
}

function mockInvoices(): StudentInvoice[] {
  return [
    { id: 'inv-1', membership_id: 'mock-1', profile_id: 'p-1', display_name: 'João Mendes', amount: 14900, discount: 0, net_amount: 14900, status: 'paid', billing_type: 'particular', payment_method: 'pix', reference_month: '2026-03', due_date: '2026-03-10', paid_at: '2026-03-09', paid_amount: 14900, manual_payment: false, payment_notes: null },
    { id: 'inv-2', membership_id: 'mock-2', profile_id: 'p-2', display_name: 'Ana Costa', amount: 14900, discount: 0, net_amount: 14900, status: 'overdue', billing_type: 'particular', payment_method: 'credito', reference_month: '2026-03', due_date: '2026-03-10', paid_at: null, paid_amount: null, manual_payment: false, payment_notes: null },
    { id: 'inv-3', membership_id: 'mock-3', profile_id: 'p-3', display_name: 'Pedro Santos', amount: 14900, discount: 7450, net_amount: 7450, status: 'pending', billing_type: 'bolsista', payment_method: 'pix', reference_month: '2026-03', due_date: '2026-03-10', paid_at: null, paid_amount: null, manual_payment: false, payment_notes: null },
  ];
}

function mockSummary(): FinancialSummary {
  return {
    total_expected: 894000, total_received: 745000, total_pending: 149000, total_overdue: 0, overdue_count: 3,
    by_type: [
      { type: 'particular', count: 30, revenue: 447000 },
      { type: 'gympass', count: 15, revenue: 120000 },
      { type: 'totalpass', count: 8, revenue: 64000 },
      { type: 'cortesia', count: 5, revenue: 0 },
      { type: 'bolsista', count: 2, revenue: 14900 },
    ],
  };
}

// ────────────────────────────────────────────────────────────
// Membership Billing
// ────────────────────────────────────────────────────────────

export async function getMemberBilling(membershipId: string): Promise<MemberBilling | null> {
  try {
    if (isMock()) return mockMemberBilling();

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('memberships')
      .select('id, profile_id, billing_type, payment_method, recurrence, monthly_amount, discount_percent, discount_reason, billing_day, billing_status, contract_start, contract_end, billing_notes, asaas_subscription_id, asaas_customer_id, profiles!memberships_profile_id_fkey(display_name)')
      .eq('id', membershipId)
      .single();

    if (error || !data) {
      logServiceError(error, 'student-billing');
      return null;
    }

    const profiles = data.profiles as Record<string, unknown> | null;
    return {
      id: data.id,
      profile_id: data.profile_id,
      display_name: (profiles?.display_name ?? '') as string,
      billing_type: (data.billing_type ?? 'particular') as BillingType,
      payment_method: data.payment_method as PaymentMethod | null,
      recurrence: (data.recurrence ?? 'mensal') as Recurrence,
      monthly_amount: data.monthly_amount ?? 0,
      discount_percent: Number(data.discount_percent ?? 0),
      discount_reason: data.discount_reason,
      billing_day: data.billing_day ?? 10,
      billing_status: (data.billing_status ?? 'em_dia') as BillingStatus,
      contract_start: data.contract_start,
      contract_end: data.contract_end,
      billing_notes: data.billing_notes,
      asaas_subscription_id: data.asaas_subscription_id,
      asaas_customer_id: data.asaas_customer_id,
    };
  } catch (error) {
    logServiceError(error, 'student-billing');
    return null;
  }
}

export async function updateMemberBilling(membershipId: string, data: MemberBillingUpdate): Promise<void> {
  try {
    if (isMock()) return;

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('memberships')
      .update(data)
      .eq('id', membershipId);

    if (error) {
      logServiceError(error, 'student-billing');
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao atualizar dados financeiros.');
  }
}

export async function getMembersByBillingStatus(academyId: string, status?: BillingStatus): Promise<MemberBilling[]> {
  try {
    if (isMock()) return [mockMemberBilling()];

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('memberships')
      .select('id, profile_id, billing_type, payment_method, recurrence, monthly_amount, discount_percent, discount_reason, billing_day, billing_status, contract_start, contract_end, billing_notes, asaas_subscription_id, asaas_customer_id, profiles!memberships_profile_id_fkey(display_name)')
      .eq('academy_id', academyId)
      .eq('status', 'active');

    if (status) query = query.eq('billing_status', status);

    const { data, error } = await query;
    if (error || !data) {
      logServiceError(error, 'student-billing');
      return [];
    }

    return (data as Array<Record<string, unknown>>).map((d) => {
      const profiles = d.profiles as Record<string, unknown> | null;
      return {
        id: d.id as string,
        profile_id: d.profile_id as string,
        display_name: (profiles?.display_name ?? '') as string,
        billing_type: (d.billing_type ?? 'particular') as BillingType,
        payment_method: d.payment_method as PaymentMethod | null,
        recurrence: (d.recurrence ?? 'mensal') as Recurrence,
        monthly_amount: (d.monthly_amount ?? 0) as number,
        discount_percent: Number(d.discount_percent ?? 0),
        discount_reason: d.discount_reason as string | null,
        billing_day: (d.billing_day ?? 10) as number,
        billing_status: (d.billing_status ?? 'em_dia') as BillingStatus,
        contract_start: d.contract_start as string | null,
        contract_end: d.contract_end as string | null,
        billing_notes: d.billing_notes as string | null,
        asaas_subscription_id: d.asaas_subscription_id as string | null,
        asaas_customer_id: d.asaas_customer_id as string | null,
      };
    });
  } catch (error) {
    logServiceError(error, 'student-billing');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// Invoices
// ────────────────────────────────────────────────────────────

export interface InvoiceFilters {
  status?: InvoiceStatus;
  billing_type?: BillingType;
  reference_month?: string;
  search?: string;
}

export async function getStudentInvoices(academyId: string, filters?: InvoiceFilters): Promise<StudentInvoice[]> {
  try {
    if (isMock()) return mockInvoices();

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('invoices')
      .select('id, membership_id, profile_id, amount, discount, net_amount, status, billing_type, payment_method, reference_month, due_date, paid_at, paid_amount, manual_payment, payment_notes, profiles!invoices_profile_id_fkey(display_name)')
      .eq('academy_id', academyId)
      .order('due_date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.billing_type) query = query.eq('billing_type', filters.billing_type);
    if (filters?.reference_month) query = query.eq('reference_month', filters.reference_month);

    const { data, error } = await query;
    if (error || !data) {
      logServiceError(error, 'student-billing');
      return [];
    }

    let results = (data as Array<Record<string, unknown>>).map((d) => {
      const profiles = d.profiles as Record<string, unknown> | null;
      return {
        id: d.id as string,
        membership_id: d.membership_id as string | null,
        profile_id: d.profile_id as string,
        display_name: (profiles?.display_name ?? '') as string,
        amount: (d.amount ?? 0) as number,
        discount: (d.discount ?? 0) as number,
        net_amount: (d.net_amount ?? d.amount ?? 0) as number,
        status: (d.status ?? 'pending') as InvoiceStatus,
        billing_type: d.billing_type as string | null,
        payment_method: d.payment_method as string | null,
        reference_month: d.reference_month as string | null,
        due_date: d.due_date as string,
        paid_at: d.paid_at as string | null,
        paid_amount: d.paid_amount as number | null,
        manual_payment: (d.manual_payment ?? false) as boolean,
        payment_notes: d.payment_notes as string | null,
      };
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter((r) => r.display_name.toLowerCase().includes(term));
    }

    return results;
  } catch (error) {
    logServiceError(error, 'student-billing');
    return [];
  }
}

export async function createInvoice(data: {
  academy_id: string;
  membership_id: string;
  profile_id: string;
  amount: number;
  discount: number;
  net_amount: number;
  billing_type: string;
  payment_method: string | null;
  reference_month: string;
  due_date: string;
}): Promise<StudentInvoice | null> {
  try {
    if (isMock()) return mockInvoices()[0];

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: result, error } = await supabase
      .from('invoices')
      .insert({ ...data, status: 'pending' })
      .select()
      .single();

    if (error) {
      logServiceError(error, 'student-billing');
      throw new Error(error.message);
    }

    return { ...result, display_name: '' } as unknown as StudentInvoice;
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao criar fatura.');
  }
}

export async function generateMonthlyInvoices(academyId: string): Promise<number> {
  try {
    if (isMock()) return 5;

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date();
    const refMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all active memberships that need invoicing
    const { data: members } = await supabase
      .from('memberships')
      .select('id, profile_id, billing_type, payment_method, monthly_amount, discount_percent, billing_day')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .in('billing_type', ['particular', 'bolsista', 'avulso']);

    if (!members || members.length === 0) return 0;

    // Check which already have invoices for this month
    const { data: existing } = await supabase
      .from('invoices')
      .select('membership_id')
      .eq('academy_id', academyId)
      .eq('reference_month', refMonth);

    const existingSet = new Set((existing ?? []).map((e: Record<string, unknown>) => e.membership_id as string));

    const toCreate = members.filter((m: Record<string, unknown>) => !existingSet.has(m.id as string));
    if (toCreate.length === 0) return 0;

    const invoices = toCreate.map((m: Record<string, unknown>) => {
      const amount = (m.monthly_amount ?? 0) as number;
      const discountPct = Number(m.discount_percent ?? 0);
      const discount = Math.round(amount * discountPct / 100);
      const billingDay = (m.billing_day ?? 10) as number;
      const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`;

      return {
        academy_id: academyId,
        membership_id: m.id as string,
        profile_id: m.profile_id as string,
        amount,
        discount,
        net_amount: amount - discount,
        billing_type: m.billing_type as string,
        payment_method: m.payment_method as string | null,
        reference_month: refMonth,
        due_date: dueDate,
        status: 'pending',
      };
    });

    const { error } = await supabase.from('invoices').insert(invoices);
    if (error) {
      logServiceError(error, 'student-billing');
      throw new Error(error.message);
    }

    return invoices.length;
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao gerar faturas.');
  }
}

export async function markInvoiceAsPaid(invoiceId: string, method?: string, notes?: string): Promise<void> {
  try {
    if (isMock()) return;

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const update: Record<string, unknown> = {
      status: 'paid',
      paid_at: new Date().toISOString(),
      manual_payment: true,
    };
    if (method) update.payment_method = method;
    if (notes) update.payment_notes = notes;

    const { error } = await supabase.from('invoices').update(update).eq('id', invoiceId);
    if (error) {
      logServiceError(error, 'student-billing');
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao dar baixa na fatura.');
  }
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  try {
    if (isMock()) return;

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', invoiceId);
    if (error) {
      logServiceError(error, 'student-billing');
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao cancelar fatura.');
  }
}

// ────────────────────────────────────────────────────────────
// Financial Summary
// ────────────────────────────────────────────────────────────

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) return mockSummary();

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date();
    const refMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Current month invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, discount, net_amount, status, billing_type')
      .eq('academy_id', academyId)
      .eq('reference_month', refMonth);

    const inv = invoices ?? [];
    const totalExpected = inv.reduce((s: number, i: Record<string, unknown>) => s + ((i.net_amount ?? i.amount ?? 0) as number), 0);
    const totalReceived = inv.filter((i: Record<string, unknown>) => i.status === 'paid').reduce((s: number, i: Record<string, unknown>) => s + ((i.net_amount ?? i.amount ?? 0) as number), 0);
    const totalPending = inv.filter((i: Record<string, unknown>) => i.status === 'pending').reduce((s: number, i: Record<string, unknown>) => s + ((i.net_amount ?? i.amount ?? 0) as number), 0);
    const totalOverdue = inv.filter((i: Record<string, unknown>) => i.status === 'overdue').reduce((s: number, i: Record<string, unknown>) => s + ((i.net_amount ?? i.amount ?? 0) as number), 0);
    const overdueCount = inv.filter((i: Record<string, unknown>) => i.status === 'overdue').length;

    // By billing type (from memberships)
    const { data: members } = await supabase
      .from('memberships')
      .select('billing_type, monthly_amount')
      .eq('academy_id', academyId)
      .eq('status', 'active');

    const typeMap = new Map<string, { count: number; revenue: number }>();
    for (const m of (members ?? []) as Array<Record<string, unknown>>) {
      const bt = (m.billing_type ?? 'particular') as string;
      const existing = typeMap.get(bt) ?? { count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += (m.monthly_amount ?? 0) as number;
      typeMap.set(bt, existing);
    }

    return {
      total_expected: totalExpected,
      total_received: totalReceived,
      total_pending: totalPending,
      total_overdue: totalOverdue,
      overdue_count: overdueCount,
      by_type: [...typeMap.entries()].map(([type, data]) => ({ type: type as BillingType, ...data })),
    };
  } catch (error) {
    logServiceError(error, 'student-billing');
    return { total_expected: 0, total_received: 0, total_pending: 0, total_overdue: 0, overdue_count: 0, by_type: [] };
  }
}

export async function getOverdueMembers(academyId: string): Promise<Array<{ name: string; amount: number; days_overdue: number; membership_id: string }>> {
  try {
    if (isMock()) {
      return [
        { name: 'Ana Costa', amount: 14900, days_overdue: 15, membership_id: 'mock-1' },
        { name: 'Carlos Alves', amount: 14900, days_overdue: 8, membership_id: 'mock-2' },
        { name: 'Pedro Santos', amount: 7450, days_overdue: 1, membership_id: 'mock-3' },
      ];
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('id, membership_id, net_amount, due_date, profiles!invoices_profile_id_fkey(display_name)')
      .eq('academy_id', academyId)
      .eq('status', 'overdue')
      .order('due_date', { ascending: true });

    if (error || !data) {
      logServiceError(error, 'student-billing');
      return [];
    }

    const now = Date.now();
    return (data as Array<Record<string, unknown>>).map((d) => {
      const profiles = d.profiles as Record<string, unknown> | null;
      const dueDate = new Date(d.due_date as string).getTime();
      return {
        name: (profiles?.display_name ?? '') as string,
        amount: (d.net_amount ?? 0) as number,
        days_overdue: Math.max(0, Math.floor((now - dueDate) / 86400000)),
        membership_id: (d.membership_id ?? '') as string,
      };
    });
  } catch (error) {
    logServiceError(error, 'student-billing');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

export function formatCentsToBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function billingTypeNeedsBilling(type: BillingType): boolean {
  return type === 'particular' || type === 'bolsista' || type === 'avulso';
}
