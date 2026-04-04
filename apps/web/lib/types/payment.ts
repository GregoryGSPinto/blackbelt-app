// ============================================================
// BlackBelt v2 — Payment Types
// DTOs para integração com gateways de pagamento
// ============================================================

export type PaymentMethod = 'pix' | 'boleto' | 'credit_card';

export type WebhookEventType =
  | 'payment.confirmed'
  | 'payment.overdue'
  | 'payment.refunded'
  | 'subscription.cancelled'
  | 'subscription.renewed';

export interface CreateCustomerData {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
}

export interface ExternalCustomer {
  externalId: string;
  gateway: string;
}

export interface ExternalSubscription {
  externalId: string;
  gateway: string;
  status: string;
}

export interface ExternalInvoice {
  externalId: string;
  gateway: string;
  paymentUrl?: string;
}

export interface PaymentLink {
  url: string;
  expiresAt: string;
  qrCode?: string;
  barCode?: string;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  gateway: string;
  externalId: string;
  data: Record<string, unknown>;
  receivedAt: string;
}

export interface PaymentConfirmation {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  gatewayTransactionId: string;
}

export interface BillingConfig {
  id: string;
  academyId: string;
  autoCharge: boolean;
  dueDayOfMonth: number;
  reminderDaysBefore: number;
  blockAfterDays: number;
  gateway: 'asaas' | 'stripe' | 'mock';
  gatewayApiKey?: string;
}

export interface BillingPreview {
  totalInvoices: number;
  totalAmount: number;
  nextDueDate: string;
  subscriptionsAffected: number;
}

export interface WebhookLog {
  id: string;
  eventType: WebhookEventType;
  gateway: string;
  externalId: string;
  status: 'processed' | 'failed' | 'ignored';
  receivedAt: string;
  error?: string;
}
