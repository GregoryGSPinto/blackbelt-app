import { isMock } from '@/lib/env';
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
  try {
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
      console.warn('[listPlans] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as PlatformPlan[];
  } catch (error) {
    console.warn('[listPlans] Fallback:', error);
    return [];
  }
}

export async function getPlan(id: string): Promise<PlatformPlan | null> {
  try {
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
      console.warn('[getPlan] Supabase error:', error.message);
      return null;
    }
    return (data ?? null) as PlatformPlan | null;
  } catch (error) {
    console.warn('[getPlan] Fallback:', error);
    return null;
  }
}

// ── Academies ────────────────────────────────────────────────────────

export async function listAcademies(
  filters?: { status?: string; search?: string; plan_id?: string },
): Promise<AcademyFull[]> {
  try {
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
      console.warn('[listAcademies] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as AcademyFull[];
  } catch (error) {
    console.warn('[listAcademies] Fallback:', error);
    return [];
  }
}

export async function getAcademy(id: string): Promise<AcademyFull | null> {
  try {
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
      console.warn('[getAcademy] Supabase error:', error.message);
      return null;
    }
    return (data ?? null) as AcademyFull | null;
  } catch (error) {
    console.warn('[getAcademy] Fallback:', error);
    return null;
  }
}

export async function createAcademy(
  payload: CreateAcademyPayload,
): Promise<{ academy: AcademyFull; onboardToken: OnboardToken }> {
  const emptyResult = {
    academy: {} as AcademyFull,
    onboardToken: {} as OnboardToken,
  };
  try {
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
      console.warn('[createAcademy] Supabase error:', academyError?.message);
      return emptyResult;
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
      console.warn('[createAcademy] Token creation error:', tokenError?.message);
      return { academy: academy as AcademyFull, onboardToken: {} as OnboardToken };
    }
    return {
      academy: academy as AcademyFull,
      onboardToken: onboardToken as OnboardToken,
    };
  } catch (error) {
    console.warn('[createAcademy] Fallback:', error);
    return emptyResult;
  }
}

export async function updateAcademy(
  id: string,
  updates: UpdateAcademyPayload,
): Promise<AcademyFull> {
  try {
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
      console.warn('[updateAcademy] Supabase error:', error?.message);
      return {} as AcademyFull;
    }
    return data as AcademyFull;
  } catch (error) {
    console.warn('[updateAcademy] Fallback:', error);
    return {} as AcademyFull;
  }
}

export async function suspendAcademy(id: string): Promise<AcademyFull> {
  try {
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
      console.warn('[suspendAcademy] Supabase error:', error?.message);
      return {} as AcademyFull;
    }
    return data as AcademyFull;
  } catch (error) {
    console.warn('[suspendAcademy] Fallback:', error);
    return {} as AcademyFull;
  }
}

export async function reactivateAcademy(id: string): Promise<AcademyFull> {
  try {
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
      console.warn('[reactivateAcademy] Supabase error:', error?.message);
      return {} as AcademyFull;
    }
    return data as AcademyFull;
  } catch (error) {
    console.warn('[reactivateAcademy] Fallback:', error);
    return {} as AcademyFull;
  }
}

// ── Onboard Tokens ───────────────────────────────────────────────────

export async function listOnboardTokens(
  filters?: { active?: boolean; search?: string },
): Promise<OnboardToken[]> {
  try {
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
      console.warn('[listOnboardTokens] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as OnboardToken[];
  } catch (error) {
    console.warn('[listOnboardTokens] Fallback:', error);
    return [];
  }
}

export async function deactivateOnboardToken(id: string): Promise<OnboardToken> {
  try {
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
      console.warn('[deactivateOnboardToken] Supabase error:', error?.message);
      return {} as OnboardToken;
    }
    return data as OnboardToken;
  } catch (error) {
    console.warn('[deactivateOnboardToken] Fallback:', error);
    return {} as OnboardToken;
  }
}

export async function validateOnboardToken(token: string): Promise<OnboardValidation> {
  try {
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
  } catch (error) {
    console.warn('[validateOnboardToken] Fallback:', error);
    return { valid: false, error: 'not_found' };
  }
}

export async function redeemOnboardToken(
  token: string,
  academyId: string,
  _profileId: string,
): Promise<void> {
  try {
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
      console.warn('[redeemOnboardToken] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[redeemOnboardToken] Fallback:', error);
  }
}

// ── Signup Link (token-only, no academy) ─────────────────────────────

export async function generateSignupLink(opts: {
  notes?: string;
  expiresInDays?: number;
}): Promise<OnboardToken> {
  try {
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
      console.warn('[generateSignupLink] Supabase error:', error?.message);
      return {} as OnboardToken;
    }
    return data as OnboardToken;
  } catch (error) {
    console.warn('[generateSignupLink] Fallback:', error);
    return {} as OnboardToken;
  }
}

// ── Academy Acknowledgment ──────────────────────────────────────────

export async function getUnacknowledgedAcademies(): Promise<AcademyFull[]> {
  try {
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
      console.warn('[getUnacknowledgedAcademies] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as AcademyFull[];
  } catch (error) {
    console.warn('[getUnacknowledgedAcademies] Fallback:', error);
    return [];
  }
}

export async function acknowledgeAcademy(id: string): Promise<void> {
  try {
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
      console.warn('[acknowledgeAcademy] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[acknowledgeAcademy] Fallback:', error);
  }
}

// ── Stats ────────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  const emptyStats: PlatformStats = {
    total_academies: 0,
    active_academies: 0,
    trial_academies: 0,
    suspended_academies: 0,
    total_students: 0,
    total_professors: 0,
    total_revenue_monthly: 0,
    new_academies_this_month: 0,
    new_students_this_month: 0,
  };
  try {
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
  } catch (error) {
    console.warn('[getPlatformStats] Fallback:', error);
    return emptyStats;
  }
}
