export type PlanTier = 'starter' | 'essencial' | 'pro' | 'blackbelt' | 'enterprise';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface PlanLimits {
  max_alunos: number | null;
  max_professores: number | null;
  max_unidades: number | null;
  max_storage_gb: number;
  max_turmas: number | null;
}

export interface PlanOverageRates {
  aluno_extra: number;
  professor_extra: number;
  unidade_extra: number;
  storage_extra_gb: number;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  price_monthly: number;
  price_display: string;
  is_custom_price: boolean;
  limits: PlanLimits;
  overage_rates: PlanOverageRates;
  features: PlanFeature[];
  is_popular: boolean;
  is_active: boolean;
  trial_days: number;
  trial_tier: PlanTier;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFormData {
  name: string;
  tier: PlanTier;
  price_monthly: number;
  is_custom_price: boolean;
  limits: PlanLimits;
  overage_rates: PlanOverageRates;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  trial_days: number;
}
