import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  limits: { units: number; students: number; classes: number; reports: boolean; automations: boolean; whiteLabel: boolean; api: boolean };
}

export interface UsageDTO {
  units: { current: number; limit: number };
  students: { current: number; limit: number };
  classes: { current: number; limit: number };
  plan: PlatformPlan;
}

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
}

export async function getCurrentPlan(academyId: string): Promise<PlatformPlan> {
  try {
    if (isMock()) {
      const { mockGetCurrentPlan } = await import('@/lib/mocks/platform-plans.mock');
      return mockGetCurrentPlan(academyId);
    }
    try {
      const res = await fetch(`/api/platform/plan?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'platformPlans.current');
      return res.json();
    } catch {
      console.warn('[platform-plans.getCurrentPlan] API not available, using fallback');
      return { id: "", name: "", price: 0, features: [], limits: {}, popular: false } as unknown as PlatformPlan;
    }
  } catch (error) { handleServiceError(error, 'platformPlans.current'); }
}

export async function getUsage(academyId: string): Promise<UsageDTO> {
  try {
    if (isMock()) {
      const { mockGetUsage } = await import('@/lib/mocks/platform-plans.mock');
      return mockGetUsage(academyId);
    }
    try {
      const res = await fetch(`/api/platform/usage?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'platformPlans.usage');
      return res.json();
    } catch {
      console.warn('[platform-plans.getUsage] API not available, using mock fallback');
      const { mockGetUsage } = await import('@/lib/mocks/platform-plans.mock');
      return mockGetUsage(academyId);
    }
  } catch (error) { handleServiceError(error, 'platformPlans.usage'); }
}

export async function checkLimit(academyId: string, resource: 'units' | 'students' | 'classes'): Promise<LimitCheck> {
  try {
    if (isMock()) {
      const { mockCheckLimit } = await import('@/lib/mocks/platform-plans.mock');
      return mockCheckLimit(academyId, resource);
    }
    try {
      const res = await fetch(`/api/platform/check-limit?academyId=${academyId}&resource=${resource}`);
      if (!res.ok) throw new ServiceError(res.status, 'platformPlans.checkLimit');
      return res.json();
    } catch {
      console.warn('[platform-plans.checkLimit] API not available, using mock fallback');
      const { mockCheckLimit } = await import('@/lib/mocks/platform-plans.mock');
      return mockCheckLimit(academyId, resource);
    }
  } catch (error) { handleServiceError(error, 'platformPlans.checkLimit'); }
}

export const PLATFORM_PLANS: PlatformPlan[] = [
  { id: 'free', name: 'Free', price: 0, limits: { units: 1, students: 30, classes: 3, reports: false, automations: false, whiteLabel: false, api: false } },
  { id: 'pro', name: 'Pro', price: 199, limits: { units: 3, students: 200, classes: 9999, reports: true, automations: true, whiteLabel: false, api: false } },
  { id: 'enterprise', name: 'Enterprise', price: 499, limits: { units: 9999, students: 9999, classes: 9999, reports: true, automations: true, whiteLabel: true, api: true } },
];
