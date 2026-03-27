import axios from 'axios';

const ASAAS_BASE = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const asaas = axios.create({
  baseURL: ASAAS_BASE,
  headers: {
    'access_token': process.env.ASAAS_API_KEY!,
    'Content-Type': 'application/json',
  },
});

// === CLIENTES ===

export async function createCustomer(data: {
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  externalReference?: string; // person_id do BlackBelt
}): Promise<{ id: string; externalReference: string }> {
  const response = await asaas.post('/customers', {
    name: data.name,
    email: data.email,
    cpfCnpj: data.cpfCnpj?.replace(/\D/g, ''),
    mobilePhone: data.phone?.replace(/\D/g, ''),
    externalReference: data.externalReference,
    notificationDisabled: false,
  });
  return response.data;
}

export async function findCustomerByExternalRef(ref: string): Promise<{ id: string } | null> {
  const response = await asaas.get(`/customers?externalReference=${ref}`);
  return response.data.data?.[0] || null;
}

// === COBRANÇAS ===

export async function createPayment(data: {
  customerId: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference?: string; // invoice_id do BlackBelt
}): Promise<{
  id: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixQrCode?: { payload: string; encodedImage: string };
  status: string;
}> {
  const response = await asaas.post('/payments', {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    dueDate: data.dueDate,
    description: data.description,
    externalReference: data.externalReference,
  });

  const payment = response.data;

  // Se PIX, buscar QR code
  if (data.billingType === 'PIX' && payment.id) {
    try {
      const pixResponse = await asaas.get(`/payments/${payment.id}/pixQrCode`);
      payment.pixQrCode = pixResponse.data;
    } catch {
      // PIX pode nao estar disponivel imediatamente
    }
  }

  return payment;
}

export async function getPayment(paymentId: string): Promise<{
  id: string;
  status: string;
  value: number;
  netValue: number;
  billingType: string;
  confirmedDate?: string;
}> {
  const response = await asaas.get(`/payments/${paymentId}`);
  return response.data;
}

// === ASSINATURAS ===

export async function createSubscription(data: {
  customerId: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  nextDueDate: string;
  description: string;
  externalReference?: string;
}): Promise<{ id: string; status: string }> {
  const response = await asaas.post('/subscriptions', {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    cycle: data.cycle,
    nextDueDate: data.nextDueDate,
    description: data.description,
    externalReference: data.externalReference,
  });
  return response.data;
}

// === STATUS MAPPING ===

export function mapAsaasStatus(asaasStatus: string): string {
  const map: Record<string, string> = {
    PENDING: 'pending',
    RECEIVED: 'paid',
    CONFIRMED: 'paid',
    OVERDUE: 'overdue',
    REFUNDED: 'refunded',
    RECEIVED_IN_CASH: 'paid',
    REFUND_REQUESTED: 'refunding',
    CHARGEBACK_REQUESTED: 'chargeback',
    CHARGEBACK_DISPUTE: 'chargeback',
    AWAITING_CHARGEBACK_REVERSAL: 'chargeback',
    DUNNING_REQUESTED: 'overdue',
    DUNNING_RECEIVED: 'paid',
    AWAITING_RISK_ANALYSIS: 'pending',
  };
  return map[asaasStatus] || 'unknown';
}
