import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export type PlanTier = 'free' | 'pro' | 'enterprise';

export type PlanResource =
  | 'students_active'
  | 'units'
  | 'classes'
  | 'reports'
  | 'automations'
  | 'content'
  | 'api_access'
  | 'white_label'
  | 'custom_domain';

interface PlanLimit {
  type: 'numeric' | 'boolean';
  free: number | boolean;
  pro: number | boolean;
  enterprise: number | boolean;
}

const PLAN_LIMITS: Record<PlanResource, PlanLimit> = {
  students_active: { type: 'numeric', free: 30, pro: 200, enterprise: Infinity },
  units: { type: 'numeric', free: 1, pro: 3, enterprise: Infinity },
  classes: { type: 'numeric', free: 3, pro: Infinity, enterprise: Infinity },
  reports: { type: 'boolean', free: false, pro: true, enterprise: true },
  automations: { type: 'boolean', free: false, pro: true, enterprise: true },
  content: { type: 'boolean', free: false, pro: true, enterprise: true },
  api_access: { type: 'boolean', free: false, pro: false, enterprise: true },
  white_label: { type: 'boolean', free: false, pro: false, enterprise: true },
  custom_domain: { type: 'boolean', free: false, pro: false, enterprise: true },
};

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: PlanTier;
  resource: PlanResource;
}

export interface UsageData {
  plan: PlanTier;
  students_active: number;
  units: number;
  classes: number;
  usage_percent: number;
}

export async function checkLimit(
  academyId: string,
  resource: PlanResource,
): Promise<LimitCheckResult> {
  try {
    if (isMock()) {
      const { mockCheckLimit } = await import('@/lib/mocks/plan-enforcement.mock');
      return mockCheckLimit(academyId, resource);
    }
    try {
      const res = await fetch(`/api/plan-enforcement/check?academyId=${academyId}&resource=${resource}`);
      return res.json();
    } catch {
      console.warn('[plan-enforcement.checkLimit] API not available, using mock fallback');
      const { mockCheckLimit } = await import('@/lib/mocks/plan-enforcement.mock');
      return mockCheckLimit(academyId, resource);
    }

  } catch (error) {
    handleServiceError(error, 'plan-enforcement.checkLimit');
  }
}

export async function getUsage(academyId: string): Promise<UsageData> {
  try {
    if (isMock()) {
      const { mockGetUsage } = await import('@/lib/mocks/plan-enforcement.mock');
      return mockGetUsage(academyId);
    }
    try {
      const res = await fetch(`/api/plan-enforcement/usage?academyId=${academyId}`);
      return res.json();
    } catch {
      console.warn('[plan-enforcement.getUsage] API not available, using mock fallback');
      const { mockGetUsage } = await import('@/lib/mocks/plan-enforcement.mock');
      return mockGetUsage(academyId);
    }
  } catch (error) {
    handleServiceError(error, 'plan-enforcement.getUsage');
  }
}

export function getLimit(plan: PlanTier, resource: PlanResource): number | boolean {
  return PLAN_LIMITS[resource][plan];
}

export function getLimitLabel(plan: PlanTier, resource: PlanResource): string {
  const limit = PLAN_LIMITS[resource][plan];
  if (typeof limit === 'boolean') return limit ? 'Incluído' : 'Não disponível';
  if (limit === Infinity) return 'Ilimitado';
  return String(limit);
}

export { PLAN_LIMITS };
