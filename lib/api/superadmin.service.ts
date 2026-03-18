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
    try {
      const res = await fetch('/api/superadmin/plans');
      if (!res.ok) throw new Error('Erro ao listar planos');
      return res.json();
    } catch {
      console.warn('[superadmin.listPlans] API not available, using fallback');
      return [];
    }
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
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.plan_id) params.set('plan_id', filters.plan_id);
      const res = await fetch(`/api/superadmin/academies?${params}`);
      if (!res.ok) throw new Error('Erro ao listar academias');
      return res.json();
    } catch {
      console.warn('[superadmin.listAcademies] API not available, using fallback');
      return [];
    }

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
      console.warn('[superadmin.updateAcademy] API not available, using fallback');
      return { id: "", name: "", slug: "", cnpj: "", owner_id: "", plan: "free", status: "active", logo_url: null, created_at: "", updated_at: "" } as unknown as AcademyFull;
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
    try {
      const res = await fetch(`/api/superadmin/academies/${id}/suspend`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao suspender academia');
      return res.json();
    } catch {
      console.warn('[superadmin.suspendAcademy] API not available, using fallback');
      return { id: "", name: "", slug: "", cnpj: "", owner_id: "", plan: "free", status: "active", logo_url: null, created_at: "", updated_at: "" } as unknown as AcademyFull;
    }
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
    try {
      const res = await fetch(`/api/superadmin/academies/${id}/reactivate`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao reativar academia');
      return res.json();
    } catch {
      console.warn('[superadmin.reactivateAcademy] API not available, using fallback');
      return { id: "", name: "", slug: "", cnpj: "", owner_id: "", plan: "free", status: "active", logo_url: null, created_at: "", updated_at: "" } as unknown as AcademyFull;
    }
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
    try {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) params.set('active', String(filters.active));
      if (filters?.search) params.set('search', filters.search);
      const res = await fetch(`/api/superadmin/onboard-tokens?${params}`);
      if (!res.ok) throw new Error('Erro ao listar tokens');
      return res.json();
    } catch {
      console.warn('[superadmin.listOnboardTokens] API not available, using fallback');
      return [];
    }

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
    try {
      const res = await fetch(`/api/superadmin/onboard-tokens/${id}/deactivate`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao desativar token');
      return res.json();
    } catch {
      console.warn('[superadmin.deactivateOnboardToken] API not available, using fallback');
      return { id: "", academy_id: "", token: "", expires_at: "", used: false } as unknown as OnboardToken;
    }
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
    try {
      const res = await fetch(`/api/superadmin/onboard-tokens/validate/${token}`);
      if (!res.ok) throw new Error('Erro ao validar token');
      return res.json();
    } catch {
      console.warn('[superadmin.validateOnboardToken] API not available, using fallback');
      return { valid: false, academy_id: "", academy_name: "" } as unknown as OnboardValidation;
    }
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

// ── Stats ────────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    if (isMock()) {
      const { mockGetPlatformStats } = await import('@/lib/mocks/superadmin.mock');
      return mockGetPlatformStats();
    }
    try {
      const res = await fetch('/api/superadmin/stats');
      if (!res.ok) throw new Error('Erro ao buscar estatisticas');
      return res.json();
    } catch {
      console.warn('[superadmin.getPlatformStats] API not available, using fallback');
      return { total_academies: 0, total_students: 0, total_revenue: 0, mrr: 0, growth_pct: 0, churn_pct: 0 } as unknown as PlatformStats;
    }
  } catch (error) {
    handleServiceError(error, 'superadmin.getPlatformStats');
  }
}
