import { isMock } from '@/lib/env';
import { handleServiceError, logServiceError } from '@/lib/api/errors';
import type { Plan, PlanFormData, PlanTier } from '@/lib/types/plan';

export async function getPlans(): Promise<Plan[]> {
  try {
    if (isMock()) {
      const { mockGetPlans } = await import('@/lib/mocks/plans.mock');
      return mockGetPlans();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('platform_plans').select('*').order('sort_order');
    if (error) throw error;
    return (data ?? []) as unknown as Plan[];
  } catch (error) {
    logServiceError(error, 'plans.getPlans');
    return [];
  }
}

export async function getActivePlans(): Promise<Plan[]> {
  try {
    if (isMock()) {
      const { mockGetActivePlans } = await import('@/lib/mocks/plans.mock');
      return mockGetActivePlans();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('platform_plans').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    return (data ?? []) as unknown as Plan[];
  } catch (error) {
    logServiceError(error, 'plans.getActivePlans');
    return [];
  }
}

export async function getPlanById(id: string): Promise<Plan | null> {
  try {
    if (isMock()) {
      const { mockGetPlanById } = await import('@/lib/mocks/plans.mock');
      return mockGetPlanById(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('platform_plans').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as Plan | null;
  } catch (error) {
    logServiceError(error, 'plans.getPlanById');
    return null;
  }
}

export async function getPlanByTier(tier: PlanTier): Promise<Plan | null> {
  try {
    if (isMock()) {
      const { mockGetPlanByTier } = await import('@/lib/mocks/plans.mock');
      return mockGetPlanByTier(tier);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('platform_plans').select('*').eq('tier', tier).maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as Plan | null;
  } catch (error) {
    logServiceError(error, 'plans.getPlanByTier');
    return null;
  }
}

export async function createPlan(formData: PlanFormData): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockCreatePlan } = await import('@/lib/mocks/plans.mock');
      return mockCreatePlan(formData);
    }
    const res = await fetch('/api/v1/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'plans.createPlan');
  }
}

export async function updatePlan(id: string, data: Partial<PlanFormData>): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockUpdatePlan } = await import('@/lib/mocks/plans.mock');
      return mockUpdatePlan(id, data);
    }
    const res = await fetch(`/api/v1/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'plans.updatePlan');
  }
}

export async function togglePlanActive(id: string): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockTogglePlanActive } = await import('@/lib/mocks/plans.mock');
      return mockTogglePlanActive(id);
    }
    const res = await fetch(`/api/v1/plans/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'plans.togglePlanActive');
  }
}

export async function deletePlan(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeletePlan } = await import('@/lib/mocks/plans.mock');
      return mockDeletePlan(id);
    }
    const res = await fetch(`/api/v1/plans/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'plans.deletePlan');
  }
}

export async function getAcademyCountByPlan(): Promise<Record<string, number>> {
  try {
    if (isMock()) {
      const { mockGetAcademyCountByPlan } = await import('@/lib/mocks/plans.mock');
      return mockGetAcademyCountByPlan();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('get_academy_count_by_plan');
    if (error) throw error;
    return (data ?? {}) as Record<string, number>;
  } catch (error) {
    logServiceError(error, 'plans.getAcademyCountByPlan');
    return {};
  }
}
