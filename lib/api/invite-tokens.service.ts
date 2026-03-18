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
    // API not yet implemented — use mock
    const { mockListInviteTokens } = await import('@/lib/mocks/invite-tokens.mock');
      return mockListInviteTokens(academyId, filters);

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
      console.warn('[invite-tokens.createInviteToken] API not available, using mock fallback');
      const { mockCreateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockCreateInviteToken(academyId, payload);
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
      console.warn('[invite-tokens.updateInviteToken] API not available, using mock fallback');
      const { mockUpdateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockUpdateInviteToken(tokenId, updates);
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
    // API not yet implemented — use mock
    const { mockDeactivateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockDeactivateInviteToken(tokenId);
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
    // API not yet implemented — use mock
    const { mockValidateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
      return mockValidateInviteToken(token);
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
    // API not yet implemented — use mock
    const { mockGetInviteUses } = await import('@/lib/mocks/invite-tokens.mock');
      return mockGetInviteUses(tokenId);
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
    // API not yet implemented — use mock
    const { mockGetInviteStats } = await import('@/lib/mocks/invite-tokens.mock');
      return mockGetInviteStats(academyId);
  } catch (error) {
    handleServiceError(error, 'inviteTokens.stats');
  }
}
