// ============================================================
// BlackBelt v2 — Billing & Plan types
// ============================================================

export interface PlanDefinition {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  limits: {
    students: number;
    professors: number;
    classes: number;
    storage_gb: number;
  };
  overage: {
    student_cents: number;
    professor_cents: number;
    class_cents: number;
    storage_gb_cents: number;
  };
  modules: {
    streaming: boolean;
    store: boolean;
    financial: boolean;
    events: boolean;
    multi_branch: boolean;
    api: boolean;
  };
  support_level: 'email' | 'email_chat' | 'priority' | 'dedicated' | 'account_manager';
  is_popular: boolean;
  badge_color: string;
}

export interface UsageMetric {
  resource: 'students' | 'professors' | 'classes' | 'storage_gb';
  label: string;
  icon: string;
  current: number;
  limit: number;
  percent: number;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
  overage_count: number;
  overage_cost_cents: number;
}

export interface BillingSummary {
  plan: PlanDefinition;
  billing_cycle: 'monthly' | 'yearly';
  cycle_start: string;
  cycle_end: string;
  base_cost_cents: number;
  overage_cost_cents: number;
  total_cost_cents: number;
  usage: UsageMetric[];
  trial: {
    is_trial: boolean;
    trial_ends_at: string | null;
    days_remaining: number;
  };
  next_invoice_date: string;
}

export interface BillingInvoice {
  id: string;
  period: string;
  base_cost_cents: number;
  overage_details: {
    resource: string;
    count: number;
    unit_cost_cents: number;
    total_cents: number;
  }[];
  overage_total_cents: number;
  total_cents: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_at: string | null;
  pdf_url: string | null;
}

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'exceeded';

export interface UsageAlert {
  id: string;
  resource: string;
  level: AlertLevel;
  message: string;
  percent: number;
  created_at: string;
  dismissed: boolean;
}

export interface OverageProjection {
  base_cost_cents: number;
  overage_students: { count: number; cost_cents: number };
  overage_professors: { count: number; cost_cents: number };
  overage_classes: { count: number; cost_cents: number };
  overage_storage: { count: number; cost_cents: number };
  total_overage_cents: number;
  total_cents: number;
  upgrade_suggestion: {
    plan: PlanDefinition;
    monthly_savings_cents: number;
    breakeven_overage: number;
  } | null;
}
