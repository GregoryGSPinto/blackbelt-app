import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
  const fallback = { id: '', name: '', price: 0, limits: { units: 0, students: 0, classes: 0, reports: false, automations: false, whiteLabel: false, api: false } } as PlatformPlan;
  try {
    if (isMock()) {
      const { mockGetCurrentPlan } = await import('@/lib/mocks/platform-plans.mock');
      return mockGetCurrentPlan(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_platform_plans')
      .select('*, platform_plans(*)')
      .eq('academy_id', academyId)
      .single();
    if (error || !data) {
      logServiceError(error, 'platform-plans');
      return fallback;
    }
    return (data.platform_plans ?? fallback) as unknown as PlatformPlan;
  } catch (error) {
    logServiceError(error, 'platform-plans');
    return fallback;
  }
}

export async function getUsage(academyId: string): Promise<UsageDTO> {
  const fallback: UsageDTO = { units: { current: 0, limit: 0 }, students: { current: 0, limit: 0 }, classes: { current: 0, limit: 0 }, plan: { id: '', name: '', price: 0, limits: { units: 0, students: 0, classes: 0, reports: false, automations: false, whiteLabel: false, api: false } } };
  try {
    if (isMock()) {
      const { mockGetUsage } = await import('@/lib/mocks/platform-plans.mock');
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
      logServiceError(error, 'platform-plans');
      return fallback;
    }
    return data as unknown as UsageDTO;
  } catch (error) {
    logServiceError(error, 'platform-plans');
    return fallback;
  }
}

export async function checkLimit(academyId: string, resource: 'units' | 'students' | 'classes'): Promise<LimitCheck> {
  const fallback: LimitCheck = { allowed: false, current: 0, limit: 0 };
  try {
    if (isMock()) {
      const { mockCheckLimit } = await import('@/lib/mocks/platform-plans.mock');
      return mockCheckLimit(academyId, resource);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('check_platform_limit', { p_academy_id: academyId, p_resource: resource });
    if (error || !data) {
      logServiceError(error, 'platform-plans');
      return fallback;
    }
    return data as unknown as LimitCheck;
  } catch (error) {
    logServiceError(error, 'platform-plans');
    return fallback;
  }
}

export const PLATFORM_PLANS: PlatformPlan[] = [
  { id: 'starter', name: 'Starter', price: 97, limits: { units: 1, students: 50, classes: 10, reports: false, automations: false, whiteLabel: false, api: false } },
  { id: 'essencial', name: 'Essencial', price: 197, limits: { units: 1, students: 100, classes: 20, reports: true, automations: false, whiteLabel: false, api: false } },
  { id: 'pro', name: 'Pro', price: 347, limits: { units: 2, students: 200, classes: 9999, reports: true, automations: true, whiteLabel: false, api: false } },
  { id: 'blackbelt', name: 'Black Belt', price: 597, limits: { units: 9999, students: 9999, classes: 9999, reports: true, automations: true, whiteLabel: true, api: true } },
  { id: 'enterprise', name: 'Enterprise', price: 0, limits: { units: 9999, students: 9999, classes: 9999, reports: true, automations: true, whiteLabel: true, api: true } },
];
