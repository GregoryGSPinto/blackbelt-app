import type { OutgoingWebhook, WebhookDelivery, WebhookTestResult, WebhookEvent } from '@/lib/api/webhooks-outgoing.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const MOCK_WEBHOOKS: OutgoingWebhook[] = [
  { id: 'wh-1', academyId: 'academy-1', url: 'https://erp.exemplo.com/hooks/blackbelt', events: ['student.created', 'invoice.paid'], secret: 'whsec_abc123', active: true, createdAt: '2025-06-01T10:00:00Z' },
  { id: 'wh-2', academyId: 'academy-1', url: 'https://crm.exemplo.com/api/webhooks', events: ['student.created', 'student.updated', 'subscription.created'], secret: 'whsec_def456', active: true, createdAt: '2025-06-15T08:00:00Z' },
];

const MOCK_DELIVERIES: WebhookDelivery[] = [
  { id: 'del-1', webhookId: 'wh-1', event: 'student.created', status: 'success', responseCode: 200, attemptCount: 1, createdAt: '2025-07-10T14:30:00Z' },
  { id: 'del-2', webhookId: 'wh-1', event: 'invoice.paid', status: 'success', responseCode: 200, attemptCount: 1, createdAt: '2025-07-10T12:00:00Z' },
  { id: 'del-3', webhookId: 'wh-1', event: 'invoice.paid', status: 'failed', responseCode: 500, attemptCount: 3, createdAt: '2025-07-09T16:00:00Z' },
  { id: 'del-4', webhookId: 'wh-2', event: 'student.created', status: 'success', responseCode: 201, attemptCount: 1, createdAt: '2025-07-10T14:30:00Z' },
  { id: 'del-5', webhookId: 'wh-2', event: 'subscription.created', status: 'pending', responseCode: null, attemptCount: 0, createdAt: '2025-07-10T15:00:00Z' },
];

export async function mockRegisterWebhook(academyId: string, url: string, events: WebhookEvent[]): Promise<OutgoingWebhook> {
  await delay();
  return { id: `wh-${Date.now()}`, academyId, url, events, secret: `whsec_${Math.random().toString(36).slice(2, 10)}`, active: true, createdAt: new Date().toISOString() };
}

export async function mockListWebhooks(_academyId: string): Promise<OutgoingWebhook[]> {
  await delay();
  return MOCK_WEBHOOKS;
}

export async function mockDeleteWebhook(_webhookId: string): Promise<void> {
  await delay();
}

export async function mockTestWebhook(_webhookId: string): Promise<WebhookTestResult> {
  await delay();
  return { success: true, responseCode: 200, responseTime: 145, error: null };
}

export async function mockGetDeliveryLog(_webhookId: string): Promise<WebhookDelivery[]> {
  await delay();
  return MOCK_DELIVERIES;
}
