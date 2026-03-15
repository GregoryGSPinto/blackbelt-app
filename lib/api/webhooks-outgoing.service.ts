import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export type WebhookEvent =
  | 'student.created' | 'student.updated'
  | 'attendance.created'
  | 'invoice.created' | 'invoice.paid' | 'invoice.overdue'
  | 'progression.created'
  | 'subscription.created' | 'subscription.cancelled';

export interface OutgoingWebhook {
  id: string;
  academyId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'success' | 'failed' | 'pending';
  responseCode: number | null;
  attemptCount: number;
  createdAt: string;
}

export interface WebhookTestResult {
  success: boolean;
  responseCode: number;
  responseTime: number;
  error: string | null;
}

export async function registerWebhook(academyId: string, url: string, events: WebhookEvent[]): Promise<OutgoingWebhook> {
  try {
    if (isMock()) {
      const { mockRegisterWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockRegisterWebhook(academyId, url, events);
    }
    const res = await fetch('/api/v1/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, url, events }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'webhooksOutgoing.register'); }
}

export async function listWebhooks(academyId: string): Promise<OutgoingWebhook[]> {
  try {
    if (isMock()) {
      const { mockListWebhooks } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockListWebhooks(academyId);
    }
    const res = await fetch(`/api/v1/webhooks?academyId=${academyId}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'webhooksOutgoing.list'); }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockDeleteWebhook(webhookId);
    }
    await fetch(`/api/v1/webhooks/${webhookId}`, { method: 'DELETE' });
  } catch (error) { handleServiceError(error, 'webhooksOutgoing.delete'); }
}

export async function testWebhook(webhookId: string): Promise<WebhookTestResult> {
  try {
    if (isMock()) {
      const { mockTestWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockTestWebhook(webhookId);
    }
    const res = await fetch(`/api/v1/webhooks/${webhookId}/test`, { method: 'POST' });
    return res.json();
  } catch (error) { handleServiceError(error, 'webhooksOutgoing.test'); }
}

export async function getDeliveryLog(webhookId: string): Promise<WebhookDelivery[]> {
  try {
    if (isMock()) {
      const { mockGetDeliveryLog } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockGetDeliveryLog(webhookId);
    }
    const res = await fetch(`/api/v1/webhooks/${webhookId}/deliveries`);
    return res.json();
  } catch (error) { handleServiceError(error, 'webhooksOutgoing.deliveries'); }
}
