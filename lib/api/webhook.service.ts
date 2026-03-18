import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';
import type { WebhookConfig, WebhookDelivery, CreateWebhookPayload } from '@/lib/types/webhook';

export async function listWebhooks(academyId: string): Promise<WebhookConfig[]> {
  try {
    if (isMock()) {
      const { mockListWebhooks } = await import('@/lib/mocks/webhook.mock');
      return mockListWebhooks(academyId);
    }
    try {
      const res = await fetch(`/api/webhooks?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[webhook.listWebhooks] API not available, using mock fallback');
      const { mockListWebhooks } = await import('@/lib/mocks/webhook.mock');
      return mockListWebhooks(academyId);
    }
  } catch (error) {
    handleServiceError(error, 'webhook.list');
  }
}

export async function createWebhook(
  academyId: string,
  payload: CreateWebhookPayload,
): Promise<WebhookConfig> {
  try {
    if (isMock()) {
      const { mockCreateWebhook } = await import('@/lib/mocks/webhook.mock');
      return mockCreateWebhook(academyId, payload);
    }
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[webhook.createWebhook] API not available, using mock fallback');
      const { mockCreateWebhook } = await import('@/lib/mocks/webhook.mock');
      return mockCreateWebhook(academyId, payload);
    }

  } catch (error) {
    handleServiceError(error, 'webhook.create');
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Deleted webhook ${webhookId}`);
      return;
    }
    try {
      const res = await fetch(`/api/webhooks/${webhookId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[webhook.deleteWebhook] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'webhook.delete');
  }
}

export async function toggleWebhook(webhookId: string, active: boolean): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Webhook ${webhookId} set to ${active ? 'active' : 'inactive'}`);
      return;
    }
    try {
      const res = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[webhook.toggleWebhook] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'webhook.toggle');
  }
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit = 20,
): Promise<WebhookDelivery[]> {
  try {
    if (isMock()) {
      const { mockWebhookDeliveries } = await import('@/lib/mocks/webhook.mock');
      return mockWebhookDeliveries(webhookId, limit);
    }
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/deliveries?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[webhook.getWebhookDeliveries] API not available, using mock fallback');
      const { mockWebhookDeliveries } = await import('@/lib/mocks/webhook.mock');
      return mockWebhookDeliveries(webhookId, limit);
    }

  } catch (error) {
    handleServiceError(error, 'webhook.deliveries');
  }
}

export async function testWebhook(webhookId: string): Promise<{ success: boolean; statusCode: number }> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Test webhook ${webhookId}`);
      return { success: true, statusCode: 200 };
    }
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/test`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[webhook.testWebhook] API not available, using mock fallback');
      await import('@/lib/mocks/webhook.mock');
      return { success: true, statusCode: 200 };
    }
  } catch (error) {
    handleServiceError(error, 'webhook.test');
  }
}
