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

// ============================================================
// Trial & Subscription — Asaas integration
// ============================================================

export interface AsaasPlan {
  id: string;
  name: string;
  price: number;
  priceCents: number;
  maxStudents: number | null;
  maxUnits: number | null;
  maxProfessors: number | null;
  features: string[];
  popular?: boolean;
}

export const PLANS: AsaasPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    priceCents: 7900,
    maxStudents: 50,
    maxUnits: 1,
    maxProfessors: 2,
    features: [
      'Gestão de alunos',
      'Check-in',
      'Financeiro básico',
      'Agenda',
      'Notificações',
      'Biblioteca de vídeos',
    ],
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: 149,
    priceCents: 14900,
    maxStudents: 100,
    maxUnits: 1,
    maxProfessors: 5,
    features: [
      'Tudo do Starter',
      'Streaming library',
      'Certificados digitais',
      'Relatórios avançados',
      'Comunicação com responsáveis',
      'App do aluno',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    priceCents: 24900,
    maxStudents: 200,
    maxUnits: 2,
    maxProfessors: null,
    popular: true,
    features: [
      'Tudo do Essencial',
      'Módulo Compete (campeonatos)',
      'Gamificação teen',
      'Currículo técnico',
      'Match analysis',
      'Estoque',
      'Contratos digitais',
    ],
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    price: 397,
    priceCents: 39700,
    maxStudents: null,
    maxUnits: null,
    maxProfessors: null,
    features: [
      'Tudo do Pro',
      'Painel franqueador',
      'White-label',
      'API access',
      'Suporte prioritário',
      'Relatórios multi-unidade',
    ],
  },
];

export interface BillingData {
  planId: string;
  billingType: 'pix' | 'boleto' | 'credit_card';
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  cardToken?: string;
}

export type AsaasSubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';

// ============================================================
// Régua de cobrança — status de billing com tolerância gradual
// ============================================================

export type SubscriptionBillingStatus =
  | 'trial'        // período de teste
  | 'active'       // plano ativo, pagamento em dia
  | 'grace'        // venceu, tolerância (0-3 dias)
  | 'warning'      // aviso enviado, faltam dias pro bloqueio (3-5 dias)
  | 'suspended'    // acesso limitado (read-only parcial) (5-15 dias)
  | 'blocked'      // acesso totalmente bloqueado (15+ dias)
  | 'cancelled'    // cancelado pelo dono
  | 'manual_free'; // liberado manualmente pelo SuperAdmin (cortesia)

export const BILLING_STATUS_CONFIG: Record<SubscriptionBillingStatus, {
  label: string;
  color: string;
  bg: string;
  canAccess: boolean;
  readOnly: boolean;
}> = {
  trial:        { label: 'Trial',             color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  canAccess: true,  readOnly: false },
  active:       { label: 'Ativo',             color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   canAccess: true,  readOnly: false },
  grace:        { label: 'Tolerância',        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  canAccess: true,  readOnly: false },
  warning:      { label: 'Aviso',             color: '#F97316', bg: 'rgba(249,115,22,0.12)',  canAccess: true,  readOnly: false },
  suspended:    { label: 'Suspenso',          color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   canAccess: true,  readOnly: true  },
  blocked:      { label: 'Bloqueado',         color: '#DC2626', bg: 'rgba(220,38,38,0.15)',   canAccess: false, readOnly: true  },
  cancelled:    { label: 'Cancelado',         color: '#6B7280', bg: 'rgba(107,114,128,0.12)', canAccess: false, readOnly: true  },
  manual_free:  { label: 'Cortesia',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  canAccess: true,  readOnly: false },
};

/** Compute billing status from days overdue */
export function computeBillingStatus(
  currentStatus: string,
  daysOverdue: number,
): SubscriptionBillingStatus {
  if (currentStatus === 'manual_free') return 'manual_free';
  if (currentStatus === 'trial') return 'trial';
  if (currentStatus === 'cancelled') return 'cancelled';

  if (daysOverdue <= 0) return 'active';
  if (daysOverdue <= 3) return 'grace';
  if (daysOverdue <= 5) return 'warning';
  if (daysOverdue <= 15) return 'suspended';
  return 'blocked';
}

export function getPlan(planId: string): AsaasPlan | undefined {
  return PLANS.find(p => p.id === planId);
}

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function getTrialDaysRemaining(trialEndsAt: string | Date): number {
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(trialEndsAt: string | Date): boolean {
  return getTrialDaysRemaining(trialEndsAt) === 0;
}
