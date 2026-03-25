import { isMock } from '@/lib/env';
import type {
  PlanDefinition,
  BillingSummary,
  UsageMetric,
  BillingInvoice,
  UsageAlert,
  OverageProjection,
} from '@/lib/types/billing';

export async function getPlans(): Promise<PlanDefinition[]> {
  if (isMock()) {
    const { mockGetPlans } = await import('@/lib/mocks/billing.mock');
    return mockGetPlans();
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('billing_plans').select('*');
  if (error || !data) {
    console.error('[getPlans] Supabase error:', error?.message);
    return [];
  }
  return data as PlanDefinition[];
}

export async function getCurrentPlan(academyId: string): Promise<PlanDefinition> {
  if (isMock()) {
    const { mockGetCurrentPlan } = await import('@/lib/mocks/billing.mock');
    return mockGetCurrentPlan(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academy_subscriptions')
    .select('*, billing_plans(*)')
    .eq('academy_id', academyId)
    .single();
  if (error || !data) {
    console.error('[getCurrentPlan] Supabase error:', error?.message);
    return { id: '', name: '', slug: '', price_monthly: 0, price_yearly: 0, limits: { students: 0, professors: 0, classes: 0, storage_gb: 0 }, overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 0 }, modules: { streaming: false, store: false, financial: false, events: false, multi_branch: false, api: false }, support_level: 'email', is_popular: false, badge_color: '' } as PlanDefinition;
  }
  return data.billing_plans as PlanDefinition;
}

export async function getBillingSummary(academyId: string): Promise<BillingSummary> {
  const emptyPlan: PlanDefinition = { id: '', name: '', slug: '', price_monthly: 0, price_yearly: 0, limits: { students: 0, professors: 0, classes: 0, storage_gb: 0 }, overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 0 }, modules: { streaming: false, store: false, financial: false, events: false, multi_branch: false, api: false }, support_level: 'email', is_popular: false, badge_color: '' };
  const fallback = { plan: emptyPlan, billing_cycle: 'monthly', cycle_start: '', cycle_end: '', base_cost_cents: 0, overage_cost_cents: 0, total_cost_cents: 0, usage: [], trial: { is_trial: false, trial_ends_at: null, days_remaining: 0 }, next_invoice_date: '' } as BillingSummary;

  if (isMock()) {
    const { mockGetBillingSummary } = await import('@/lib/mocks/billing.mock');
    return mockGetBillingSummary(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('billing_summaries')
    .select('*')
    .eq('academy_id', academyId)
    .single();
  if (error || !data) {
    console.error('[getBillingSummary] Supabase error:', error?.message);
    return fallback;
  }
  return data as unknown as BillingSummary;
}

export async function getUsageMetrics(academyId: string): Promise<UsageMetric[]> {
  if (isMock()) {
    const { mockGetUsageMetrics } = await import('@/lib/mocks/billing.mock');
    return mockGetUsageMetrics(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('billing_usage_metrics')
    .select('*')
    .eq('academy_id', academyId);
  if (error || !data) {
    console.error('[getUsageMetrics] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as UsageMetric[];
}

export async function getInvoices(academyId: string, limit?: number): Promise<BillingInvoice[]> {
  if (isMock()) {
    const { mockGetInvoices } = await import('@/lib/mocks/billing.mock');
    return mockGetInvoices(academyId, limit);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  let query = supabase
    .from('billing_invoices')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error || !data) {
    console.error('[getInvoices] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as BillingInvoice[];
}

export async function getAlerts(academyId: string): Promise<UsageAlert[]> {
  if (isMock()) {
    const { mockGetAlerts } = await import('@/lib/mocks/billing.mock');
    return mockGetAlerts(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('billing_alerts')
    .select('*')
    .eq('academy_id', academyId)
    .eq('dismissed', false);
  if (error || !data) {
    console.error('[getAlerts] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as UsageAlert[];
}

export async function dismissAlert(alertId: string): Promise<void> {
  if (isMock()) {
    const { mockDismissAlert } = await import('@/lib/mocks/billing.mock');
    return mockDismissAlert(alertId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('billing_alerts')
    .update({ dismissed: true })
    .eq('id', alertId);
  if (error) {
    console.error('[dismissAlert] Supabase error:', error.message);
  }
}

export async function requestUpgrade(
  academyId: string,
  planSlug: string,
): Promise<{ success: boolean }> {
  if (isMock()) {
    const { mockRequestUpgrade } = await import('@/lib/mocks/billing.mock');
    return mockRequestUpgrade(academyId, planSlug);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('billing_upgrade_requests')
    .insert({ academy_id: academyId, plan_slug: planSlug, status: 'pending' });
  if (error) {
    console.error('[requestUpgrade] Supabase error:', error.message);
    return { success: false };
  }
  return { success: true };
}

export async function requestDowngrade(
  academyId: string,
  planSlug: string,
): Promise<{ success: boolean }> {
  if (isMock()) {
    const { mockRequestDowngrade } = await import('@/lib/mocks/billing.mock');
    return mockRequestDowngrade(academyId, planSlug);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('billing_downgrade_requests')
    .insert({ academy_id: academyId, plan_slug: planSlug, status: 'pending' });
  if (error) {
    console.error('[requestDowngrade] Supabase error:', error.message);
    return { success: false };
  }
  return { success: true };
}

export async function toggleBillingCycle(
  academyId: string,
  cycle: 'monthly' | 'yearly',
): Promise<void> {
  if (isMock()) {
    const { mockToggleBillingCycle } = await import('@/lib/mocks/billing.mock');
    return mockToggleBillingCycle(academyId, cycle);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('academy_subscriptions')
    .update({ billing_cycle: cycle })
    .eq('academy_id', academyId);
  if (error) {
    console.error('[toggleBillingCycle] Supabase error:', error.message);
  }
}

export async function getOverageProjection(academyId: string): Promise<OverageProjection> {
  const fallback = { base_cost_cents: 0, overage_students: { count: 0, cost_cents: 0 }, overage_professors: { count: 0, cost_cents: 0 }, overage_classes: { count: 0, cost_cents: 0 }, overage_storage: { count: 0, cost_cents: 0 }, total_overage_cents: 0, total_cents: 0, upgrade_suggestion: null } as OverageProjection;

  if (isMock()) {
    const { mockGetOverageProjection } = await import('@/lib/mocks/billing.mock');
    return mockGetOverageProjection(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('billing_overage_projections')
    .select('*')
    .eq('academy_id', academyId)
    .single();
  if (error || !data) {
    console.error('[getOverageProjection] Supabase error:', error?.message);
    return fallback;
  }
  return data as unknown as OverageProjection;
}
