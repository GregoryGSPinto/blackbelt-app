import { Role } from '@/lib/types';
import type {
  InviteToken,
  InviteUse,
  CreateInvitePayload,
  UpdateInvitePayload,
  InviteValidation,
  InviteStats,
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

const ACADEMY_ID = 'academy-bb-001';
const ADMIN_PROFILE_ID = 'prof-roberto';

// ────────────────────────────────────────────────────────────
// Mock Data — 5 tokens + 4 uses
// ────────────────────────────────────────────────────────────

const MOCK_TOKENS: InviteToken[] = [
  {
    id: 'inv-1',
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: 'gBr7kWmN4xPqYs2dLfAhTc8vJnZe5RuX',
    target_role: Role.AlunoAdulto,
    label: 'Link Geral Alunos',
    description: 'Link para divulgar nas redes sociais da academia',
    max_uses: null,
    current_uses: 12,
    expires_at: null,
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  },
  {
    id: 'inv-2',
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: 'Xt9pFmKw3yNbQsVh7dRcLuAe6jZgWn4J',
    target_role: Role.AlunoKids,
    label: 'Turma Kids Sabado',
    description: 'Convite para alunos da turma Kids de sabado',
    max_uses: 20,
    current_uses: 8,
    expires_at: '2026-06-30T23:59:59Z',
    is_active: true,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-01T08:00:00Z',
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  },
  {
    id: 'inv-3',
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: 'Mw5rQkYp8bNxFsHd2vLcJtAg9eZuWn7R',
    target_role: Role.Professor,
    label: 'Professores 2026',
    description: 'Link para novos professores contratados',
    max_uses: 5,
    current_uses: 2,
    expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-10T14:00:00Z',
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  },
  {
    id: 'inv-4',
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: 'Hs3fVbNm7kWpYx9dLqRcJeAg4tZuKn2X',
    target_role: Role.Responsavel,
    label: 'Responsaveis Kids',
    description: 'Link para pais/responsaveis dos alunos kids',
    max_uses: null,
    current_uses: 6,
    expires_at: null,
    is_active: true,
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  },
  {
    id: 'inv-5',
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: 'Qw8rTpMk5yNbXsVh3dFcLuJe7gZaWn9R',
    target_role: Role.AlunoTeen,
    label: 'Link Expirado Teste',
    description: 'Este link ja expirou',
    max_uses: 10,
    current_uses: 3,
    expires_at: '2026-02-28T23:59:59Z',
    is_active: false,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  },
];

const MOCK_USES: InviteUse[] = [
  {
    id: 'use-1',
    token_id: 'inv-1',
    profile_id: 'prof-joao',
    used_at: '2026-02-15T14:30:00Z',
    ip_address: '177.38.42.100',
    user_agent: 'Mozilla/5.0',
    profile_name: 'Joao Mendes',
    profile_email: 'joao@email.com',
    profile_role: 'aluno_adulto',
  },
  {
    id: 'use-2',
    token_id: 'inv-2',
    profile_id: 'prof-helena-kids',
    used_at: '2026-02-20T10:00:00Z',
    ip_address: '189.50.10.55',
    user_agent: 'Mozilla/5.0',
    profile_name: 'Helena Costa',
    profile_email: 'helena.kids@email.com',
    profile_role: 'aluno_kids',
  },
  {
    id: 'use-3',
    token_id: 'inv-3',
    profile_id: 'prof-andre',
    used_at: '2026-01-20T16:00:00Z',
    ip_address: '200.100.50.25',
    user_agent: 'Mozilla/5.0',
    profile_name: 'Andre Santos',
    profile_email: 'andre@guerreiros.com',
    profile_role: 'professor',
  },
  {
    id: 'use-4',
    token_id: 'inv-4',
    profile_id: 'prof-patricia',
    used_at: '2026-03-05T11:00:00Z',
    ip_address: '201.80.30.10',
    user_agent: 'Mozilla/5.0',
    profile_name: 'Patricia Oliveira',
    profile_email: 'patricia@email.com',
    profile_role: 'responsavel',
  },
];

// ────────────────────────────────────────────────────────────
// Mock Implementations
// ────────────────────────────────────────────────────────────

let tokens = [...MOCK_TOKENS];
let uses = [...MOCK_USES];

export async function mockListInviteTokens(
  _academyId: string,
  filters?: { role?: string; active?: boolean; search?: string },
): Promise<InviteToken[]> {
  await delay();
  let result = [...tokens];

  if (filters?.role) {
    result = result.filter((t) => t.target_role === filters.role);
  }
  if (filters?.active !== undefined) {
    result = result.filter((t) => t.is_active === filters.active);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function mockCreateInviteToken(
  _academyId: string,
  payload: CreateInvitePayload,
): Promise<InviteToken> {
  await delay();

  const now = new Date().toISOString();
  const newToken: InviteToken = {
    id: `inv-${Date.now()}`,
    academy_id: ACADEMY_ID,
    created_by: ADMIN_PROFILE_ID,
    token: generateToken(),
    target_role: payload.target_role,
    label: payload.label,
    description: payload.description ?? null,
    max_uses: payload.max_uses ?? null,
    current_uses: 0,
    expires_at: payload.expires_at ?? null,
    is_active: true,
    created_at: now,
    updated_at: now,
    academy_name: 'Guerreiros BJJ',
    created_by_name: 'Roberto Guerreiro',
  };

  tokens = [newToken, ...tokens];
  return newToken;
}

export async function mockUpdateInviteToken(
  tokenId: string,
  updates: UpdateInvitePayload,
): Promise<InviteToken> {
  await delay();

  const idx = tokens.findIndex((t) => t.id === tokenId);
  if (idx === -1) throw new Error('Token nao encontrado');

  const updated: InviteToken = {
    ...tokens[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  tokens[idx] = updated;
  return updated;
}

export async function mockDeleteInviteToken(tokenId: string): Promise<void> {
  await delay();
  tokens = tokens.filter((t) => t.id !== tokenId);
  uses = uses.filter((u) => u.token_id !== tokenId);
}

export async function mockDeactivateInviteToken(tokenId: string): Promise<InviteToken> {
  return mockUpdateInviteToken(tokenId, { is_active: false });
}

export async function mockValidateInviteToken(token: string): Promise<InviteValidation> {
  await delay(200);

  const found = tokens.find((t) => t.token === token);
  if (!found) {
    return { valid: false, error: 'not_found' };
  }

  if (!found.is_active) {
    return { valid: false, error: 'inactive', token: found };
  }

  if (found.expires_at && new Date(found.expires_at) < new Date()) {
    return { valid: false, error: 'expired', token: found };
  }

  if (found.max_uses !== null && found.current_uses >= found.max_uses) {
    return { valid: false, error: 'max_uses', token: found };
  }

  return {
    valid: true,
    token: found,
    academy_name: 'Guerreiros BJJ',
    academy_logo: null,
  };
}

export async function mockUseInviteToken(
  token: string,
  profileId: string,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  await delay();

  const found = tokens.find((t) => t.token === token);
  if (!found) throw new Error('Token nao encontrado');

  const use: InviteUse = {
    id: `use-${Date.now()}`,
    token_id: found.id,
    profile_id: profileId,
    used_at: new Date().toISOString(),
    ip_address: ip ?? null,
    user_agent: userAgent ?? null,
  };
  uses.push(use);

  found.current_uses += 1;
  if (found.max_uses !== null && found.current_uses >= found.max_uses) {
    found.is_active = false;
  }
}

export async function mockGetInviteUses(tokenId: string): Promise<InviteUse[]> {
  await delay();
  return uses
    .filter((u) => u.token_id === tokenId)
    .sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime());
}

export async function mockGetInviteStats(_academyId: string): Promise<InviteStats> {
  await delay(150);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const active = tokens.filter((t) => t.is_active).length;
  const expired = tokens.filter(
    (t) => !t.is_active || (t.expires_at && new Date(t.expires_at) < now),
  ).length;
  const totalUses = tokens.reduce((sum, t) => sum + t.current_uses, 0);
  const usesThisMonth = uses.filter(
    (u) => new Date(u.used_at) >= monthStart,
  ).length;

  return {
    total: tokens.length,
    active,
    expired,
    total_uses: totalUses,
    uses_this_month: usesThisMonth,
  };
}
