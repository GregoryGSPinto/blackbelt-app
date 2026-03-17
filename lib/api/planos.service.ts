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
    try {
      const res = await fetch(`/api/plans?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'planos.list');
      return res.json();
    } catch {
      console.warn('[planos.listPlans] API not available, using fallback');
      return [];
    }
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
    try {
      const res = await fetch(`/api/plans/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'planos.get');
      return res.json();
    } catch {
      console.warn('[planos.getPlanById] API not available, using fallback');
      return {} as Plan;
    }
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
      console.warn('[planos.createPlan] API not available, using fallback');
      return {} as Plan;
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
      console.warn('[planos.updatePlan] API not available, using fallback');
      return {} as Plan;
    }
  } catch (error) {
    handleServiceError(error, 'planos.update');
  }
}
