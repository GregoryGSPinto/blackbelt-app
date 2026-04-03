import { isMock } from '@/lib/env';
import { handleServiceError, logServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
export type BillingCycle = 'monthly' | 'annual';

export interface PaymentSession {
  id: string;
  url: string;
  status: PaymentStatus;
  planId: string;
  billingCycle: BillingCycle;
  amount: number;
  created_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string;
  created_at: string;
}

export interface PortalSession {
  url: string;
}

// ── Gateway ─────────────────────────────────────────────────────

export async function createCheckoutSession(
  planId: string,
  billingCycle: BillingCycle,
): Promise<PaymentSession> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 800));
      const prices: Record<string, Record<BillingCycle, number>> = {
        starter: { monthly: 7900, annual: 63 * 12 * 100 },
        essencial: { monthly: 14900, annual: 119 * 12 * 100 },
        pro: { monthly: 24900, annual: 199 * 12 * 100 },
        'black-belt': { monthly: 39700, annual: 317 * 12 * 100 },
      };
      const amount = prices[planId]?.[billingCycle] ?? 24900;
      return {
        id: `cs_mock_${Date.now()}`,
        url: '#checkout-mock',
        status: 'pending',
        planId,
        billingCycle,
        amount,
        created_at: new Date().toISOString(),
      };
    }

    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'payment.createCheckout');
  }
}

export async function getPaymentStatus(sessionId: string): Promise<PaymentSession> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: sessionId,
        url: '#',
        status: 'succeeded',
        planId: 'pro',
        billingCycle: 'monthly',
        amount: 24900,
        created_at: new Date().toISOString(),
      };
    }
    const res = await fetch(`/api/payments/status/${sessionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    logServiceError(error, 'payment.getStatus');
    return null as unknown as PaymentSession;
  }
}

export async function createPortalSession(): Promise<PortalSession> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 500));
      return { url: '#portal-mock' };
    }
    const res = await fetch('/api/payments/portal', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'payment.createPortal');
  }
}
