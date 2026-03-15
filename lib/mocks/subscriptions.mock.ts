import { SubscriptionStatus } from '@/lib/types';
import type { Subscription } from '@/lib/types';
import type { SubscriptionWithPlan } from '@/lib/api/subscriptions.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const STUDENT_NAMES = [
  'Lucas Silva', 'Pedro Santos', 'Ana Oliveira', 'Mariana Costa', 'Bruno Ferreira',
  'Gabriel Souza', 'Juliana Lima', 'Rafael Pereira', 'Camila Rodrigues', 'Diego Almeida',
  'Fernanda Martins', 'Thiago Ribeiro', 'Larissa Araújo', 'Mateus Barbosa', 'Isabela Gomes',
  'Vinícius Carvalho', 'Natália Melo', 'Felipe Rocha', 'Beatriz Nunes', 'Gustavo Castro',
  'Amanda Cardoso', 'Leonardo Teixeira', 'Carolina Correia', 'Rodrigo Dias', 'Letícia Monteiro',
  'Eduardo Vieira', 'Patrícia Campos', 'André Reis', 'Daniela Moreira', 'Lucas Pinto',
  'Maria Clara', 'João Pedro', 'Ana Beatriz', 'Marcos Vinicius', 'Julia Mendes',
  'Caio Ramos', 'Sofia Torres', 'Arthur Nogueira', 'Helena Duarte', 'Enzo Moura',
  'Valentina Freitas', 'Miguel Lopes', 'Laura Azevedo', 'Davi Borges', 'Alice Peixoto',
  'Bernardo Andrade', 'Heloísa Cunha', 'Noah Sampaio', 'Luana Farias', 'Samuel Aguiar',
];

const PLAN_MAP: Record<string, { name: string; price: number; interval: string }> = {
  'plan-mensal': { name: 'Mensal', price: 150, interval: 'monthly' },
  'plan-trimestral': { name: 'Trimestral', price: 400, interval: 'quarterly' },
  'plan-anual': { name: 'Anual', price: 1400, interval: 'yearly' },
};

function generateSubscriptions(): Array<SubscriptionWithPlan & { student_name: string; student_id: string }> {
  const plans = ['plan-mensal', 'plan-mensal', 'plan-mensal', 'plan-trimestral', 'plan-trimestral', 'plan-anual'];
  return STUDENT_NAMES.map((name, i) => {
    const planId = plans[i % plans.length];
    const plan = PLAN_MAP[planId];
    const status = i < 42 ? SubscriptionStatus.Active : i < 46 ? SubscriptionStatus.PastDue : SubscriptionStatus.Cancelled;
    const periodEnd = new Date(2026, 3 + (i % 3), 15).toISOString();
    return {
      id: `sub-${i + 1}`,
      student_id: `student-${i + 1}`,
      student_name: name,
      plan_id: planId,
      plan_name: plan.name,
      plan_price: plan.price,
      plan_interval: plan.interval,
      status,
      current_period_end: periodEnd,
      created_at: '2025-09-01',
      updated_at: '2026-03-01',
    };
  });
}

const MOCK_SUBSCRIPTIONS = generateSubscriptions();

export async function mockGetSubscriptionByStudent(studentId: string): Promise<SubscriptionWithPlan> {
  await delay();
  const sub = MOCK_SUBSCRIPTIONS.find((s) => s.student_id === studentId);
  if (!sub) throw new Error('Subscription not found');
  return sub;
}

export async function mockCreateSubscription(studentId: string, planId: string): Promise<Subscription> {
  await delay();
  const now = new Date().toISOString();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return {
    id: `sub-new-${Date.now()}`,
    student_id: studentId,
    plan_id: planId,
    status: SubscriptionStatus.Active,
    current_period_end: periodEnd.toISOString(),
    created_at: now,
    updated_at: now,
  };
}

export async function mockCancelSubscription(_subscriptionId: string): Promise<void> {
  await delay();
}

export async function mockChangePlan(_subscriptionId: string, _newPlanId: string): Promise<Subscription> {
  await delay();
  const now = new Date().toISOString();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return {
    id: _subscriptionId,
    student_id: 'student-1',
    plan_id: _newPlanId,
    status: SubscriptionStatus.Active,
    current_period_end: periodEnd.toISOString(),
    created_at: '2025-09-01',
    updated_at: now,
  };
}

export { MOCK_SUBSCRIPTIONS };
