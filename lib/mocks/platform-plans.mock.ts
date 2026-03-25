import type { PlatformPlan, UsageDTO, LimitCheck } from '@/lib/api/platform-plans.service';
import { PLATFORM_PLANS } from '@/lib/api/platform-plans.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

export async function mockGetCurrentPlan(_academyId: string): Promise<PlatformPlan> {
  await delay();
  return PLATFORM_PLANS[2]; // Pro
}

export async function mockGetUsage(_academyId: string): Promise<UsageDTO> {
  await delay();
  const plan = PLATFORM_PLANS[2];
  return {
    units: { current: 1, limit: plan.limits.units },
    students: { current: 48, limit: plan.limits.students },
    classes: { current: 6, limit: plan.limits.classes },
    plan,
  };
}

export async function mockCheckLimit(_academyId: string, resource: 'units' | 'students' | 'classes'): Promise<LimitCheck> {
  await delay();
  const usage = { units: { current: 1, limit: 3 }, students: { current: 48, limit: 200 }, classes: { current: 6, limit: 9999 } };
  const r = usage[resource];
  return { allowed: r.current < r.limit, current: r.current, limit: r.limit };
}
