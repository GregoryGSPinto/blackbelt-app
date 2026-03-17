import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    try {
      const res = await fetch(`/api/parent/bills?parentId=${parentId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[parent-payment.getChildrenBills] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'parentPayment.getBills');
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
    const res = await fetch('/api/parent/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId, method }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'parentPayment.initiate');
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
    try {
      const res = await fetch(`/api/parent/history?parentId=${parentId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[parent-payment.getPaymentHistory] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'parentPayment.history');
  }
}
