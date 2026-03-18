import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type {
  InviteToken,
  InviteUse,
  CreateInvitePayload,
  UpdateInvitePayload,
  InviteValidation,
  InviteStats,
} from '@/lib/types';

export async function listInviteTokens(
  academyId: string,
  filters?: { role?: string; active?: boolean; search?: string },
): Promise<InviteToken[]> {
  try {
    if (isMock()) {
      const { mockListInviteTokens } = await import('@/lib/mocks/invite-tokens.mock');
      return mockListInviteTokens(academyId, filters);
    }
    try {

      const params = new URLSearchParams();
      params.set('academy_id', academyId);
      if (filters?.role) params.set('role', filters.role);
      if (filters?.active !== undefined) params.set('active', String(filters.active));
      if (filters?.search) params.set('search', filters.search);

      const res = await fetch(`/api/invite-tokens?${params}`);
      if (!res.ok) throw new Error('Erro ao listar convites');
      return res.json();
    } catch {
      console.warn('[invite-tokens.listInviteTokens] API not available, using fallback');
      return [];
    }

  } catch (error) {
    handleServiceError(error, 'inviteTokens.list');
  }
}

export async function createInviteToken(
  academyId: string,
  payload: CreateInvitePayload,
): Promise<InviteToken> {
  try {
    if (isMock()) {
      const { mockCreateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockCreateInviteToken(academyId, payload);
    }
    try {

      const res = await fetch('/api/invite-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academy_id: academyId, ...payload }),
      });
      if (!res.ok) throw new Error('Erro ao criar convite');
      return res.json();
    } catch {
      console.warn('[invite-tokens.createInviteToken] API not available, using fallback');
      return { id: '', academy_id: '', created_by: '', token: '', target_role: 'student', label: '', description: null, max_uses: null, current_uses: 0, expires_at: null, is_active: false, created_at: '', updated_at: '' } as unknown as InviteToken;
    }

  } catch (error) {
    handleServiceError(error, 'inviteTokens.create');
  }
}

export async function updateInviteToken(
  tokenId: string,
  updates: UpdateInvitePayload,
): Promise<InviteToken> {
  try {
    if (isMock()) {
      const { mockUpdateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockUpdateInviteToken(tokenId, updates);
    }
    try {

      const res = await fetch(`/api/invite-tokens/${tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Erro ao atualizar convite');
      return res.json();
    } catch {
      console.warn('[invite-tokens.updateInviteToken] API not available, using fallback');
      return { id: '', academy_id: '', created_by: '', token: '', target_role: 'student', label: '', description: null, max_uses: null, current_uses: 0, expires_at: null, is_active: false, created_at: '', updated_at: '' } as unknown as InviteToken;
    }

  } catch (error) {
    handleServiceError(error, 'inviteTokens.update');
  }
}

export async function deactivateInviteToken(tokenId: string): Promise<InviteToken> {
  try {
    if (isMock()) {
      const { mockDeactivateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockDeactivateInviteToken(tokenId);
    }
    try {

      const res = await fetch(`/api/invite-tokens/${tokenId}/deactivate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao desativar convite');
      return res.json();
    } catch {
      console.warn('[invite-tokens.deactivateInviteToken] API not available, using fallback');
      return { id: '', academy_id: '', created_by: '', token: '', target_role: 'student', label: '', description: null, max_uses: null, current_uses: 0, expires_at: null, is_active: false, created_at: '', updated_at: '' } as unknown as InviteToken;
    }
  } catch (error) {
    handleServiceError(error, 'inviteTokens.deactivate');
  }
}

export async function deleteInviteToken(tokenId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockDeleteInviteToken(tokenId);
    }
    try {

      const res = await fetch(`/api/invite-tokens/${tokenId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir convite');
    } catch {
      console.warn('[invite-tokens.deleteInviteToken] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'inviteTokens.delete');
  }
}

export async function validateInviteToken(token: string): Promise<InviteValidation> {
  try {
    if (isMock()) {
      const { mockValidateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockValidateInviteToken(token);
    }
    try {

      const res = await fetch(`/api/invite-tokens/validate/${token}`);
      if (!res.ok) throw new Error('Erro ao validar token');
      return res.json();
    } catch {
      console.warn('[invite-tokens.validateInviteToken] API not available, using fallback');
      return { valid: false } as InviteValidation;
    }
  } catch (error) {
    handleServiceError(error, 'inviteTokens.validate');
  }
}

export async function useInviteToken(
  token: string,
  profileId: string,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockUseInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockUseInviteToken(token, profileId, ip, userAgent);
    }
    try {

      const res = await fetch('/api/invite-tokens/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, profile_id: profileId }),
      });
      if (!res.ok) throw new Error('Erro ao registrar uso do convite');
    } catch {
      console.warn('[invite-tokens.useInviteToken] API not available, using fallback');
    }

  } catch (error) {
    handleServiceError(error, 'inviteTokens.use');
  }
}

export async function getInviteUses(tokenId: string): Promise<InviteUse[]> {
  try {
    if (isMock()) {
      const { mockGetInviteUses } = await import('@/lib/mocks/invite-tokens.mock');
      return mockGetInviteUses(tokenId);
    }
    try {

      const res = await fetch(`/api/invite-tokens/${tokenId}/uses`);
      if (!res.ok) throw new Error('Erro ao buscar usos');
      return res.json();
    } catch {
      console.warn('[invite-tokens.getInviteUses] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'inviteTokens.getUses');
  }
}

export async function getInviteStats(academyId: string): Promise<InviteStats> {
  try {
    if (isMock()) {
      const { mockGetInviteStats } = await import('@/lib/mocks/invite-tokens.mock');
      return mockGetInviteStats(academyId);
    }
    try {

      const res = await fetch(`/api/invite-tokens/stats?academy_id=${academyId}`);
      if (!res.ok) throw new Error('Erro ao buscar estatisticas');
      return res.json();
    } catch {
      console.warn('[invite-tokens.getInviteStats] API not available, using fallback');
      return { total: 0, active: 0, expired: 0, total_uses: 0, uses_this_month: 0 } as InviteStats;
    }
  } catch (error) {
    handleServiceError(error, 'inviteTokens.stats');
  }
}
