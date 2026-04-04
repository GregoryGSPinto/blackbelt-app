import type {
  PaymentGatewayConfig,
  PaymentCharge,
  PaymentSubscription,
  FinancialSummary,
  GatewayStatus,
  ChargeFilters,
} from '@/lib/api/payment-gateway.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_CHARGES: PaymentCharge[] = [
  { id: 'ch-1', customerId: 'cust-1', customerName: 'João Mendes', description: 'Mensalidade Março/2026', value: 179.00, netValue: 174.23, dueDate: '2026-03-10', status: 'received', billingType: 'PIX', paidAt: '2026-03-09T14:20:00Z', paymentMethod: 'PIX', invoiceUrl: '#', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'ch-2', customerId: 'cust-2', customerName: 'Maria Santos', description: 'Mensalidade Março/2026', value: 199.00, dueDate: '2026-03-15', status: 'pending', billingType: 'PIX', pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...', pixCopyPaste: '00020126580014br.gov.bcb.pix0136example-pix-key5204000053039865802BR5913ACADEMIA TEST6009SAO PAULO62070503***6304ABCD', invoiceUrl: '#', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'ch-3', customerId: 'cust-3', customerName: 'Pedro Oliveira', description: 'Mensalidade Março/2026', value: 179.00, dueDate: '2026-03-05', status: 'overdue', billingType: 'BOLETO', boletoUrl: '#', invoiceUrl: '#', createdAt: '2026-02-25T00:00:00Z' },
  { id: 'ch-4', customerId: 'cust-4', customerName: 'Ana Souza', description: 'Mensalidade Março/2026', value: 249.00, netValue: 242.03, dueDate: '2026-03-10', status: 'received', billingType: 'CREDIT_CARD', paidAt: '2026-03-10T10:00:00Z', paymentMethod: 'CREDIT_CARD', invoiceUrl: '#', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'ch-5', customerId: 'cust-5', customerName: 'Lucas Ferreira', description: 'Mensalidade Março/2026', value: 179.00, netValue: 174.23, dueDate: '2026-03-10', status: 'confirmed', billingType: 'PIX', paidAt: '2026-03-10T08:30:00Z', paymentMethod: 'PIX', invoiceUrl: '#', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'ch-6', customerId: 'cust-6', customerName: 'Carla Lima', description: 'Mensalidade Março/2026', value: 199.00, dueDate: '2026-03-20', status: 'pending', billingType: 'BOLETO', boletoUrl: '#', boletoBarcode: '23793.38128 60000.000003 00000.000408 1 84340000019900', invoiceUrl: '#', createdAt: '2026-03-05T00:00:00Z' },
  { id: 'ch-7', customerId: 'cust-7', customerName: 'Roberto Silva', description: 'Mensalidade Fev/2026', value: 179.00, dueDate: '2026-02-10', status: 'overdue', billingType: 'PIX', invoiceUrl: '#', createdAt: '2026-02-01T00:00:00Z' },
  { id: 'ch-8', customerId: 'cust-8', customerName: 'Fernanda Costa', description: 'Matrícula + Kimono', value: 350.00, netValue: 340.25, dueDate: '2026-03-15', status: 'received', billingType: 'CREDIT_CARD', paidAt: '2026-03-15T11:00:00Z', paymentMethod: 'CREDIT_CARD', invoiceUrl: '#', createdAt: '2026-03-14T00:00:00Z' },
];

const MOCK_SUBSCRIPTIONS: PaymentSubscription[] = [
  { id: 'sub-1', customerId: 'cust-1', customerName: 'João Mendes', description: 'Plano Mensal BJJ', value: 179.00, cycle: 'MONTHLY', billingType: 'PIX', nextDueDate: '2026-04-10', status: 'active' },
  { id: 'sub-2', customerId: 'cust-2', customerName: 'Maria Santos', description: 'Plano Trimestral Completo', value: 529.00, cycle: 'QUARTERLY', billingType: 'CREDIT_CARD', nextDueDate: '2026-06-15', status: 'active' },
  { id: 'sub-3', customerId: 'cust-4', customerName: 'Ana Souza', description: 'Plano Mensal Premium', value: 249.00, cycle: 'MONTHLY', billingType: 'CREDIT_CARD', nextDueDate: '2026-04-10', status: 'active' },
  { id: 'sub-4', customerId: 'cust-7', customerName: 'Roberto Silva', description: 'Plano Mensal BJJ', value: 179.00, cycle: 'MONTHLY', billingType: 'PIX', nextDueDate: '2026-03-10', status: 'inactive' },
];

export async function mockGetGatewayConfig(academyId: string): Promise<PaymentGatewayConfig> {
  await delay();
  return { provider: 'asaas', apiKey: '***hidden***', environment: 'sandbox', academyId, connected: true, lastSync: '2026-03-18T12:00:00Z' };
}

export async function mockSaveGatewayConfig(_academyId: string, _config: Partial<PaymentGatewayConfig>): Promise<void> {
  await delay();
}

export async function mockTestConnection(_config: Partial<PaymentGatewayConfig>): Promise<boolean> {
  await delay();
  return true;
}

export async function mockGetGatewayStatus(_academyId: string): Promise<GatewayStatus> {
  await delay();
  return { connected: true, provider: 'Asaas', lastSync: '2026-03-18T12:00:00Z' };
}

export async function mockCreateCharge(_academyId: string, customerId: string, value: number, dueDate: string, billingType: PaymentCharge['billingType'], description: string): Promise<PaymentCharge> {
  await delay();
  return { id: `ch-${Date.now()}`, customerId, customerName: 'Cliente', description, value, dueDate, status: 'pending', billingType, createdAt: new Date().toISOString() };
}

export async function mockListCharges(_academyId: string, filters?: ChargeFilters): Promise<PaymentCharge[]> {
  await delay();
  let charges = [...MOCK_CHARGES];
  if (filters?.status) charges = charges.filter((c) => c.status === filters.status);
  if (filters?.billingType) charges = charges.filter((c) => c.billingType === filters.billingType);
  return charges;
}

export async function mockListSubscriptions(_academyId: string): Promise<PaymentSubscription[]> {
  await delay();
  return MOCK_SUBSCRIPTIONS;
}

export async function mockGetFinancialSummary(_academyId: string): Promise<FinancialSummary> {
  await delay();
  return {
    received: 12450.00,
    pending: 3580.00,
    overdue: 1790.00,
    refunded: 350.00,
    netRevenue: 11856.75,
    fees: 593.25,
    byMethod: { pix: 7160.00, boleto: 1990.00, creditCard: 3300.00 },
  };
}

export async function mockGeneratePixQrCode(_chargeId: string): Promise<{ qrCode: string; copyPaste: string }> {
  await delay();
  return {
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIj5RUiBDb2RlIFBJWDwvdGV4dD48L3N2Zz4=',
    copyPaste: '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540510.005802BR5925GUERREIROS DO TATAME LTDA6009SAO PAULO62070503***6304B14F',
  };
}

export async function mockSyncCustomers(_academyId: string): Promise<{ synced: number }> {
  await delay();
  return { synced: 45 };
}
