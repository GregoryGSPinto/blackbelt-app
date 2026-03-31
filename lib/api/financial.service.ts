import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';
import { logServiceError } from '@/lib/api/errors';
import {
  getOverdueMembers,
  getStudentInvoices,
  getFinancialSummary as getStudentFinancialSummary,
  markInvoiceAsPaid,
} from '@/lib/api/student-billing.service';

function mapPaymentStatus(status: string): Mensalidade['status'] {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
      return 'pago';
    case 'OVERDUE':
      return 'atrasado';
    default:
      return 'pendente';
  }
}

export async function listMensalidades(
  academyId: string,
  filters?: { month?: string; status?: string; search?: string },
): Promise<Mensalidade[]> {
  try {
    if (isMock()) {
      const { mockListMensalidades } = await import('@/lib/mocks/financial.mock');
      return mockListMensalidades(academyId, filters);
    }

    const invoices = await getStudentInvoices(academyId, {
      reference_month: filters?.month,
      search: filters?.search,
    });

    let result = invoices.map((invoice) => ({
      id: invoice.id,
      student_id: invoice.profile_id,
      student_name: invoice.display_name,
      academy_id: academyId,
      amount: invoice.amount,
      due_date: invoice.due_date,
      status: mapPaymentStatus(invoice.status),
      paid_at: invoice.paid_at,
      payment_method: invoice.payment_method as Mensalidade['payment_method'],
      payment_notes: invoice.payment_notes,
      manual_payment: invoice.manual_payment,
      reference_month: invoice.reference_month ?? '',
    }));

    if (filters?.status) {
      result = result.filter((row) => row.status === filters.status);
    }

    return result;
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function markAsPaid(
  invoiceId: string,
  method: 'PIX' | 'boleto' | 'cartao',
): Promise<Mensalidade> {
  await markInvoiceAsPaid(invoiceId, method);
  trackFeatureUsage('financial', 'create', { method });
  const refreshed = await findMensalidadeById(invoiceId);
  return refreshed;
}

export async function markAsManuallyPaid(
  invoiceId: string,
  paymentMethod: string,
  notes: string,
): Promise<Mensalidade> {
  await markInvoiceAsPaid(invoiceId, paymentMethod, notes);
  trackFeatureUsage('financial', 'create', { method: paymentMethod, manual: true });
  const refreshed = await findMensalidadeById(invoiceId);
  return refreshed;
}

async function findMensalidadeById(invoiceId: string): Promise<Mensalidade> {
  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('student_payments')
    .select('id, academy_id, student_profile_id, amount_cents, due_date, status, payment_method, payment_notes, paid_at, reference_month')
    .eq('id', invoiceId)
    .single();

  return {
    id: data.id,
    student_id: data.student_profile_id,
    student_name: 'Aluno',
    academy_id: data.academy_id,
    amount: data.amount_cents,
    due_date: data.due_date,
    status: mapPaymentStatus(data.status),
    paid_at: data.paid_at,
    payment_method: data.payment_method,
    payment_notes: data.payment_notes,
    manual_payment: data.status === 'RECEIVED',
    reference_month: data.reference_month ?? '',
  };
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) {
      const { mockGetFinancialSummary } = await import('@/lib/mocks/financial.mock');
      return mockGetFinancialSummary(academyId);
    }

    const summary = await getStudentFinancialSummary(academyId);
    const paidCount = (await getStudentInvoices(academyId, { reference_month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` }))
      .filter((invoice) => invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED').length;

    return {
      revenue_this_month: summary.total_received,
      revenue_last_month: 0,
      pending_amount: summary.total_pending,
      overdue_amount: summary.total_overdue,
      overdue_count: summary.overdue_count,
      paid_count: paidCount,
      total_count: summary.by_type.reduce((sum, item) => sum + item.count, 0),
      ticket_medio: paidCount > 0 ? Math.round(summary.total_received / paidCount) : 0,
    };
  } catch (error) {
    logServiceError(error, 'financial');
    return { revenue_this_month: 0, revenue_last_month: 0, pending_amount: 0, overdue_amount: 0, overdue_count: 0, paid_count: 0, total_count: 0, ticket_medio: 0 };
  }
}

export async function getRevenueChart(academyId: string): Promise<FinancialChartPoint[]> {
  try {
    if (isMock()) {
      const { mockGetRevenueChart } = await import('@/lib/mocks/financial.mock');
      return mockGetRevenueChart(academyId);
    }

    const points: FinancialChartPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const reference = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const invoices = await getStudentInvoices(academyId, { reference_month: reference });
      points.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receita: invoices
          .filter((invoice) => invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED')
          .reduce((sum, invoice) => sum + invoice.amount, 0),
        pendente: invoices
          .filter((invoice) => invoice.status === 'PENDING' || invoice.status === 'OVERDUE')
          .reduce((sum, invoice) => sum + invoice.amount, 0),
      });
    }
    return points;
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function getOverdueList(academyId: string): Promise<OverdueItem[]> {
  try {
    if (isMock()) {
      const { mockGetOverdueList } = await import('@/lib/mocks/financial.mock');
      return mockGetOverdueList(academyId);
    }

    const members = await getOverdueMembers(academyId);
    return members.map((member) => ({
      student_id: member.membership_id,
      student_name: member.name,
      amount: member.amount,
      due_date: '',
      days_overdue: member.days_overdue,
      reference_month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    }));
  } catch (error) {
    logServiceError(error, 'financial');
    return [];
  }
}

export async function generateMonthlyBills(_academyId: string, _month: string): Promise<{ generated: number }> {
  return { generated: 0 };
}
