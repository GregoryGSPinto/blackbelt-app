import { isMock } from '@/lib/env';
import type { Plan, PlanInterval } from '@/lib/types';

export interface CreatePlanRequest {
  name: string;
  price: number;
  interval: PlanInterval;
  features: string[];
}

export interface UpdatePlanRequest {
  name?: string;
  price?: number;
  features?: string[];
}

export async function listPlans(academyId: string): Promise<Plan[]> {
  try {
    if (isMock()) {
      const { mockListPlans } = await import('@/lib/mocks/planos.mock');
      return mockListPlans(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('academy_id', academyId)
      .order('price', { ascending: true });
    if (error || !data) {
      console.warn('[listPlans] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as Plan[];
  } catch (error) {
    console.warn('[listPlans] Fallback:', error);
    return [];
  }
}

export async function getPlanById(id: string): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockGetPlanById } = await import('@/lib/mocks/planos.mock');
      return mockGetPlanById(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.warn('[getPlanById] Supabase error:', error?.message);
      return {} as Plan;
    }
    return data as unknown as Plan;
  } catch (error) {
    console.warn('[getPlanById] Fallback:', error);
    return {} as Plan;
  }
}

export async function createPlan(academyId: string, data: CreatePlanRequest): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockCreatePlan } = await import('@/lib/mocks/planos.mock');
      return mockCreatePlan(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('plans')
      .insert({ ...data, academy_id: academyId })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createPlan] Supabase error:', error?.message);
      return {} as Plan;
    }
    return row as unknown as Plan;
  } catch (error) {
    console.warn('[createPlan] Fallback:', error);
    return {} as Plan;
  }
}

export async function updatePlan(id: string, data: UpdatePlanRequest): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockUpdatePlan } = await import('@/lib/mocks/planos.mock');
      return mockUpdatePlan(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('plans')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updatePlan] Supabase error:', error?.message);
      return {} as Plan;
    }
    return row as unknown as Plan;
  } catch (error) {
    console.warn('[updatePlan] Fallback:', error);
    return {} as Plan;
  }
}
