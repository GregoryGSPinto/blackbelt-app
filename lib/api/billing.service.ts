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
    console.warn('[billing.getPlans] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[billing.getCurrentPlan] fallback — not yet connected to Supabase');
    return { id: '', name: '', slug: '', price_monthly: 0, price_yearly: 0, limits: { students: 0, professors: 0, classes: 0, storage_gb: 0 }, overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 0 }, modules: { streaming: false, store: false, financial: false, events: false, multi_branch: false, api: false }, support_level: 'email', is_popular: false, badge_color: '' } as PlanDefinition;
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
    console.warn('[billing.getBillingSummary] fallback — not yet connected to Supabase');
    const emptyPlan: PlanDefinition = { id: '', name: '', slug: '', price_monthly: 0, price_yearly: 0, limits: { students: 0, professors: 0, classes: 0, storage_gb: 0 }, overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 0 }, modules: { streaming: false, store: false, financial: false, events: false, multi_branch: false, api: false }, support_level: 'email', is_popular: false, badge_color: '' };
    return { plan: emptyPlan, billing_cycle: 'monthly', cycle_start: '', cycle_end: '', base_cost_cents: 0, overage_cost_cents: 0, total_cost_cents: 0, usage: [], trial: { is_trial: false, trial_ends_at: null, days_remaining: 0 }, next_invoice_date: '' } as BillingSummary;
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
    console.warn('[billing.getUsageMetrics] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[billing.getInvoices] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[billing.getAlerts] fallback — not yet connected to Supabase');
    return [];
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
    console.warn('[billing.dismissAlert] fallback — not yet connected to Supabase');
    return;
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
    console.warn('[billing.requestUpgrade] fallback — not yet connected to Supabase');
    return { success: false };
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
    console.warn('[billing.requestDowngrade] fallback — not yet connected to Supabase');
    return { success: false };
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
    console.warn('[billing.toggleBillingCycle] fallback — not yet connected to Supabase');
    return;
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
    console.warn('[billing.getOverageProjection] fallback — not yet connected to Supabase');
    return { base_cost_cents: 0, overage_students: { count: 0, cost_cents: 0 }, overage_professors: { count: 0, cost_cents: 0 }, overage_classes: { count: 0, cost_cents: 0 }, overage_storage: { count: 0, cost_cents: 0 }, total_overage_cents: 0, total_cents: 0, upgrade_suggestion: null } as OverageProjection;
  } catch (error) {
    handleServiceError(error, 'billing.getOverageProjection');
  }
}
