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
      'Check-in por QR Code',
      'Financeiro básico',
      'Agenda de aulas',
      'Notificações',
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
      'Biblioteca de vídeos',
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
      'Contratos digitais',
      'Estoque',
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
