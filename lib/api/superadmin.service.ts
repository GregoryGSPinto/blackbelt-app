import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import type {
  PlatformPlan,
  AcademyFull,
  OnboardToken,
  PlatformStats,
  CreateAcademyPayload,
  UpdateAcademyPayload,
  OnboardValidation,
} from '@/lib/types';

// ── Plans ────────────────────────────────────────────────────────────

export async function listPlans(): Promise<PlatformPlan[]> {
  if (isMock()) {
    const { mockListPlans } = await import('@/lib/mocks/superadmin.mock');
    return mockListPlans();
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('platform_plans')
    .select('*')
    .order('price_monthly', { ascending: true });
  if (error) {
    logServiceError(error, 'superadmin');
    return [];
  }
  return (data ?? []) as PlatformPlan[];
}

export async function getPlan(id: string): Promise<PlatformPlan | null> {
  if (isMock()) {
    const { mockGetPlan } = await import('@/lib/mocks/superadmin.mock');
    return mockGetPlan(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('platform_plans')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    logServiceError(error, 'superadmin');
    return null;
  }
  return (data ?? null) as PlatformPlan | null;
}

// ── Academies ────────────────────────────────────────────────────────

export async function listAcademies(
  filters?: { status?: string; search?: string; plan_id?: string },
): Promise<AcademyFull[]> {
  if (isMock()) {
    const { mockListAcademies } = await import('@/lib/mocks/superadmin.mock');
    return mockListAcademies(filters);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  let query = supabase
    .from('academies')
    .select('*, platform_plans(*)')
    .order('created_at', { ascending: false });
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.plan_id) {
    query = query.eq('plan_id', filters.plan_id);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  const { data, error } = await query;
  if (error) {
    logServiceError(error, 'superadmin');
    return [];
  }
  return (data ?? []) as AcademyFull[];
}

export async function getAcademy(id: string): Promise<AcademyFull | null> {
  if (isMock()) {
    const { mockGetAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockGetAcademy(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academies')
    .select('*, platform_plans(*)')
    .eq('id', id)
    .single();
  if (error) {
    logServiceError(error, 'superadmin');
    return null;
  }
  return (data ?? null) as AcademyFull | null;
}

export async function createAcademy(
  payload: CreateAcademyPayload,
): Promise<{ academy: AcademyFull; onboardToken: OnboardToken }> {
  if (isMock()) {
    const { mockCreateAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockCreateAcademy(payload);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const { data: academy, error: academyError } = await supabase
    .from('academies')
    .insert({
      name: payload.name,
      slug,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      city: payload.city ?? null,
      state: payload.state ?? null,
      plan_id: payload.plan_id,
      status: 'trial',
    })
    .select('*')
    .single();
  if (academyError || !academy) {
    throw new Error(`[createAcademy] Supabase error: ${academyError?.message}`);
  }
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (payload.trial_days ?? 14));
  const { data: onboardToken, error: tokenError } = await supabase
    .from('onboard_tokens')
    .insert({
      academy_id: academy.id,
      academy_name: payload.name,
      token,
      plan_id: payload.plan_id,
      trial_days: payload.trial_days ?? 14,
      max_uses: 1,
      current_uses: 0,
      expires_at: expiresAt.toISOString(),
      is_active: true,
      notes: payload.notes ?? null,
    })
    .select('*')
    .single();
  if (tokenError || !onboardToken) {
    logServiceError(tokenError, 'superadmin');
    return { academy: academy as AcademyFull, onboardToken: {} as OnboardToken };
  }
  return {
    academy: academy as AcademyFull,
    onboardToken: onboardToken as OnboardToken,
  };
}

export async function updateAcademy(
  id: string,
  updates: UpdateAcademyPayload,
): Promise<AcademyFull> {
  if (isMock()) {
    const { mockUpdateAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockUpdateAcademy(id, updates);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, platform_plans(*)')
    .single();
  if (error || !data) {
    throw new Error(`[updateAcademy] Supabase error: ${error?.message}`);
  }
  return data as AcademyFull;
}

export async function suspendAcademy(id: string): Promise<AcademyFull> {
  if (isMock()) {
    const { mockSuspendAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockSuspendAcademy(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academies')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, platform_plans(*)')
    .single();
  if (error || !data) {
    throw new Error(`[suspendAcademy] Supabase error: ${error?.message}`);
  }
  return data as AcademyFull;
}

export async function reactivateAcademy(id: string): Promise<AcademyFull> {
  if (isMock()) {
    const { mockReactivateAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockReactivateAcademy(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academies')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, platform_plans(*)')
    .single();
  if (error || !data) {
    throw new Error(`[reactivateAcademy] Supabase error: ${error?.message}`);
  }
  return data as AcademyFull;
}

// ── Subscription Management ──────────────────────────────────────────

export type SubscriptionAction = 'extend_trial' | 'activate' | 'suspend' | 'unblock';

export async function manageSubscription(
  academyId: string,
  action: SubscriptionAction,
  days?: number,
): Promise<AcademyFull> {
  if (isMock()) {
    const { mockGetAcademy } = await import('@/lib/mocks/superadmin.mock');
    return (await mockGetAcademy(academyId))!;
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  switch (action) {
    case 'extend_trial': {
      const extendDays = days ?? 7;
      // Update academy_subscriptions trial_ends_at
      const { data: sub } = await supabase
        .from('academy_subscriptions')
        .select('trial_ends_at')
        .eq('academy_id', academyId)
        .maybeSingle();

      const currentEnd = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : new Date();
      const baseDate = currentEnd > new Date() ? currentEnd : new Date();
      const newEnd = new Date(baseDate);
      newEnd.setDate(newEnd.getDate() + extendDays);

      await supabase
        .from('academy_subscriptions')
        .update({
          trial_ends_at: newEnd.toISOString(),
          status: 'trial',
          updated_at: new Date().toISOString(),
        })
        .eq('academy_id', academyId);

      // Also update academy status to trial
      const { data, error } = await supabase
        .from('academies')
        .update({
          status: 'trial',
          trial_ends_at: newEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', academyId)
        .select('*, platform_plans(*)')
        .single();

      if (error || !data) throw new Error(`[extendTrial] ${error?.message}`);
      return data as AcademyFull;
    }

    case 'activate': {
      await supabase
        .from('academy_subscriptions')
        .update({ status: 'full', updated_at: new Date().toISOString() })
        .eq('academy_id', academyId);

      const { data, error } = await supabase
        .from('academies')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', academyId)
        .select('*, platform_plans(*)')
        .single();

      if (error || !data) throw new Error(`[activate] ${error?.message}`);
      return data as AcademyFull;
    }

    case 'suspend': {
      await supabase
        .from('academy_subscriptions')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('academy_id', academyId);

      return suspendAcademy(academyId);
    }

    case 'unblock': {
      await supabase
        .from('academy_subscriptions')
        .update({ status: 'full', updated_at: new Date().toISOString() })
        .eq('academy_id', academyId);

      return reactivateAcademy(academyId);
    }

    default:
      throw new Error(`Acao desconhecida: ${action}`);
  }
}

// ── Onboard Tokens ───────────────────────────────────────────────────

export async function listOnboardTokens(
  filters?: { active?: boolean; search?: string },
): Promise<OnboardToken[]> {
  if (isMock()) {
    const { mockListOnboardTokens } = await import('@/lib/mocks/superadmin.mock');
    return mockListOnboardTokens(filters);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  let query = supabase
    .from('onboard_tokens')
    .select('*')
    .order('created_at', { ascending: false });
  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active);
  }
  if (filters?.search) {
    query = query.ilike('academy_name', `%${filters.search}%`);
  }
  const { data, error } = await query;
  if (error) {
    logServiceError(error, 'superadmin');
    return [];
  }
  return (data ?? []) as OnboardToken[];
}

export async function deactivateOnboardToken(id: string): Promise<OnboardToken> {
  if (isMock()) {
    const { mockDeactivateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
    return mockDeactivateOnboardToken(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('onboard_tokens')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(`[deactivateOnboardToken] Supabase error: ${error?.message}`);
  }
  return data as OnboardToken;
}

export async function validateOnboardToken(token: string): Promise<OnboardValidation> {
  if (isMock()) {
    const { mockValidateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
    return mockValidateOnboardToken(token);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('onboard_tokens')
    .select('*')
    .eq('token', token)
    .single();
  if (error || !data) {
    return { valid: false, error: 'not_found' };
  }
  const tkn = data as OnboardToken;
  if (!tkn.is_active) {
    return { valid: false, token: tkn, error: 'inactive' };
  }
  if (tkn.expires_at && new Date(tkn.expires_at) < new Date()) {
    return { valid: false, token: tkn, error: 'expired' };
  }
  if (tkn.current_uses >= tkn.max_uses) {
    return { valid: false, token: tkn, error: 'max_uses' };
  }
  return { valid: true, token: tkn };
}

export async function redeemOnboardToken(
  token: string,
  academyId: string,
  _profileId: string,
): Promise<void> {
  if (isMock()) {
    const { mockRedeemOnboardToken } = await import('@/lib/mocks/superadmin.mock');
    return mockRedeemOnboardToken(token, academyId, _profileId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('onboard_tokens')
    .update({ current_uses: 1, is_active: false })
    .eq('token', token);
  if (error) {
    throw new Error(`[redeemOnboardToken] Supabase error: ${error.message}`);
  }
}

// ── Signup Link (token-only, no academy) ─────────────────────────────

export async function generateSignupLink(opts: {
  notes?: string;
  expiresInDays?: number;
}): Promise<OnboardToken> {
  if (isMock()) {
    const { mockGenerateSignupLink } = await import('@/lib/mocks/superadmin.mock');
    return mockGenerateSignupLink(opts);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (opts.expiresInDays ?? 7));
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('onboard_tokens')
    .insert({
      token,
      academy_name: 'Signup Link',
      plan_id: null,
      trial_days: opts.expiresInDays ?? 7,
      max_uses: 1,
      current_uses: 0,
      expires_at: expiresAt.toISOString(),
      is_active: true,
      notes: opts.notes ?? null,
      created_by: user?.user?.id ?? 'system',
    })
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(`[generateSignupLink] Supabase error: ${error?.message}`);
  }
  return data as OnboardToken;
}

// ── Academy Acknowledgment ──────────────────────────────────────────

export async function getUnacknowledgedAcademies(): Promise<AcademyFull[]> {
  if (isMock()) {
    const { mockGetUnacknowledgedAcademies } = await import('@/lib/mocks/superadmin.mock');
    return mockGetUnacknowledgedAcademies();
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('academies')
    .select('*, platform_plans(*)')
    .eq('acknowledged', false)
    .order('created_at', { ascending: false });
  if (error) {
    logServiceError(error, 'superadmin');
    return [];
  }
  return (data ?? []) as AcademyFull[];
}

export async function acknowledgeAcademy(id: string): Promise<void> {
  if (isMock()) {
    const { mockAcknowledgeAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockAcknowledgeAcademy(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('academies')
    .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    throw new Error(`[acknowledgeAcademy] Supabase error: ${error.message}`);
  }
}

// ── Stats ────────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  if (isMock()) {
    const { mockGetPlatformStats } = await import('@/lib/mocks/superadmin.mock');
    return mockGetPlatformStats();
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { count: totalAcademies } = await supabase
    .from('academies')
    .select('*', { count: 'exact', head: true });
  const { count: activeAcademies } = await supabase
    .from('academies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  const { count: trialAcademies } = await supabase
    .from('academies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'trial');
  const { count: suspendedAcademies } = await supabase
    .from('academies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'suspended');
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: newAcademiesThisMonth } = await supabase
    .from('academies')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());
  return {
    total_academies: totalAcademies ?? 0,
    active_academies: activeAcademies ?? 0,
    trial_academies: trialAcademies ?? 0,
    suspended_academies: suspendedAcademies ?? 0,
    total_students: 0,
    total_professors: 0,
    total_revenue_monthly: 0,
    new_academies_this_month: newAcademiesThisMonth ?? 0,
    new_students_this_month: 0,
  };
}
