import type { BillingConfig, BillingPreview, WebhookLog } from '@/lib/types/payment';

const delay = () => new Promise((r) => setTimeout(r, 200));

let mockConfig: BillingConfig = {
  id: 'bc-1',
  academyId: 'academy-1',
  autoCharge: true,
  dueDayOfMonth: 5,
  reminderDaysBefore: 3,
  blockAfterDays: 10,
  gateway: 'mock',
};

export async function mockGetBillingConfig(_academyId: string): Promise<BillingConfig> {
  await delay();
  return { ...mockConfig };
}

export async function mockUpdateBillingConfig(partial: Partial<BillingConfig>): Promise<BillingConfig> {
  await delay();
  mockConfig = { ...mockConfig, ...partial };
  return { ...mockConfig };
}

export async function mockGetWebhookLogs(_academyId: string): Promise<WebhookLog[]> {
  await delay();
  return [
    { id: 'wh-1', eventType: 'payment.confirmed', gateway: 'mock', externalId: 'inv_001', status: 'processed', receivedAt: '2026-03-14T10:00:00Z' },
    { id: 'wh-2', eventType: 'payment.overdue', gateway: 'mock', externalId: 'inv_002', status: 'processed', receivedAt: '2026-03-13T14:30:00Z' },
    { id: 'wh-3', eventType: 'subscription.cancelled', gateway: 'mock', externalId: 'sub_003', status: 'failed', receivedAt: '2026-03-12T09:15:00Z', error: 'Subscription not found' },
    { id: 'wh-4', eventType: 'payment.confirmed', gateway: 'mock', externalId: 'inv_004', status: 'processed', receivedAt: '2026-03-11T16:45:00Z' },
    { id: 'wh-5', eventType: 'payment.refunded', gateway: 'mock', externalId: 'inv_005', status: 'processed', receivedAt: '2026-03-10T11:20:00Z' },
  ];
}

export async function mockPreviewBilling(_academyId: string): Promise<BillingPreview> {
  await delay();
  return {
    totalInvoices: 45,
    totalAmount: 6750,
    nextDueDate: '2026-04-05',
    subscriptionsAffected: 45,
  };
}
