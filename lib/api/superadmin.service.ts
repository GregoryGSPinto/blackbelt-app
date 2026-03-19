import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    // API not yet implemented — use mock
    const { mockListPlans } = await import('@/lib/mocks/superadmin.mock');
      return mockListPlans();
  } catch (error) {
    handleServiceError(error, 'superadmin.listPlans');
  }
}

export async function getPlan(id: string): Promise<PlatformPlan | null> {
  try {
    if (isMock()) {
      const { mockGetPlan } = await import('@/lib/mocks/superadmin.mock');
      return mockGetPlan(id);
    }
    try {
      const res = await fetch(`/api/superadmin/plans/${id}`);
      if (!res.ok) throw new Error('Erro ao buscar plano');
      return res.json();
    } catch {
      console.warn('[superadmin.getPlan] API not available, using fallback');
      return null;
    }
  } catch (error) {
    handleServiceError(error, 'superadmin.getPlan');
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
    // API not yet implemented — use mock
    const { mockListAcademies } = await import('@/lib/mocks/superadmin.mock');
      return mockListAcademies(filters);

  } catch (error) {
    handleServiceError(error, 'superadmin.listAcademies');
  }
}

export async function getAcademy(id: string): Promise<AcademyFull | null> {
  try {
    if (isMock()) {
      const { mockGetAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockGetAcademy(id);
    }
    try {
      const res = await fetch(`/api/superadmin/academies/${id}`);
      if (!res.ok) throw new Error('Erro ao buscar academia');
      return res.json();
    } catch {
      console.warn('[superadmin.getAcademy] API not available, using fallback');
      return null;
    }
  } catch (error) {
    handleServiceError(error, 'superadmin.getAcademy');
  }
}

export async function createAcademy(
  payload: CreateAcademyPayload,
): Promise<{ academy: AcademyFull; onboardToken: OnboardToken }> {
  try {
    if (isMock()) {
      const { mockCreateAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockCreateAcademy(payload);
    }
    try {
      const res = await fetch('/api/superadmin/academies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao criar academia');
      return res.json();
    } catch {
      console.warn('[superadmin.createAcademy] API not available, using fallback');
      return { academy: { id: '', name: '', slug: '', cnpj: '', owner_id: '', plan: 'free', status: 'active', logo_url: null, created_at: '', updated_at: '' }, onboardToken: { id: '', academy_id: '', token: '', expires_at: '', used: false } } as unknown as { academy: AcademyFull; onboardToken: OnboardToken };
    }
  } catch (error) {
    handleServiceError(error, 'superadmin.createAcademy');
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
    try {
      const res = await fetch(`/api/superadmin/academies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Erro ao atualizar academia');
      return res.json();
    } catch {
      console.warn('[superadmin.updateAcademy] API not available, using mock fallback');
      const { mockUpdateAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockUpdateAcademy(id, updates);
    }

  } catch (error) {
    handleServiceError(error, 'superadmin.updateAcademy');
  }
}

export async function suspendAcademy(id: string): Promise<AcademyFull> {
  try {
    if (isMock()) {
      const { mockSuspendAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockSuspendAcademy(id);
    }
    // API not yet implemented — use mock
    const { mockSuspendAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockSuspendAcademy(id);
  } catch (error) {
    handleServiceError(error, 'superadmin.suspendAcademy');
  }
}

export async function reactivateAcademy(id: string): Promise<AcademyFull> {
  try {
    if (isMock()) {
      const { mockReactivateAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockReactivateAcademy(id);
    }
    // API not yet implemented — use mock
    const { mockReactivateAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockReactivateAcademy(id);
  } catch (error) {
    handleServiceError(error, 'superadmin.reactivateAcademy');
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
    // API not yet implemented — use mock
    const { mockListOnboardTokens } = await import('@/lib/mocks/superadmin.mock');
      return mockListOnboardTokens(filters);

  } catch (error) {
    handleServiceError(error, 'superadmin.listOnboardTokens');
  }
}

export async function deactivateOnboardToken(id: string): Promise<OnboardToken> {
  try {
    if (isMock()) {
      const { mockDeactivateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
      return mockDeactivateOnboardToken(id);
    }
    // API not yet implemented — use mock
    const { mockDeactivateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
      return mockDeactivateOnboardToken(id);
  } catch (error) {
    handleServiceError(error, 'superadmin.deactivateOnboardToken');
  }
}

export async function validateOnboardToken(token: string): Promise<OnboardValidation> {
  try {
    if (isMock()) {
      const { mockValidateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
      return mockValidateOnboardToken(token);
    }
    // API not yet implemented — use mock
    const { mockValidateOnboardToken } = await import('@/lib/mocks/superadmin.mock');
      return mockValidateOnboardToken(token);
  } catch (error) {
    handleServiceError(error, 'superadmin.validateOnboardToken');
  }
}

export async function redeemOnboardToken(
  token: string,
  academyId: string,
  profileId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockRedeemOnboardToken } = await import('@/lib/mocks/superadmin.mock');
      return mockRedeemOnboardToken(token, academyId, profileId);
    }
    try {
      const res = await fetch('/api/superadmin/onboard-tokens/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, academy_id: academyId, profile_id: profileId }),
      });
      if (!res.ok) throw new Error('Erro ao usar token');
    } catch {
      console.warn('[superadmin.redeemOnboardToken] API not available, using fallback');
    }

  } catch (error) {
    handleServiceError(error, 'superadmin.redeemOnboardToken');
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
    const { mockGenerateSignupLink } = await import('@/lib/mocks/superadmin.mock');
    return mockGenerateSignupLink(opts);
  } catch (error) {
    handleServiceError(error, 'superadmin.generateSignupLink');
  }
}

// ── Academy Acknowledgment ──────────────────────────────────────────

export async function getUnacknowledgedAcademies(): Promise<AcademyFull[]> {
  try {
    if (isMock()) {
      const { mockGetUnacknowledgedAcademies } = await import('@/lib/mocks/superadmin.mock');
      return mockGetUnacknowledgedAcademies();
    }
    const { mockGetUnacknowledgedAcademies } = await import('@/lib/mocks/superadmin.mock');
    return mockGetUnacknowledgedAcademies();
  } catch (error) {
    handleServiceError(error, 'superadmin.getUnacknowledgedAcademies');
  }
}

export async function acknowledgeAcademy(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockAcknowledgeAcademy } = await import('@/lib/mocks/superadmin.mock');
      return mockAcknowledgeAcademy(id);
    }
    const { mockAcknowledgeAcademy } = await import('@/lib/mocks/superadmin.mock');
    return mockAcknowledgeAcademy(id);
  } catch (error) {
    handleServiceError(error, 'superadmin.acknowledgeAcademy');
  }
}

// ── Stats ────────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    if (isMock()) {
      const { mockGetPlatformStats } = await import('@/lib/mocks/superadmin.mock');
      return mockGetPlatformStats();
    }
    // API not yet implemented — use mock
    const { mockGetPlatformStats } = await import('@/lib/mocks/superadmin.mock');
      return mockGetPlatformStats();
  } catch (error) {
    handleServiceError(error, 'superadmin.getPlatformStats');
  }
}
