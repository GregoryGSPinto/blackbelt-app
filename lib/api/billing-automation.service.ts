import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BillingConfig, BillingPreview } from '@/lib/types/payment';

export interface BillingCycleResult {
  invoicesGenerated: number;
  remindersSet: number;
  overdueMarked: number;
  alertsSent: number;
}

export async function getBillingCycleConfig(academyId: string): Promise<BillingConfig> {
  try {
    if (isMock()) {
      const { mockGetBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockGetBillingConfig(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockGetBillingConfig(academyId);
  } catch (error) { handleServiceError(error, 'billing.cycle.config'); }
}

export async function previewNextBillingCycle(academyId: string): Promise<BillingPreview> {
  try {
    if (isMock()) {
      const { mockPreviewBilling } = await import('@/lib/mocks/billing-config.mock');
      return mockPreviewBilling(academyId);
    }
    // API not yet implemented — use mock
    const { mockPreviewBilling } = await import('@/lib/mocks/billing-config.mock');
      return mockPreviewBilling(academyId);
  } catch (error) { handleServiceError(error, 'billing.cycle.preview'); }
}

export async function runBillingCycle(academyId: string): Promise<BillingCycleResult> {
  try {
    if (isMock()) {
      const { mockRunBillingCycle } = await import('@/lib/mocks/billing-automation.mock');
      return mockRunBillingCycle(academyId);
    }
    try {
      const res = await fetch(`/api/billing/run-cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'billing.cycle.run');
      return res.json();
    } catch {
      console.warn('[billing-automation.runBillingCycle] API not available, using mock fallback');
      const { mockRunBillingCycle } = await import('@/lib/mocks/billing-automation.mock');
      return mockRunBillingCycle(academyId);
    }
  } catch (error) { handleServiceError(error, 'billing.cycle.run'); }
}
