import type { Plan, PlanFormData } from '@/lib/types/plan';
import { ALL_FEATURES } from '@/lib/constants/plan-features';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

function buildFeatures(featureIds: string[]) {
  return ALL_FEATURES.map((f) => ({
    id: f.id,
    name: f.name,
    description: '',
    included: featureIds.includes(f.id),
  }));
}

const STARTER_FEATURES = [
  'gestao_alunos', 'checkin', 'financeiro_basico', 'agenda', 'notificacoes', 'biblioteca_videos',
];

const ESSENCIAL_FEATURES = [
  ...STARTER_FEATURES,
  'streaming_library', 'certificados_digitais', 'relatorios_avancados', 'comunicacao_responsaveis', 'app_aluno',
];

const PRO_FEATURES = [
  ...ESSENCIAL_FEATURES,
  'compete', 'gamificacao_teen', 'curriculo_tecnico', 'match_analysis', 'estoque', 'contratos_digitais',
];

const BLACKBELT_FEATURES = [
  ...PRO_FEATURES,
  'franqueador', 'white_label', 'api_access', 'suporte_prioritario', 'relatorios_multi_unidade',
];

const ENTERPRISE_FEATURES = [
  ...BLACKBELT_FEATURES,
  'sla_dedicado', 'onboarding_assistido', 'customizacoes', 'integracao_legados',
];

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    tier: 'starter',
    name: 'Starter',
    price_monthly: 7900,
    price_display: 'R$ 79/mês',
    is_custom_price: false,
    limits: { max_alunos: 50, max_professores: 2, max_unidades: 1, max_storage_gb: 5, max_turmas: 10 },
    overage_rates: { aluno_extra: 300, professor_extra: 1500, unidade_extra: 4900, storage_extra_gb: 50 },
    features: buildFeatures(STARTER_FEATURES),
    is_popular: false,
    is_active: true,
    trial_days: 7,
    trial_tier: 'blackbelt',
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'plan-essencial',
    tier: 'essencial',
    name: 'Essencial',
    price_monthly: 14900,
    price_display: 'R$ 149/mês',
    is_custom_price: false,
    limits: { max_alunos: 100, max_professores: 5, max_unidades: 1, max_storage_gb: 10, max_turmas: 20 },
    overage_rates: { aluno_extra: 300, professor_extra: 1500, unidade_extra: 4900, storage_extra_gb: 50 },
    features: buildFeatures(ESSENCIAL_FEATURES),
    is_popular: false,
    is_active: true,
    trial_days: 7,
    trial_tier: 'blackbelt',
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'plan-pro',
    tier: 'pro',
    name: 'Pro',
    price_monthly: 24900,
    price_display: 'R$ 249/mês',
    is_custom_price: false,
    limits: { max_alunos: 200, max_professores: null, max_unidades: 2, max_storage_gb: 20, max_turmas: null },
    overage_rates: { aluno_extra: 300, professor_extra: 1500, unidade_extra: 4900, storage_extra_gb: 50 },
    features: buildFeatures(PRO_FEATURES),
    is_popular: true,
    is_active: true,
    trial_days: 7,
    trial_tier: 'blackbelt',
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'plan-blackbelt',
    tier: 'blackbelt',
    name: 'Black Belt',
    price_monthly: 39700,
    price_display: 'R$ 397/mês',
    is_custom_price: false,
    limits: { max_alunos: null, max_professores: null, max_unidades: null, max_storage_gb: 50, max_turmas: null },
    overage_rates: { aluno_extra: 300, professor_extra: 1500, unidade_extra: 4900, storage_extra_gb: 50 },
    features: buildFeatures(BLACKBELT_FEATURES),
    is_popular: false,
    is_active: true,
    trial_days: 7,
    trial_tier: 'blackbelt',
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    price_monthly: 0,
    price_display: 'Sob consulta',
    is_custom_price: true,
    limits: { max_alunos: null, max_professores: null, max_unidades: null, max_storage_gb: 100, max_turmas: null },
    overage_rates: { aluno_extra: 0, professor_extra: 0, unidade_extra: 0, storage_extra_gb: 0 },
    features: buildFeatures(ENTERPRISE_FEATURES),
    is_popular: false,
    is_active: true,
    trial_days: 7,
    trial_tier: 'blackbelt',
    sort_order: 5,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Mock academy count per plan
const MOCK_ACADEMY_COUNT: Record<string, number> = {
  'plan-starter': 12,
  'plan-essencial': 23,
  'plan-pro': 31,
  'plan-blackbelt': 8,
  'plan-enterprise': 2,
};

const plans = MOCK_PLANS.map((p) => ({ ...p }));

export async function mockGetPlans(): Promise<Plan[]> {
  await delay();
  return plans.map((p) => ({ ...p })).sort((a, b) => a.sort_order - b.sort_order);
}

export async function mockGetActivePlans(): Promise<Plan[]> {
  await delay();
  return plans.filter((p) => p.is_active).map((p) => ({ ...p })).sort((a, b) => a.sort_order - b.sort_order);
}

export async function mockGetPlanById(id: string): Promise<Plan | null> {
  await delay();
  const p = plans.find((pl) => pl.id === id);
  return p ? { ...p } : null;
}

export async function mockGetPlanByTier(tier: string): Promise<Plan | null> {
  await delay();
  const p = plans.find((pl) => pl.tier === tier);
  return p ? { ...p } : null;
}

export async function mockCreatePlan(data: PlanFormData): Promise<Plan> {
  await delay();
  const newPlan: Plan = {
    id: `plan-${Date.now()}`,
    tier: data.tier,
    name: data.name,
    price_monthly: data.price_monthly,
    price_display: data.is_custom_price ? 'Sob consulta' : `R$ ${(data.price_monthly / 100).toFixed(0)}/mês`,
    is_custom_price: data.is_custom_price,
    limits: { ...data.limits },
    overage_rates: { ...data.overage_rates },
    features: buildFeatures(data.features),
    is_popular: data.is_popular,
    is_active: data.is_active,
    trial_days: data.trial_days,
    trial_tier: 'blackbelt',
    sort_order: plans.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  plans.push(newPlan);
  return { ...newPlan };
}

export async function mockUpdatePlan(id: string, data: Partial<PlanFormData>): Promise<Plan> {
  await delay();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Plano não encontrado');
  const current = plans[idx];
  const updated: Plan = {
    ...current,
    name: data.name ?? current.name,
    tier: data.tier ?? current.tier,
    price_monthly: data.price_monthly ?? current.price_monthly,
    is_custom_price: data.is_custom_price ?? current.is_custom_price,
    limits: data.limits ? { ...data.limits } : current.limits,
    overage_rates: data.overage_rates ? { ...data.overage_rates } : current.overage_rates,
    features: data.features ? buildFeatures(data.features) : current.features,
    is_popular: data.is_popular ?? current.is_popular,
    is_active: data.is_active ?? current.is_active,
    trial_days: data.trial_days ?? current.trial_days,
    updated_at: new Date().toISOString(),
  };
  updated.price_display = updated.is_custom_price ? 'Sob consulta' : `R$ ${(updated.price_monthly / 100).toFixed(0)}/mês`;
  plans[idx] = updated;
  return { ...updated };
}

export async function mockTogglePlanActive(id: string): Promise<Plan> {
  await delay();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Plano não encontrado');
  plans[idx] = { ...plans[idx], is_active: !plans[idx].is_active, updated_at: new Date().toISOString() };
  return { ...plans[idx] };
}

export async function mockDeletePlan(id: string): Promise<void> {
  await delay();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Plano não encontrado');
  plans[idx] = { ...plans[idx], is_active: false, updated_at: new Date().toISOString() };
}

export async function mockGetAcademyCountByPlan(): Promise<Record<string, number>> {
  await delay();
  return { ...MOCK_ACADEMY_COUNT };
}
