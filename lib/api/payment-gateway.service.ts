import type {
  CreateCustomerData,
  ExternalCustomer,
  ExternalSubscription,
  ExternalInvoice,
  PaymentLink,
  WebhookEvent,
  PaymentMethod,
} from '@/lib/types/payment';

// ── Strategy Pattern: Gateway Interface ──────────────────────

export interface PaymentGateway {
  readonly name: string;
  createCustomer(data: CreateCustomerData): Promise<ExternalCustomer>;
  createSubscription(customerId: string, planId: string): Promise<ExternalSubscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  generateInvoice(subscriptionId: string, amount: number): Promise<ExternalInvoice>;
  getPaymentLink(invoiceId: string, method: PaymentMethod): Promise<PaymentLink>;
  processWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

// ── Gateway Factory ──────────────────────────────────────────

export type GatewayType = 'asaas' | 'stripe' | 'mock';

function getGatewayType(): GatewayType {
  const env = process.env.PAYMENT_GATEWAY ?? process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;
  if (env === 'asaas' || env === 'stripe') return env;
  return 'mock';
}

let cachedGateway: PaymentGateway | null = null;
let cachedType: GatewayType | null = null;

export async function getPaymentGateway(): Promise<PaymentGateway> {
  const type = getGatewayType();
  if (cachedGateway && cachedType === type) return cachedGateway;

  switch (type) {
    case 'asaas': {
      const { AsaasGateway } = await import('@/lib/api/gateways/asaas.gateway');
      cachedGateway = new AsaasGateway();
      break;
    }
    case 'stripe': {
      const { StripeGateway } = await import('@/lib/api/gateways/stripe.gateway');
      cachedGateway = new StripeGateway();
      break;
    }
    default: {
      const { MockGateway } = await import('@/lib/api/gateways/mock.gateway');
      cachedGateway = new MockGateway();
      break;
    }
  }

  cachedType = type;
  return cachedGateway;
}
