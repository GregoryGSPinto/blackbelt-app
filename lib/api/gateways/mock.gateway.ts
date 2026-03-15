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

const delay = () => new Promise((r) => setTimeout(r, 200));

export class MockGateway implements PaymentGateway {
  readonly name = 'mock';

  async createCustomer(_data: CreateCustomerData): Promise<ExternalCustomer> {
    await delay();
    return {
      externalId: `mock_cus_${Date.now()}`,
      gateway: this.name,
    };
  }

  async createSubscription(_customerId: string, _planId: string): Promise<ExternalSubscription> {
    await delay();
    return {
      externalId: `mock_sub_${Date.now()}`,
      gateway: this.name,
      status: 'active',
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    await delay();
  }

  async generateInvoice(_subscriptionId: string, amount: number): Promise<ExternalInvoice> {
    await delay();
    const id = `mock_inv_${Date.now()}`;
    return {
      externalId: id,
      gateway: this.name,
      paymentUrl: `https://mock-gateway.local/pay/${id}?amount=${amount}`,
    };
  }

  async getPaymentLink(invoiceId: string, method: PaymentMethod): Promise<PaymentLink> {
    await delay();
    const base: PaymentLink = {
      url: `https://mock-gateway.local/pay/${invoiceId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    if (method === 'pix') {
      base.qrCode = '00020126580014br.gov.bcb.pix0136mock-pix-key-placeholder5204000053039865802BR';
    } else if (method === 'boleto') {
      base.barCode = '23793.38128 60000.000003 00000.000409 1 84340000012500';
    }

    return base;
  }

  async processWebhook(payload: string, _signature: string): Promise<WebhookEvent> {
    const parsed = JSON.parse(payload) as { event?: string; id?: string };
    return {
      id: `mock_evt_${Date.now()}`,
      type: (parsed.event as WebhookEvent['type']) ?? 'payment.confirmed',
      gateway: this.name,
      externalId: parsed.id ?? 'unknown',
      data: parsed as Record<string, unknown>,
      receivedAt: new Date().toISOString(),
    };
  }
}
