import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BillingConfig, BillingPreview, WebhookLog } from '@/lib/types/payment';

export async function getBillingConfig(academyId: string): Promise<BillingConfig> {
  try {
    if (isMock()) {
      const { mockGetBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockGetBillingConfig(academyId);
    }
    try {
      const res = await fetch(`/api/billing/config?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'billing.config');
      return res.json();
    } catch {
      console.warn('[billing-config.getBillingConfig] API not available, using fallback');
      return {} as BillingConfig;
    }
  } catch (error) { handleServiceError(error, 'billing.config'); }
}

export async function updateBillingConfig(config: Partial<BillingConfig> & { academyId: string }): Promise<BillingConfig> {
  try {
    if (isMock()) {
      const { mockUpdateBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockUpdateBillingConfig(config);
    }
    try {
      const res = await fetch(`/api/billing/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      if (!res.ok) throw new ServiceError(res.status, 'billing.config.update');
      return res.json();
    } catch {
      console.warn('[billing-config.updateBillingConfig] API not available, using fallback');
      return {} as BillingConfig;
    }
  } catch (error) { handleServiceError(error, 'billing.config.update'); }
}

export async function getWebhookLogs(academyId: string): Promise<WebhookLog[]> {
  try {
    if (isMock()) {
      const { mockGetWebhookLogs } = await import('@/lib/mocks/billing-config.mock');
      return mockGetWebhookLogs(academyId);
    }
    try {
      const res = await fetch(`/api/billing/webhook-logs?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'billing.webhookLogs');
      return res.json();
    } catch {
      console.warn('[billing-config.getWebhookLogs] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'billing.webhookLogs'); }
}

export async function previewNextBilling(academyId: string): Promise<BillingPreview> {
  try {
    if (isMock()) {
      const { mockPreviewBilling } = await import('@/lib/mocks/billing-config.mock');
      return mockPreviewBilling(academyId);
    }
    try {
      const res = await fetch(`/api/billing/preview?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'billing.preview');
      return res.json();
    } catch {
      console.warn('[billing-config.previewNextBilling] API not available, using fallback');
      return {} as BillingPreview;
    }
  } catch (error) { handleServiceError(error, 'billing.preview'); }
}
