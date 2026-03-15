import type { PaymentGateway } from '@/lib/api/payment-gateway.service';
import type {
  CreateCustomerData,
  ExternalCustomer,
  ExternalSubscription,
  ExternalInvoice,
  PaymentLink,
  WebhookEvent,
  PaymentMethod,
} from '@/lib/types/payment';
import { ServiceError } from '@/lib/api/errors';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_BASE = 'https://api.stripe.com/v1';

async function stripeFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ServiceError(res.status, 'stripe');
  return res.json() as Promise<T>;
}

function toFormData(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export class StripeGateway implements PaymentGateway {
  readonly name = 'stripe';

  async createCustomer(data: CreateCustomerData): Promise<ExternalCustomer> {
    const result = await stripeFetch<{ id: string }>('/customers', {
      method: 'POST',
      body: toFormData({ name: data.name, email: data.email, 'metadata[cpf]': data.cpf }),
    });
    return { externalId: result.id, gateway: this.name };
  }

  async createSubscription(customerId: string, planId: string): Promise<ExternalSubscription> {
    const result = await stripeFetch<{ id: string; status: string }>('/subscriptions', {
      method: 'POST',
      body: toFormData({ customer: customerId, 'items[0][price]': planId }),
    });
    return { externalId: result.id, gateway: this.name, status: result.status };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripeFetch(`/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  }

  async generateInvoice(_subscriptionId: string, amount: number): Promise<ExternalInvoice> {
    const result = await stripeFetch<{ id: string; hosted_invoice_url?: string }>('/invoices', {
      method: 'POST',
      body: toFormData({ auto_advance: 'true', 'metadata[amount]': String(amount) }),
    });
    return { externalId: result.id, gateway: this.name, paymentUrl: result.hosted_invoice_url };
  }

  async getPaymentLink(invoiceId: string, _method: PaymentMethod): Promise<PaymentLink> {
    const result = await stripeFetch<{ hosted_invoice_url: string; due_date?: number }>(`/invoices/${invoiceId}`);
    return {
      url: result.hosted_invoice_url,
      expiresAt: result.due_date
        ? new Date(result.due_date * 1000).toISOString()
        : new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async processWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    // Validate Stripe webhook signature if secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      // Stripe uses timestamp + payload for signature (simplified check)
      const parts = signature.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const sigPart = parts.find((p) => p.startsWith('v1='));
      if (timestampPart && sigPart) {
        const timestamp = timestampPart.replace('t=', '');
        const expectedSig = sigPart.replace('v1=', '');
        const signedPayload = `${timestamp}.${payload}`;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
        const computed = Array.from(new Uint8Array(sig))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        if (computed !== expectedSig) {
          throw new ServiceError(401, 'stripe', 'Invalid webhook signature');
        }
      }
    }

    const body = JSON.parse(payload) as { id: string; type: string; data?: { object?: { id: string } } };
    const typeMap: Record<string, WebhookEvent['type']> = {
      'invoice.paid': 'payment.confirmed',
      'invoice.payment_failed': 'payment.overdue',
      'charge.refunded': 'payment.refunded',
      'customer.subscription.deleted': 'subscription.cancelled',
      'invoice.created': 'subscription.renewed',
    };
    return {
      id: body.id,
      type: typeMap[body.type] ?? 'payment.confirmed',
      gateway: this.name,
      externalId: body.data?.object?.id ?? 'unknown',
      data: body as unknown as Record<string, unknown>,
      receivedAt: new Date().toISOString(),
    };
  }
}
