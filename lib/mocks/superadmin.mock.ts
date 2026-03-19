import type {
  PlatformPlan,
  AcademyFull,
  OnboardToken,
  PlatformStats,
  CreateAcademyPayload,
  UpdateAcademyPayload,
  OnboardValidation,
} from '@/lib/types';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const AUDIT = { created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' };

// ────────────────────────────────────────────────────────────
// Mock Plans
// ────────────────────────────────────────────────────────────

const MOCK_PLANS: PlatformPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    max_students: 30,
    max_professors: 3,
    max_classes: 5,
    has_streaming: false,
    has_store: false,
    has_events: false,
    has_financeiro: false,
    price_monthly: 99.90,
    price_yearly: 999.00,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    slug: 'pro',
    max_students: 100,
    max_professors: 10,
    max_classes: 20,
    has_streaming: true,
    has_store: true,
    has_events: false,
    has_financeiro: true,
    price_monthly: 199.90,
    price_yearly: 1999.00,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    max_students: 500,
    max_professors: 50,
    max_classes: 100,
    has_streaming: true,
    has_store: true,
    has_events: true,
    has_financeiro: true,
    price_monthly: 499.90,
    price_yearly: 4999.00,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
];

// ────────────────────────────────────────────────────────────
// Mock Academies
// ────────────────────────────────────────────────────────────

let MOCK_ACADEMIES: AcademyFull[] = [
  {
    id: 'academy-bb-001',
    name: 'Guerreiros BJJ',
    slug: 'guerreiros-bjj',
    logo_url: null,
    phone: '(11) 99999-1234',
    email: 'contato@guerreiros.com',
    address: 'Rua das Artes Marciais, 100',
    city: 'Sao Paulo',
    state: 'SP',
    plan_id: 'plan-pro',
    plan: MOCK_PLANS[1],
    status: 'active',
    trial_ends_at: null,
    onboarded_at: '2025-08-15T10:00:00Z',
    owner_profile_id: 'prof-roberto',
    owner_name: 'Roberto Guerreiro',
    owner_email: 'roberto@guerreiros.com',
    max_students: 100,
    max_professors: 10,
    total_students: 45,
    total_professors: 5,
    total_classes: 12,
    monthly_revenue: 199.90,
    acknowledged: true,
    acknowledged_at: '2025-08-16T10:00:00Z',
    ...AUDIT,
  },
  {
    id: 'academy-samurai',
    name: 'Samurai Fight Club',
    slug: 'samurai-fight',
    logo_url: null,
    phone: '(21) 98888-5678',
    email: 'contato@samuraifight.com',
    address: 'Av. Brasil, 500',
    city: 'Rio de Janeiro',
    state: 'RJ',
    plan_id: 'plan-starter',
    plan: MOCK_PLANS[0],
    status: 'trial',
    trial_ends_at: '2026-04-15T23:59:59Z',
    onboarded_at: '2026-03-01T14:00:00Z',
    owner_profile_id: null,
    owner_name: 'Carlos Samurai',
    owner_email: 'carlos@samuraifight.com',
    max_students: 30,
    max_professors: 3,
    total_students: 12,
    total_professors: 2,
    total_classes: 4,
    monthly_revenue: 0,
    acknowledged: false,
    acknowledged_at: null,
    created_at: '2026-03-01T14:00:00Z',
    updated_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'academy-dragon',
    name: 'Dragon Team MMA',
    slug: 'dragon-team',
    logo_url: null,
    phone: '(31) 97777-9012',
    email: 'contato@dragonteam.com',
    address: 'Rua dos Dragoes, 200',
    city: 'Belo Horizonte',
    state: 'MG',
    plan_id: 'plan-enterprise',
    plan: MOCK_PLANS[2],
    status: 'active',
    trial_ends_at: null,
    onboarded_at: '2025-11-15T09:00:00Z',
    owner_profile_id: null,
    owner_name: 'Fernando Dragon',
    owner_email: 'fernando@dragonteam.com',
    max_students: 500,
    max_professors: 50,
    total_students: 180,
    total_professors: 15,
    total_classes: 25,
    monthly_revenue: 499.90,
    acknowledged: true,
    acknowledged_at: '2025-11-16T09:00:00Z',
    created_at: '2025-11-15T09:00:00Z',
    updated_at: '2025-11-15T09:00:00Z',
  },
];

// ────────────────────────────────────────────────────────────
// Mock Onboard Tokens
// ────────────────────────────────────────────────────────────

let MOCK_ONBOARD_TOKENS: OnboardToken[] = [
  {
    id: 'onb-1',
    token: 'NvAcT3st0nB04rD1ngT0k3nXyZ2026Ab',
    academy_name: 'Nova Academia Teste',
    plan_id: 'plan-starter',
    plan_name: 'Starter',
    trial_days: 30,
    max_uses: 1,
    current_uses: 0,
    expires_at: '2026-06-30T23:59:59Z',
    is_active: true,
    notes: 'Academia teste para demonstracao',
    created_by: 'prof-superadmin',
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'onb-2',
    token: 'XpRd0nB04rD2ExpIr3dT0k3n2026Qwrt',
    academy_name: 'Academia XYZ',
    plan_id: 'plan-pro',
    plan_name: 'Pro',
    trial_days: 15,
    max_uses: 1,
    current_uses: 0,
    expires_at: '2026-02-28T23:59:59Z',
    is_active: false,
    notes: 'Token expirado',
    created_by: 'prof-superadmin',
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'onb-3',
    token: 'FgHt0nB04rD3ActIv3T0k3n2026PlMn',
    academy_name: 'Fight House',
    plan_id: 'plan-pro',
    plan_name: 'Pro',
    trial_days: 30,
    max_uses: 1,
    current_uses: 0,
    expires_at: null,
    is_active: true,
    notes: 'Parceria com influenciador',
    created_by: 'prof-superadmin',
    created_at: '2026-03-14T16:00:00Z',
  },
];

// ────────────────────────────────────────────────────────────
// Mock Implementations
// ────────────────────────────────────────────────────────────

// Plans

export async function mockListPlans(): Promise<PlatformPlan[]> {
  await delay(150);
  return [...MOCK_PLANS];
}

export async function mockGetPlan(id: string): Promise<PlatformPlan | null> {
  await delay(100);
  return MOCK_PLANS.find((p) => p.id === id) ?? null;
}

// Academies

export async function mockListAcademies(
  filters?: { status?: string; search?: string; plan_id?: string },
): Promise<AcademyFull[]> {
  await delay();
  let result = [...MOCK_ACADEMIES];

  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.plan_id) {
    result = result.filter((a) => a.plan_id === filters.plan_id);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.city ?? '').toLowerCase().includes(q) ||
        (a.owner_name ?? '').toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function mockGetAcademy(id: string): Promise<AcademyFull | null> {
  await delay(150);
  return MOCK_ACADEMIES.find((a) => a.id === id) ?? null;
}

export async function mockCreateAcademy(
  payload: CreateAcademyPayload,
): Promise<{ academy: AcademyFull; onboardToken: OnboardToken }> {
  await delay();

  const plan = MOCK_PLANS.find((p) => p.id === payload.plan_id) ?? MOCK_PLANS[0];
  const now = new Date().toISOString();
  const id = `academy-${Date.now()}`;

  const academy: AcademyFull = {
    id,
    name: payload.name,
    slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
    logo_url: null,
    phone: payload.phone ?? null,
    email: payload.email ?? null,
    address: null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    plan_id: plan.id,
    plan,
    status: 'pending',
    trial_ends_at: payload.trial_days
      ? new Date(Date.now() + payload.trial_days * 86400000).toISOString()
      : null,
    onboarded_at: null,
    owner_profile_id: null,
    max_students: plan.max_students,
    max_professors: plan.max_professors,
    total_students: 0,
    total_professors: 0,
    total_classes: 0,
    monthly_revenue: 0,
    created_at: now,
    updated_at: now,
  };

  const token: OnboardToken = {
    id: `onb-${Date.now()}`,
    token: generateToken(),
    academy_name: payload.name,
    plan_id: plan.id,
    plan_name: plan.name,
    trial_days: payload.trial_days ?? 30,
    max_uses: 1,
    current_uses: 0,
    expires_at: null,
    is_active: true,
    notes: payload.notes ?? null,
    created_by: 'prof-superadmin',
    created_at: now,
  };

  MOCK_ACADEMIES = [academy, ...MOCK_ACADEMIES];
  MOCK_ONBOARD_TOKENS = [token, ...MOCK_ONBOARD_TOKENS];

  return { academy, onboardToken: token };
}

export async function mockUpdateAcademy(
  id: string,
  updates: UpdateAcademyPayload,
): Promise<AcademyFull> {
  await delay();

  const idx = MOCK_ACADEMIES.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Academia nao encontrada');

  const updated: AcademyFull = {
    ...MOCK_ACADEMIES[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.plan_id) {
    updated.plan = MOCK_PLANS.find((p) => p.id === updates.plan_id) ?? updated.plan;
  }

  MOCK_ACADEMIES[idx] = updated;
  return updated;
}

export async function mockSuspendAcademy(id: string): Promise<AcademyFull> {
  return mockUpdateAcademy(id, { status: 'suspended' });
}

export async function mockReactivateAcademy(id: string): Promise<AcademyFull> {
  return mockUpdateAcademy(id, { status: 'active' });
}

// Onboard Tokens

export async function mockListOnboardTokens(
  filters?: { active?: boolean; search?: string },
): Promise<OnboardToken[]> {
  await delay();
  let result = [...MOCK_ONBOARD_TOKENS];

  if (filters?.active !== undefined) {
    result = result.filter((t) => t.is_active === filters.active);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((t) => t.academy_name.toLowerCase().includes(q));
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function mockDeactivateOnboardToken(id: string): Promise<OnboardToken> {
  await delay();
  const idx = MOCK_ONBOARD_TOKENS.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Token nao encontrado');
  MOCK_ONBOARD_TOKENS[idx] = { ...MOCK_ONBOARD_TOKENS[idx], is_active: false };
  return MOCK_ONBOARD_TOKENS[idx];
}

export async function mockValidateOnboardToken(token: string): Promise<OnboardValidation> {
  await delay(200);

  const found = MOCK_ONBOARD_TOKENS.find((t) => t.token === token);
  if (!found) return { valid: false, error: 'not_found' };
  if (!found.is_active) return { valid: false, error: 'inactive', token: found };
  if (found.expires_at && new Date(found.expires_at) < new Date()) {
    return { valid: false, error: 'expired', token: found };
  }
  if (found.current_uses >= found.max_uses) {
    return { valid: false, error: 'max_uses', token: found };
  }

  return { valid: true, token: found };
}

export async function mockRedeemOnboardToken(
  token: string,
  _academyId: string,
  _profileId: string,
): Promise<void> {
  await delay();
  const found = MOCK_ONBOARD_TOKENS.find((t) => t.token === token);
  if (!found) throw new Error('Token nao encontrado');
  found.current_uses += 1;
  if (found.current_uses >= found.max_uses) found.is_active = false;
}

// Signup Link (token-only, no academy data)

export async function mockGenerateSignupLink(opts: {
  notes?: string;
  expiresInDays?: number;
}): Promise<OnboardToken> {
  await delay();
  const now = new Date();
  const days = opts.expiresInDays ?? 7;
  const expiresAt = new Date(now.getTime() + days * 86400000);

  const token: OnboardToken = {
    id: `onb-${Date.now()}`,
    token: generateToken(),
    academy_name: '(Auto-cadastro)',
    plan_id: null,
    trial_days: 7,
    max_uses: 1,
    current_uses: 0,
    expires_at: expiresAt.toISOString(),
    is_active: true,
    notes: opts.notes?.trim() || null,
    created_by: 'prof-superadmin',
    created_at: now.toISOString(),
  };

  MOCK_ONBOARD_TOKENS = [token, ...MOCK_ONBOARD_TOKENS];
  return token;
}

// Academy Acknowledgment

export async function mockGetUnacknowledgedAcademies(): Promise<AcademyFull[]> {
  await delay(150);
  return MOCK_ACADEMIES.filter((a) => a.acknowledged === false);
}

export async function mockAcknowledgeAcademy(id: string): Promise<void> {
  await delay(100);
  const idx = MOCK_ACADEMIES.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Academia nao encontrada');
  MOCK_ACADEMIES[idx] = {
    ...MOCK_ACADEMIES[idx],
    acknowledged: true,
    acknowledged_at: new Date().toISOString(),
  };
}

// Stats

export async function mockGetPlatformStats(): Promise<PlatformStats> {
  await delay(200);

  const active = MOCK_ACADEMIES.filter((a) => a.status === 'active').length;
  const trial = MOCK_ACADEMIES.filter((a) => a.status === 'trial').length;
  const suspended = MOCK_ACADEMIES.filter((a) => a.status === 'suspended').length;
  const students = MOCK_ACADEMIES.reduce((s, a) => s + (a.total_students ?? 0), 0);
  const profs = MOCK_ACADEMIES.reduce((s, a) => s + (a.total_professors ?? 0), 0);
  const revenue = MOCK_ACADEMIES.reduce((s, a) => s + (a.monthly_revenue ?? 0), 0);

  return {
    total_academies: MOCK_ACADEMIES.length,
    active_academies: active,
    trial_academies: trial,
    suspended_academies: suspended,
    total_students: students,
    total_professors: profs,
    total_revenue_monthly: revenue,
    new_academies_this_month: 1,
    new_students_this_month: 8,
  };
}
