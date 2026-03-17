import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type {
  PlanDefinition,
  BillingSummary,
  UsageMetric,
  BillingInvoice,
  UsageAlert,
  OverageProjection,
} from '@/lib/types/billing';

export async function getPlans(): Promise<PlanDefinition[]> {
  try {
    if (isMock()) {
      const { mockGetPlans } = await import('@/lib/mocks/billing.mock');
      return mockGetPlans();
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getPlans');
  }
}

export async function getCurrentPlan(academyId: string): Promise<PlanDefinition> {
  try {
    if (isMock()) {
      const { mockGetCurrentPlan } = await import('@/lib/mocks/billing.mock');
      return mockGetCurrentPlan(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getCurrentPlan');
  }
}

export async function getBillingSummary(academyId: string): Promise<BillingSummary> {
  try {
    if (isMock()) {
      const { mockGetBillingSummary } = await import('@/lib/mocks/billing.mock');
      return mockGetBillingSummary(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getBillingSummary');
  }
}

export async function getUsageMetrics(academyId: string): Promise<UsageMetric[]> {
  try {
    if (isMock()) {
      const { mockGetUsageMetrics } = await import('@/lib/mocks/billing.mock');
      return mockGetUsageMetrics(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getUsageMetrics');
  }
}

export async function getInvoices(academyId: string, limit?: number): Promise<BillingInvoice[]> {
  try {
    if (isMock()) {
      const { mockGetInvoices } = await import('@/lib/mocks/billing.mock');
      return mockGetInvoices(academyId, limit);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getInvoices');
  }
}

export async function getAlerts(academyId: string): Promise<UsageAlert[]> {
  try {
    if (isMock()) {
      const { mockGetAlerts } = await import('@/lib/mocks/billing.mock');
      return mockGetAlerts(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getAlerts');
  }
}

export async function dismissAlert(alertId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDismissAlert } = await import('@/lib/mocks/billing.mock');
      return mockDismissAlert(alertId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.dismissAlert');
  }
}

export async function requestUpgrade(
  academyId: string,
  planSlug: string,
): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRequestUpgrade } = await import('@/lib/mocks/billing.mock');
      return mockRequestUpgrade(academyId, planSlug);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.requestUpgrade');
  }
}

export async function requestDowngrade(
  academyId: string,
  planSlug: string,
): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRequestDowngrade } = await import('@/lib/mocks/billing.mock');
      return mockRequestDowngrade(academyId, planSlug);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.requestDowngrade');
  }
}

export async function toggleBillingCycle(
  academyId: string,
  cycle: 'monthly' | 'yearly',
): Promise<void> {
  try {
    if (isMock()) {
      const { mockToggleBillingCycle } = await import('@/lib/mocks/billing.mock');
      return mockToggleBillingCycle(academyId, cycle);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.toggleBillingCycle');
  }
}

export async function getOverageProjection(academyId: string): Promise<OverageProjection> {
  try {
    if (isMock()) {
      const { mockGetOverageProjection } = await import('@/lib/mocks/billing.mock');
      return mockGetOverageProjection(academyId);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'billing.getOverageProjection');
  }
}
