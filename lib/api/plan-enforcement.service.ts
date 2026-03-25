import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_plans')
      .select('plan_tier')
      .eq('academy_id', academyId)
      .single();

    if (error || !data) {
      console.error('[checkLimit] Supabase error:', error?.message);
      return { allowed: true, current: 0, limit: null, plan: 'free', resource };
    }

    const plan = (data.plan_tier ?? 'free') as PlanTier;
    const limit = PLAN_LIMITS[resource][plan];

    return {
      allowed: typeof limit === 'boolean' ? limit : true,
      current: 0,
      limit: typeof limit === 'number' ? limit : null,
      plan,
      resource,
    };
  } catch (error) {
    console.error('[checkLimit] Fallback:', error);
    return { allowed: true, current: 0, limit: null, plan: 'free', resource };
  }
}

export async function getUsage(academyId: string): Promise<UsageData> {
  try {
    if (isMock()) {
      const { mockGetUsage } = await import('@/lib/mocks/plan-enforcement.mock');
      return mockGetUsage(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_usage')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (error || !data) {
      console.error('[getUsage] Supabase error:', error?.message);
      return { plan: 'free', students_active: 0, units: 0, classes: 0, usage_percent: 0 };
    }

    return data as unknown as UsageData;
  } catch (error) {
    console.error('[getUsage] Fallback:', error);
    return { plan: 'free', students_active: 0, units: 0, classes: 0, usage_percent: 0 };
  }
}

export function getLimit(plan: PlanTier, resource: PlanResource): number | boolean {
  return PLAN_LIMITS[resource][plan];
}

export function getLimitLabel(plan: PlanTier, resource: PlanResource): string {
  const limit = PLAN_LIMITS[resource][plan];
  if (typeof limit === 'boolean') return limit ? 'Incluido' : 'Nao disponivel';
  if (limit === Infinity) return 'Ilimitado';
  return String(limit);
}

export { PLAN_LIMITS };
