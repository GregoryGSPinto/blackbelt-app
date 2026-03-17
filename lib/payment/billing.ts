import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export type PaymentMethod = 'pix' | 'boleto' | 'credit_card';

export interface BillGenerationResult {
  total: number;
  generated: number;
  skipped: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paidAt: string;
}

// ── Service ─────────────────────────────────────────────────────

export async function generateMonthlyBills(academyId: string): Promise<BillGenerationResult> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 1500));
      console.log(`[MOCK] Generated monthly bills for academy ${academyId}`);
      return { total: 172, generated: 168, skipped: 4 };
    }
    const res = await fetch('/api/billing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academy_id: academyId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'billing.generate');
  }
}

export async function processPayment(
  billId: string,
  method: PaymentMethod,
): Promise<PaymentResult> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 1000));
      console.log(`[MOCK] Payment processed: bill=${billId}, method=${method}`);
      return {
        success: true,
        transactionId: `txn_mock_${Date.now()}`,
        paidAt: new Date().toISOString(),
      };
    }
    const res = await fetch(`/api/billing/${billId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'billing.process');
  }
}

export async function simulatePayment(billId: string): Promise<PaymentResult> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 1000));
      console.log(`[MOCK] Payment simulated for bill ${billId}`);
      return {
        success: true,
        transactionId: `txn_sim_${Date.now()}`,
        paidAt: new Date().toISOString(),
      };
    }
    throw new Error('simulatePayment is only available in mock mode');
  } catch (error) {
    handleServiceError(error, 'billing.simulate');
  }
}
