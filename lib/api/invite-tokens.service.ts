import { isMock } from '@/lib/env';
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
  if (isMock()) {
    const { mockListInviteTokens } = await import('@/lib/mocks/invite-tokens.mock');
    return mockListInviteTokens(academyId, filters);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  let query = supabase
    .from('invite_tokens')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active);
  }
  if (filters?.search) {
    query = query.ilike('code', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[listInviteTokens] error:', error.message);
    return [];
  }

  return (data ?? []) as unknown as InviteToken[];
}

export async function createInviteToken(
  academyId: string,
  payload: CreateInvitePayload,
): Promise<InviteToken> {
  if (isMock()) {
    const { mockCreateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockCreateInviteToken(academyId, payload);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invite_tokens')
    .insert({ academy_id: academyId, ...payload })
    .select()
    .single();

  if (error) {
    throw new Error(`[createInviteToken] ${error.message}`);
  }

  return data as unknown as InviteToken;
}

export async function updateInviteToken(
  tokenId: string,
  updates: UpdateInvitePayload,
): Promise<InviteToken> {
  if (isMock()) {
    const { mockUpdateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockUpdateInviteToken(tokenId, updates);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invite_tokens')
    .update(updates)
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    throw new Error(`[updateInviteToken] ${error.message}`);
  }

  return data as unknown as InviteToken;
}

export async function deactivateInviteToken(tokenId: string): Promise<InviteToken> {
  if (isMock()) {
    const { mockDeactivateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockDeactivateInviteToken(tokenId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invite_tokens')
    .update({ is_active: false })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    throw new Error(`[deactivateInviteToken] ${error.message}`);
  }

  return data as unknown as InviteToken;
}

export async function deleteInviteToken(tokenId: string): Promise<void> {
  if (isMock()) {
    const { mockDeleteInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockDeleteInviteToken(tokenId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from('invite_tokens')
    .delete()
    .eq('id', tokenId);

  if (error) {
    throw new Error(`[deleteInviteToken] ${error.message}`);
  }
}

export async function validateInviteToken(token: string): Promise<InviteValidation> {
  if (isMock()) {
    const { mockValidateInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockValidateInviteToken(token);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('code', token)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('[validateInviteToken] error:', error?.message ?? 'Token not found');
    return { valid: false, reason: 'Token inválido ou expirado' } as InviteValidation;
  }

  const now = new Date();
  const expires = data.expires_at ? new Date(data.expires_at) : null;
  const maxUsesReached = data.max_uses && data.uses_count >= data.max_uses;

  if (expires && now > expires) {
    return { valid: false, reason: 'Token expirado' } as InviteValidation;
  }

  if (maxUsesReached) {
    return { valid: false, reason: 'Limite de usos atingido' } as InviteValidation;
  }

  return { valid: true, token: data } as unknown as InviteValidation;
}

export async function useInviteToken(
  token: string,
  profileId: string,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  if (isMock()) {
    const { mockUseInviteToken } = await import('@/lib/mocks/invite-tokens.mock');
    return mockUseInviteToken(token, profileId, ip, userAgent);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Record the usage
  const { error: useError } = await supabase
    .from('invite_uses')
    .insert({
      token_code: token,
      profile_id: profileId,
      ip: ip ?? null,
      user_agent: userAgent ?? null,
    });

  if (useError) {
    throw new Error(`[useInviteToken] error inserting use: ${useError.message}`);
  }

  // Increment uses_count on the token
  const { error: updateError } = await supabase.rpc('increment_invite_uses', {
    token_code: token,
  });

  if (updateError) {
    throw new Error(`[useInviteToken] error incrementing uses: ${updateError.message}`);
  }
}

export async function getInviteUses(tokenId: string): Promise<InviteUse[]> {
  if (isMock()) {
    const { mockGetInviteUses } = await import('@/lib/mocks/invite-tokens.mock');
    return mockGetInviteUses(tokenId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invite_uses')
    .select('*')
    .eq('token_id', tokenId)
    .order('used_at', { ascending: false });

  if (error) {
    console.error('[getInviteUses] error:', error.message);
    return [];
  }

  return (data ?? []) as unknown as InviteUse[];
}

export async function getInviteStats(academyId: string): Promise<InviteStats> {
  if (isMock()) {
    const { mockGetInviteStats } = await import('@/lib/mocks/invite-tokens.mock');
    return mockGetInviteStats(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const [tokensResult, activeResult, usesResult] = await Promise.all([
    supabase.from('invite_tokens').select('id', { count: 'exact', head: true }).eq('academy_id', academyId),
    supabase.from('invite_tokens').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
    supabase.from('invite_uses').select('id, invite_tokens!inner(academy_id)', { count: 'exact', head: true }).eq('invite_tokens.academy_id', academyId),
  ]);

  return {
    totalTokens: tokensResult.count ?? 0,
    activeTokens: activeResult.count ?? 0,
    totalUses: usesResult.count ?? 0,
  } as unknown as InviteStats;
}
