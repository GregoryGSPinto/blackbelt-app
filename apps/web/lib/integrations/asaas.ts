// BlackBelt v2 — Asaas Payment Gateway Client
// Docs: https://docs.asaas.com
// Sandbox: https://sandbox.asaas.com/api/v3
// Production: https://api.asaas.com/api/v3

const ASAAS_BASE_URL =
  process.env.ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// ── Types ────────────────────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  dueDate: string;
  billingType: AsaasBillingType;
  status: AsaasPaymentStatus;
  description?: string;
  externalReference?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  pixTransaction?: {
    qrCode?: string;
    pixCopiaECola?: string;
  };
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  value: number;
  cycle: AsaasCycle;
  billingType: AsaasBillingType;
  nextDueDate: string;
  status: string;
  description?: string;
  externalReference?: string;
}

export type AsaasBillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
export type AsaasCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'REFUND_IN_PROGRESS'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

interface AsaasListResponse<T> {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: T[];
}

interface AsaasErrorResponse {
  errors?: Array<{ code: string; description: string }>;
}

// ── Internal helpers ─────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY is not configured. Set it in environment variables.');
  }
  return {
    'Content-Type': 'application/json',
    access_token: ASAAS_API_KEY,
  };
}

async function handleResponse<T>(response: Response, context: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const body = (await response.json()) as AsaasErrorResponse;
      if (body.errors?.[0]?.description) {
        errorMessage = body.errors[0].description;
      }
    } catch {
      // Could not parse error body
    }
    throw new Error(`[Asaas ${context}] ${response.status}: ${errorMessage}`);
  }
  return response.json() as Promise<T>;
}

// ── Customer ─────────────────────────────────────────────────────

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AsaasCustomer>(response, 'createCustomer');
}

export async function getCustomer(customerId: string): Promise<AsaasCustomer> {
  const response = await fetch(`${ASAAS_BASE_URL}/customers/${customerId}`, {
    headers: getHeaders(),
  });
  return handleResponse<AsaasCustomer>(response, 'getCustomer');
}

export async function findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const response = await fetch(
    `${ASAAS_BASE_URL}/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`,
    { headers: getHeaders() },
  );
  const result = await handleResponse<AsaasListResponse<AsaasCustomer>>(response, 'findCustomer');
  return result.data[0] ?? null;
}

// ── Payment ──────────────────────────────────────────────────────

export async function createPayment(data: {
  customer: string;
  value: number;
  dueDate: string;
  billingType: AsaasBillingType;
  description?: string;
  externalReference?: string;
}): Promise<AsaasPayment> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AsaasPayment>(response, 'createPayment');
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
    headers: getHeaders(),
  });
  return handleResponse<AsaasPayment>(response, 'getPayment');
}

export async function getPaymentPixQrCode(paymentId: string): Promise<{
  encodedImage: string;
  payload: string;
  expirationDate: string;
}> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
    headers: getHeaders(),
  });
  return handleResponse(response, 'getPaymentPixQrCode');
}

export async function listPayments(
  customerId: string,
  offset = 0,
  limit = 20,
): Promise<AsaasListResponse<AsaasPayment>> {
  const response = await fetch(
    `${ASAAS_BASE_URL}/payments?customer=${customerId}&offset=${offset}&limit=${limit}`,
    { headers: getHeaders() },
  );
  return handleResponse<AsaasListResponse<AsaasPayment>>(response, 'listPayments');
}

// ── Subscription ─────────────────────────────────────────────────

export async function createSubscription(data: {
  customer: string;
  value: number;
  cycle: AsaasCycle;
  billingType: AsaasBillingType;
  nextDueDate: string;
  description?: string;
  externalReference?: string;
}): Promise<AsaasSubscription> {
  const response = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AsaasSubscription>(response, 'createSubscription');
}

export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  const response = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}`, {
    headers: getHeaders(),
  });
  return handleResponse<AsaasSubscription>(response, 'getSubscription');
}

export async function cancelSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  const response = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<AsaasSubscription>(response, 'cancelSubscription');
}
