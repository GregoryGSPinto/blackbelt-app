import type {
  PlanDefinition,
  BillingSummary,
  UsageMetric,
  BillingInvoice,
  UsageAlert,
  OverageProjection,
} from '@/lib/types/billing';

// ── Helpers ──────────────────────────────────────────────────────────
function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Plan definitions (5 tiers) ───────────────────────────────────────

const PLANS: PlanDefinition[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    price_monthly: 9700,
    price_yearly: 93100,
    limits: { students: 50, professors: 2, classes: 10, storage_gb: 5 },
    overage: { student_cents: 250, professor_cents: 590, class_cents: 90, storage_gb_cents: 150 },
    modules: { streaming: false, store: false, financial: true, events: false, multi_branch: false, api: false },
    support_level: 'email',
    is_popular: false,
    badge_color: '#6B7085',
  },
  {
    id: 'plan-essencial',
    name: 'Essencial',
    slug: 'essencial',
    price_monthly: 19700,
    price_yearly: 189100,
    limits: { students: 100, professors: 5, classes: 20, storage_gb: 20 },
    overage: { student_cents: 220, professor_cents: 490, class_cents: 70, storage_gb_cents: 120 },
    modules: { streaming: true, store: false, financial: true, events: false, multi_branch: false, api: false },
    support_level: 'email_chat',
    is_popular: false,
    badge_color: '#3B82F6',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    slug: 'pro',
    price_monthly: 34700,
    price_yearly: 333100,
    limits: { students: 200, professors: -1, classes: 9999, storage_gb: 50 },
    overage: { student_cents: 190, professor_cents: 0, class_cents: 50, storage_gb_cents: 90 },
    modules: { streaming: true, store: true, financial: true, events: true, multi_branch: false, api: false },
    support_level: 'priority',
    is_popular: true,
    badge_color: '#EF4444',
  },
  {
    id: 'plan-blackbelt',
    name: 'Black Belt',
    slug: 'blackbelt',
    price_monthly: 59700,
    price_yearly: 573100,
    limits: { students: -1, professors: -1, classes: -1, storage_gb: 200 },
    overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 70 },
    modules: { streaming: true, store: true, financial: true, events: true, multi_branch: true, api: true },
    support_level: 'dedicated',
    is_popular: false,
    badge_color: '#F59E0B',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price_monthly: 0,
    price_yearly: 0,
    limits: { students: -1, professors: -1, classes: -1, storage_gb: 1000 },
    overage: { student_cents: 0, professor_cents: 0, class_cents: 0, storage_gb_cents: 0 },
    modules: { streaming: true, store: true, financial: true, events: true, multi_branch: true, api: true },
    support_level: 'account_manager',
    is_popular: false,
    badge_color: '#8B5CF6',
  },
];

// ── Mock usage data (Guerreiros BJJ — Pro plan) ─────────────────────

const MOCK_USAGE: UsageMetric[] = [
  {
    resource: 'students',
    label: 'Alunos Ativos',
    icon: '\uD83D\uDC65',
    current: 172,
    limit: 200,
    percent: 86,
    status: 'warning',
    overage_count: 0,
    overage_cost_cents: 0,
  },
  {
    resource: 'professors',
    label: 'Professores',
    icon: '\uD83D\uDC68\u200D\uD83C\uDFEB',
    current: 12,
    limit: 15,
    percent: 80,
    status: 'warning',
    overage_count: 0,
    overage_cost_cents: 0,
  },
  {
    resource: 'classes',
    label: 'Turmas',
    icon: '\uD83D\uDCDA',
    current: 22,
    limit: 30,
    percent: 73,
    status: 'normal',
    overage_count: 0,
    overage_cost_cents: 0,
  },
  {
    resource: 'storage_gb',
    label: 'Armazenamento',
    icon: '\uD83D\uDCBE',
    current: 31.2,
    limit: 50,
    percent: 62,
    status: 'normal',
    overage_count: 0,
    overage_cost_cents: 0,
  },
];

// ── Mock invoices ───────────────────────────────────────────────────

const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: 'inv-2026-03',
    period: 'Mar/2026',
    base_cost_cents: 34700,
    overage_details: [],
    overage_total_cents: 0,
    total_cents: 34700,
    status: 'pending',
    paid_at: null,
    pdf_url: null,
  },
  {
    id: 'inv-2026-02',
    period: 'Fev/2026',
    base_cost_cents: 34700,
    overage_details: [
      { resource: 'Alunos excedentes', count: 8, unit_cost_cents: 190, total_cents: 1520 },
    ],
    overage_total_cents: 1520,
    total_cents: 36220,
    status: 'paid',
    paid_at: '2026-03-05T10:30:00Z',
    pdf_url: '/mock/invoice-fev-2026.pdf',
  },
  {
    id: 'inv-2026-01',
    period: 'Jan/2026',
    base_cost_cents: 34700,
    overage_details: [],
    overage_total_cents: 0,
    total_cents: 34700,
    status: 'paid',
    paid_at: '2026-02-05T09:15:00Z',
    pdf_url: '/mock/invoice-jan-2026.pdf',
  },
];

// ── Mock alerts ─────────────────────────────────────────────────────

let MOCK_ALERTS: UsageAlert[] = [
  {
    id: 'alert-1',
    resource: 'students',
    level: 'warning',
    message: 'Alunos atingiu 86% do limite (172/200)',
    percent: 86,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dismissed: false,
  },
  {
    id: 'alert-2',
    resource: 'professors',
    level: 'warning',
    message: 'Professores atingiu 80% do limite (12/15)',
    percent: 80,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dismissed: false,
  },
];

// ── Mock implementations ────────────────────────────────────────────

export async function mockGetPlans(): Promise<PlanDefinition[]> {
  await delay();
  return PLANS;
}

export async function mockGetCurrentPlan(_academyId: string): Promise<PlanDefinition> {
  await delay();
  return PLANS[2]; // Pro
}

export async function mockGetBillingSummary(_academyId: string): Promise<BillingSummary> {
  await delay();
  const plan = PLANS[2]; // Pro
  return {
    plan,
    billing_cycle: 'monthly',
    cycle_start: '2026-03-01',
    cycle_end: '2026-03-31',
    base_cost_cents: plan.price_monthly,
    overage_cost_cents: 0,
    total_cost_cents: plan.price_monthly,
    usage: MOCK_USAGE,
    trial: {
      is_trial: false,
      trial_ends_at: null,
      days_remaining: 0,
    },
    next_invoice_date: '2026-04-01',
  };
}

export async function mockGetUsageMetrics(_academyId: string): Promise<UsageMetric[]> {
  await delay();
  return MOCK_USAGE;
}

export async function mockGetInvoices(_academyId: string, limit?: number): Promise<BillingInvoice[]> {
  await delay();
  return limit ? MOCK_INVOICES.slice(0, limit) : MOCK_INVOICES;
}

export async function mockGetAlerts(_academyId: string): Promise<UsageAlert[]> {
  await delay();
  return MOCK_ALERTS.filter((a) => !a.dismissed);
}

export async function mockDismissAlert(alertId: string): Promise<void> {
  await delay(150);
  MOCK_ALERTS = MOCK_ALERTS.map((a) =>
    a.id === alertId ? { ...a, dismissed: true } : a,
  );
}

export async function mockRequestUpgrade(
  _academyId: string,
  _planSlug: string,
): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

export async function mockRequestDowngrade(
  _academyId: string,
  _planSlug: string,
): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

export async function mockToggleBillingCycle(
  _academyId: string,
  _cycle: 'monthly' | 'yearly',
): Promise<void> {
  await delay(300);
}

export async function mockGetOverageProjection(_academyId: string): Promise<OverageProjection> {
  await delay();
  const currentPlan = PLANS[2]; // Pro
  const nextPlan = PLANS[3]; // Black Belt

  // Currently no overage for Pro
  const totalOverage = 0;
  const currentTotal = currentPlan.price_monthly + totalOverage;
  const upgradeCost = nextPlan.price_monthly;
  const savingsIfUpgrade = currentTotal - upgradeCost; // negative = upgrade costs more

  // Breakeven: at how many extra students does Black Belt become cheaper?
  // cost_diff = 59700 - 34700 = 25000 cents
  // per_student_savings = 190 cents (Pro overage per student)
  // breakeven = ceil(25000 / 190) = 132
  const breakeven = Math.ceil(
    (nextPlan.price_monthly - currentPlan.price_monthly) / currentPlan.overage.student_cents,
  );

  return {
    base_cost_cents: currentPlan.price_monthly,
    overage_students: { count: 0, cost_cents: 0 },
    overage_professors: { count: 0, cost_cents: 0 },
    overage_classes: { count: 0, cost_cents: 0 },
    overage_storage: { count: 0, cost_cents: 0 },
    total_overage_cents: 0,
    total_cents: currentPlan.price_monthly,
    upgrade_suggestion:
      savingsIfUpgrade < 0
        ? {
            plan: nextPlan,
            monthly_savings_cents: savingsIfUpgrade,
            breakeven_overage: breakeven,
          }
        : null,
  };
}
