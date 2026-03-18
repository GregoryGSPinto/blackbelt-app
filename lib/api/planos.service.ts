import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    // API not yet implemented — use mock
    const { mockListPlans } = await import('@/lib/mocks/planos.mock');
      return mockListPlans(academyId);
  } catch (error) {
    handleServiceError(error, 'planos.list');
  }
}

export async function getPlanById(id: string): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockGetPlanById } = await import('@/lib/mocks/planos.mock');
      return mockGetPlanById(id);
    }
    // API not yet implemented — use mock
    const { mockGetPlanById } = await import('@/lib/mocks/planos.mock');
      return mockGetPlanById(id);
  } catch (error) {
    handleServiceError(error, 'planos.get');
  }
}

export async function createPlan(academyId: string, data: CreatePlanRequest): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockCreatePlan } = await import('@/lib/mocks/planos.mock');
      return mockCreatePlan(academyId, data);
    }
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, academy_id: academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'planos.create');
      return res.json();
    } catch {
      console.warn('[planos.createPlan] API not available, using mock fallback');
      const { mockCreatePlan } = await import('@/lib/mocks/planos.mock');
      return mockCreatePlan(academyId, data);
    }
  } catch (error) {
    handleServiceError(error, 'planos.create');
  }
}

export async function updatePlan(id: string, data: UpdatePlanRequest): Promise<Plan> {
  try {
    if (isMock()) {
      const { mockUpdatePlan } = await import('@/lib/mocks/planos.mock');
      return mockUpdatePlan(id, data);
    }
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'planos.update');
      return res.json();
    } catch {
      console.warn('[planos.updatePlan] API not available, using mock fallback');
      const { mockUpdatePlan } = await import('@/lib/mocks/planos.mock');
      return mockUpdatePlan(id, data);
    }
  } catch (error) {
    handleServiceError(error, 'planos.update');
  }
}
