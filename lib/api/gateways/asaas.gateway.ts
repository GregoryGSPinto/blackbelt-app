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

const ASAAS_BASE = process.env.ASAAS_API_URL ?? 'https://sandbox.asaas.com/api/v3';
const ASAAS_KEY = process.env.ASAAS_API_KEY ?? '';

async function asaasFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_KEY,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ServiceError(res.status, 'asaas');
  return res.json() as Promise<T>;
}

export class AsaasGateway implements PaymentGateway {
  readonly name = 'asaas';

  async createCustomer(data: CreateCustomerData): Promise<ExternalCustomer> {
    const result = await asaasFetch<{ id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify({ name: data.name, email: data.email, cpfCnpj: data.cpf, phone: data.phone }),
    });
    return { externalId: result.id, gateway: this.name };
  }

  async createSubscription(customerId: string, planId: string): Promise<ExternalSubscription> {
    const result = await asaasFetch<{ id: string; status: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ customer: customerId, billingType: 'UNDEFINED', value: 0, externalReference: planId }),
    });
    return { externalId: result.id, gateway: this.name, status: result.status };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await asaasFetch(`/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  }

  async generateInvoice(subscriptionId: string, amount: number): Promise<ExternalInvoice> {
    const result = await asaasFetch<{ id: string; invoiceUrl?: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        subscription: subscriptionId,
        billingType: 'UNDEFINED',
        value: amount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    });
    return { externalId: result.id, gateway: this.name, paymentUrl: result.invoiceUrl };
  }

  async getPaymentLink(invoiceId: string, method: PaymentMethod): Promise<PaymentLink> {
    const billingMap: Record<PaymentMethod, string> = { pix: 'PIX', boleto: 'BOLETO', credit_card: 'CREDIT_CARD' };
    const result = await asaasFetch<{ invoiceUrl: string; expirationDate?: string; encodedImage?: string; payload?: string; barCode?: string }>(
      `/payments/${invoiceId}/billingInfo`,
    );
    void billingMap[method];
    return {
      url: result.invoiceUrl,
      expiresAt: result.expirationDate ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      qrCode: result.payload,
      barCode: result.barCode,
    };
  }

  async processWebhook(payload: string, _signature: string): Promise<WebhookEvent> {
    const body = JSON.parse(payload) as { event: string; payment?: { id: string }; id?: string };
    const typeMap: Record<string, WebhookEvent['type']> = {
      PAYMENT_CONFIRMED: 'payment.confirmed',
      PAYMENT_OVERDUE: 'payment.overdue',
      PAYMENT_REFUNDED: 'payment.refunded',
      SUBSCRIPTION_DELETED: 'subscription.cancelled',
      SUBSCRIPTION_RENEWED: 'subscription.renewed',
    };
    return {
      id: `asaas_evt_${Date.now()}`,
      type: typeMap[body.event] ?? 'payment.confirmed',
      gateway: this.name,
      externalId: body.payment?.id ?? body.id ?? 'unknown',
      data: body as unknown as Record<string, unknown>,
      receivedAt: new Date().toISOString(),
    };
  }
}
