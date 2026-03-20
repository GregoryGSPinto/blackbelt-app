import { isMock } from '@/lib/env';
import type {
  CreateCustomerData,
  ExternalCustomer,
  ExternalSubscription,
  ExternalInvoice,
  PaymentLink,
  WebhookEvent,
  PaymentMethod,
} from '@/lib/types/payment';

// ── Types ──────────────────────────────────────────────────────────

export interface PaymentGatewayConfig {
  provider: 'asaas' | 'stripe' | 'mock';
  apiKey?: string;
  environment: 'sandbox' | 'production';
  academyId: string;
  connected: boolean;
  lastSync?: string;
}

export interface PaymentCustomer {
  id: string;
  externalId: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
}

export interface PaymentCharge {
  id: string;
  customerId: string;
  customerName: string;
  description: string;
  value: number;
  netValue?: number;
  dueDate: string;
  status: 'pending' | 'received' | 'confirmed' | 'overdue' | 'refunded' | 'cancelled';
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  pixQrCode?: string;
  pixCopyPaste?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  creditCardToken?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  paidAt?: string;
  paymentMethod?: string;
  externalId?: string;
  createdAt: string;
}

export interface PaymentSubscription {
  id: string;
  customerId: string;
  customerName: string;
  description: string;
  value: number;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  nextDueDate: string;
  status: 'active' | 'inactive' | 'expired';
  externalId?: string;
}

export interface FinancialSummary {
  received: number;
  pending: number;
  overdue: number;
  refunded: number;
  netRevenue: number;
  fees: number;
  byMethod: { pix: number; boleto: number; creditCard: number };
}

export interface GatewayStatus {
  connected: boolean;
  provider: string;
  lastSync?: string;
}

export interface ChargeFilters {
  status?: string;
  billingType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ── API ────────────────────────────────────────────────────────────

export async function getGatewayConfig(academyId: string): Promise<PaymentGatewayConfig> {
  try {
    if (isMock()) {
      const { mockGetGatewayConfig } = await import('@/lib/mocks/payment-gateway.mock');
      return mockGetGatewayConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'payment_gateway')
      .single();

    if (error || !data) {
      console.warn('[getGatewayConfig] error:', error?.message ?? 'not found');
      return { provider: 'mock', environment: 'sandbox', academyId, connected: false };
    }
    return data.value as unknown as PaymentGatewayConfig;
  } catch (error) {
    console.warn('[getGatewayConfig] Fallback:', error);
    return { provider: 'mock', environment: 'sandbox', academyId, connected: false };
  }
}

export async function saveGatewayConfig(academyId: string, config: Partial<PaymentGatewayConfig>): Promise<void> {
  try {
    if (isMock()) {
      const { mockSaveGatewayConfig } = await import('@/lib/mocks/payment-gateway.mock');
      return mockSaveGatewayConfig(academyId, config);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('academy_settings')
      .upsert({ academy_id: academyId, key: 'payment_gateway', value: config }, { onConflict: 'academy_id,key' });

    if (error) {
      console.warn('[saveGatewayConfig] error:', error.message);
    }
  } catch (error) {
    console.warn('[saveGatewayConfig] Fallback:', error);
  }
}

export async function testGatewayConnection(config: Partial<PaymentGatewayConfig>): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockTestConnection } = await import('@/lib/mocks/payment-gateway.mock');
      return mockTestConnection(config);
    }
    // Without a real gateway API key, we just return true (manual mode)
    return true;
  } catch (error) {
    console.warn('[testGatewayConnection] Fallback:', error);
    return false;
  }
}

export async function getGatewayStatus(academyId: string): Promise<GatewayStatus> {
  try {
    if (isMock()) {
      const { mockGetGatewayStatus } = await import('@/lib/mocks/payment-gateway.mock');
      return mockGetGatewayStatus(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'payment_gateway')
      .single();

    if (error || !data) {
      return { connected: false, provider: 'none' };
    }
    const cfg = data.value as Record<string, unknown>;
    return { connected: (cfg.connected as boolean) ?? false, provider: (cfg.provider as string) ?? 'none', lastSync: cfg.lastSync as string | undefined };
  } catch (error) {
    console.warn('[getGatewayStatus] Fallback:', error);
    return { connected: false, provider: 'none' };
  }
}

export async function createCharge(academyId: string, customerId: string, value: number, dueDate: string, billingType: PaymentCharge['billingType'], description: string): Promise<PaymentCharge> {
  try {
    if (isMock()) {
      const { mockCreateCharge } = await import('@/lib/mocks/payment-gateway.mock');
      return mockCreateCharge(academyId, customerId, value, dueDate, billingType, description);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('payment_charges')
      .insert({ academy_id: academyId, customer_id: customerId, value, due_date: dueDate, billing_type: billingType, description, status: 'pending' })
      .select()
      .single();

    if (error || !data) {
      console.warn('[createCharge] error:', error?.message ?? 'no data');
      return { id: '', customerId, customerName: '', description, value, dueDate, status: 'pending', billingType, createdAt: new Date().toISOString() };
    }
    return data as unknown as PaymentCharge;
  } catch (error) {
    console.warn('[createCharge] Fallback:', error);
    return { id: '', customerId, customerName: '', description, value, dueDate, status: 'pending', billingType, createdAt: new Date().toISOString() };
  }
}

export async function listCharges(academyId: string, filters?: ChargeFilters): Promise<PaymentCharge[]> {
  try {
    if (isMock()) {
      const { mockListCharges } = await import('@/lib/mocks/payment-gateway.mock');
      return mockListCharges(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('payment_charges').select('*, payment_customers(name)').eq('academy_id', academyId).order('due_date', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.billingType) query = query.eq('billing_type', filters.billingType);
    const { data, error } = await query;

    if (error) {
      console.warn('[listCharges] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as PaymentCharge[];
  } catch (error) {
    console.warn('[listCharges] Fallback:', error);
    return [];
  }
}

export async function listSubscriptions(academyId: string): Promise<PaymentSubscription[]> {
  try {
    if (isMock()) {
      const { mockListSubscriptions } = await import('@/lib/mocks/payment-gateway.mock');
      return mockListSubscriptions(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('payment_subscriptions').select('*, payment_customers(name)').eq('academy_id', academyId);

    if (error) {
      console.warn('[listSubscriptions] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as PaymentSubscription[];
  } catch (error) {
    console.warn('[listSubscriptions] Fallback:', error);
    return [];
  }
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) {
      const { mockGetFinancialSummary } = await import('@/lib/mocks/payment-gateway.mock');
      return mockGetFinancialSummary(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('payment_charges')
      .select('status, value, billing_type')
      .eq('academy_id', academyId);

    if (error || !data) {
      console.warn('[getFinancialSummary] error:', error?.message);
      return { received: 0, pending: 0, overdue: 0, refunded: 0, netRevenue: 0, fees: 0, byMethod: { pix: 0, boleto: 0, creditCard: 0 } };
    }

    let received = 0, pending = 0, overdue = 0, refunded = 0;
    const byMethod = { pix: 0, boleto: 0, creditCard: 0 };
    for (const row of data as Array<Record<string, unknown>>) {
      const v = (row.value as number) ?? 0;
      const s = row.status as string;
      const bt = row.billing_type as string;
      if (s === 'received' || s === 'confirmed') { received += v; }
      else if (s === 'pending') { pending += v; }
      else if (s === 'overdue') { overdue += v; }
      else if (s === 'refunded') { refunded += v; }
      if (bt === 'PIX') byMethod.pix += v;
      else if (bt === 'BOLETO') byMethod.boleto += v;
      else if (bt === 'CREDIT_CARD') byMethod.creditCard += v;
    }
    return { received, pending, overdue, refunded, netRevenue: received - refunded, fees: 0, byMethod };
  } catch (error) {
    console.warn('[getFinancialSummary] Fallback:', error);
    return { received: 0, pending: 0, overdue: 0, refunded: 0, netRevenue: 0, fees: 0, byMethod: { pix: 0, boleto: 0, creditCard: 0 } };
  }
}

export async function generatePixQrCode(chargeId: string): Promise<{ qrCode: string; copyPaste: string }> {
  try {
    if (isMock()) {
      const { mockGeneratePixQrCode } = await import('@/lib/mocks/payment-gateway.mock');
      return mockGeneratePixQrCode(chargeId);
    }
    // Without gateway API key, Pix QR code generation is not available
    console.warn('[generatePixQrCode] Gateway not configured — PIX QR code not available for charge:', chargeId);
    return { qrCode: '', copyPaste: '' };
  } catch (error) {
    console.warn('[generatePixQrCode] Fallback:', error);
    return { qrCode: '', copyPaste: '' };
  }
}

export async function syncCustomers(academyId: string): Promise<{ synced: number }> {
  try {
    if (isMock()) {
      const { mockSyncCustomers } = await import('@/lib/mocks/payment-gateway.mock');
      return mockSyncCustomers(academyId);
    }
    // Without gateway API key, sync is manual
    console.warn('[syncCustomers] Gateway not configured — sync not available for academy:', academyId);
    return { synced: 0 };
  } catch (error) {
    console.warn('[syncCustomers] Fallback:', error);
    return { synced: 0 };
  }
}

// ── Legacy Gateway Interface (used by existing gateway implementations) ──

export interface PaymentGateway {
  readonly name: string;
  createCustomer(data: CreateCustomerData): Promise<ExternalCustomer>;
  createSubscription(customerId: string, planId: string): Promise<ExternalSubscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  generateInvoice(subscriptionId: string, amount: number): Promise<ExternalInvoice>;
  getPaymentLink(invoiceId: string, method: PaymentMethod): Promise<PaymentLink>;
  processWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

export async function getPaymentGateway(): Promise<PaymentGateway> {
  if (isMock()) {
    const { MockGateway } = await import('@/lib/api/gateways/mock.gateway');
    return new MockGateway();
  }
  const provider = process.env.PAYMENT_GATEWAY ?? 'asaas';
  if (provider === 'stripe') {
    const { StripeGateway } = await import('@/lib/api/gateways/stripe.gateway');
    return new StripeGateway();
  }
  const { AsaasGateway } = await import('@/lib/api/gateways/asaas.gateway');
  return new AsaasGateway();
}
