import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface ChildBill {
  id: string;
  childName: string;
  childId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  plan: string;
  referenceMonth: string;
}

export interface PaymentMethod {
  type: 'pix' | 'boleto' | 'card';
  label: string;
}

export interface PaymentReceipt {
  id: string;
  billId: string;
  amount: number;
  method: string;
  paidAt: string;
  receiptUrl: string;
}

// ── Service ───────────────────────────────────────────────────

export async function getChildrenBills(parentId: string): Promise<ChildBill[]> {
  try {
    if (isMock()) {
      return [
        { id: 'bill-1', childName: 'Pedro Santos', childId: 'child-1', amount: 197, dueDate: '2026-03-20', status: 'pending', plan: 'Essencial', referenceMonth: '2026-03' },
        { id: 'bill-2', childName: 'Ana Santos', childId: 'child-2', amount: 147, dueDate: '2026-03-20', status: 'pending', plan: 'Starter', referenceMonth: '2026-03' },
        { id: 'bill-3', childName: 'Pedro Santos', childId: 'child-1', amount: 197, dueDate: '2026-02-20', status: 'paid', plan: 'Essencial', referenceMonth: '2026-02' },
      ];
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('bills')
      .select('id, amount, due_date, status, plan, reference_month, students!inner(id, display_name, guardian_students!inner(guardian_id))')
      .eq('students.guardian_students.guardian_id', parentId)
      .order('due_date', { ascending: false });

    if (error) {
      console.warn('[getChildrenBills] error:', error.message);
      return [];
    }

    return (data ?? []).map((b: Record<string, unknown>) => {
      const student = b.students as Record<string, unknown> | null;
      return {
        id: b.id as string,
        childName: (student?.display_name as string) ?? '',
        childId: (student?.id as string) ?? '',
        amount: b.amount as number,
        dueDate: b.due_date as string,
        status: b.status as 'pending' | 'paid' | 'overdue',
        plan: (b.plan as string) ?? '',
        referenceMonth: (b.reference_month as string) ?? '',
      };
    });
  } catch (error) {
    console.warn('[getChildrenBills] Fallback:', error);
    return [];
  }
}

export async function initiatePayment(
  billId: string,
  method: 'pix' | 'boleto' | 'card',
): Promise<{ paymentUrl: string; pixCode?: string; boletoCode?: string }> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Payment initiated for bill ${billId} via ${method}`);
      return {
        paymentUrl: '#mock-payment',
        pixCode: method === 'pix' ? '00020126580014br.gov.bcb.pix0136mock-key5204000053039865802BR' : undefined,
        boletoCode: method === 'boleto' ? '23793.38128 60000.000003 00000.000405 1 87150000019700' : undefined,
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('payments')
      .insert({ bill_id: billId, method, status: 'initiated' })
      .select()
      .single();

    if (error) {
      console.warn('[initiatePayment] error:', error.message);
      return { paymentUrl: '' };
    }

    return {
      paymentUrl: (data as Record<string, unknown>).payment_url as string ?? '',
      pixCode: method === 'pix' ? ((data as Record<string, unknown>).pix_code as string) : undefined,
      boletoCode: method === 'boleto' ? ((data as Record<string, unknown>).boleto_code as string) : undefined,
    };
  } catch (error) {
    console.warn('[initiatePayment] Fallback:', error);
    return { paymentUrl: '' };
  }
}

export async function getPaymentHistory(parentId: string): Promise<PaymentReceipt[]> {
  try {
    if (isMock()) {
      return [
        { id: 'rcpt-1', billId: 'bill-3', amount: 197, method: 'pix', paidAt: '2026-02-18T14:30:00Z', receiptUrl: '/mock/receipt.pdf' },
        { id: 'rcpt-2', billId: 'bill-0', amount: 147, method: 'card', paidAt: '2026-01-19T10:00:00Z', receiptUrl: '/mock/receipt.pdf' },
      ];
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('payments')
      .select('id, bill_id, amount, method, paid_at, receipt_url, bills!inner(students!inner(guardian_students!inner(guardian_id)))')
      .eq('bills.students.guardian_students.guardian_id', parentId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false });

    if (error) {
      console.warn('[getPaymentHistory] error:', error.message);
      return [];
    }

    return (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      billId: p.bill_id as string,
      amount: p.amount as number,
      method: p.method as string,
      paidAt: p.paid_at as string,
      receiptUrl: (p.receipt_url as string) ?? '',
    }));
  } catch (error) {
    console.warn('[getPaymentHistory] Fallback:', error);
    return [];
  }
}
