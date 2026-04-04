import { PlanInterval } from '@/lib/types';
import type { Plan } from '@/lib/types';
import type { CreatePlanRequest, UpdatePlanRequest } from '@/lib/api/planos.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-mensal',
    academy_id: 'academy-1',
    name: 'Mensal',
    price: 150,
    interval: PlanInterval.Monthly,
    features: ['Acesso a todas as aulas', 'Conteúdo online', 'Check-in via QR Code'],
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
  },
  {
    id: 'plan-trimestral',
    academy_id: 'academy-1',
    name: 'Trimestral',
    price: 400,
    interval: PlanInterval.Quarterly,
    features: ['Acesso a todas as aulas', 'Conteúdo online', 'Check-in via QR Code', '11% de desconto'],
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
  },
  {
    id: 'plan-anual',
    academy_id: 'academy-1',
    name: 'Anual',
    price: 1400,
    interval: PlanInterval.Yearly,
    features: ['Acesso a todas as aulas', 'Conteúdo online', 'Check-in via QR Code', '22% de desconto', 'Kimono grátis'],
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
  },
];

export async function mockListPlans(_academyId: string): Promise<Plan[]> {
  await delay();
  return MOCK_PLANS;
}

export async function mockGetPlanById(id: string): Promise<Plan> {
  await delay();
  const plan = MOCK_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error('Plan not found');
  return plan;
}

export async function mockCreatePlan(academyId: string, data: CreatePlanRequest): Promise<Plan> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `plan-${Date.now()}`,
    academy_id: academyId,
    name: data.name,
    price: data.price,
    interval: data.interval,
    features: data.features,
    created_at: now,
    updated_at: now,
  };
}

export async function mockUpdatePlan(id: string, data: UpdatePlanRequest): Promise<Plan> {
  await delay();
  const plan = MOCK_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error('Plan not found');
  return { ...plan, ...data, updated_at: new Date().toISOString() };
}

export { MOCK_PLANS };
