import type { GuardianLink } from '@/lib/types/guardian';

const delay = () => new Promise((r) => setTimeout(r, 300));

export const MOCK_GUARDIAN_LINKS: GuardianLink[] = [
  {
    id: 'gl-001',
    guardian_id: 'prof-guardian-1',
    child_id: 'sophia',
    relationship: 'parent',
    can_precheckin: true,
    can_view_grades: true,
    can_manage_payments: true,
    created_at: '2025-06-01T10:00:00Z',
    child_name: 'Sophia',
    child_role: 'aluno_teen',
    child_avatar_url: undefined,
    guardian_name: 'Patricia Alves',
  },
  {
    id: 'gl-002',
    guardian_id: 'prof-guardian-1',
    child_id: 'helena',
    relationship: 'parent',
    can_precheckin: true,
    can_view_grades: true,
    can_manage_payments: true,
    created_at: '2025-06-01T10:00:00Z',
    child_name: 'Helena',
    child_role: 'aluno_kids',
    child_avatar_url: undefined,
    guardian_name: 'Patricia Alves',
  },
];

// Mutable copy for session mutations
let sessionLinks = [...MOCK_GUARDIAN_LINKS];

export async function mockGetGuardianLinks(guardianId: string): Promise<GuardianLink[]> {
  await delay();
  return sessionLinks.filter((l) => l.guardian_id === guardianId);
}

export async function mockGetChildGuardian(childId: string): Promise<GuardianLink | null> {
  await delay();
  return sessionLinks.find((l) => l.child_id === childId) ?? null;
}

export async function mockCreateGuardianLink(data: {
  guardian_id: string;
  child_id: string;
  relationship: string;
}): Promise<GuardianLink> {
  await delay();
  const link: GuardianLink = {
    id: `gl-${Date.now()}`,
    guardian_id: data.guardian_id,
    child_id: data.child_id,
    relationship: data.relationship as GuardianLink['relationship'],
    can_precheckin: true,
    can_view_grades: true,
    can_manage_payments: true,
    created_at: new Date().toISOString(),
    child_name: 'Novo Filho',
    child_role: 'aluno_kids',
  };
  sessionLinks.push(link);
  return link;
}

export async function mockUpdateGuardianPermissions(
  linkId: string,
  permissions: Partial<GuardianLink>,
): Promise<GuardianLink> {
  await delay();
  const idx = sessionLinks.findIndex((l) => l.id === linkId);
  if (idx === -1) throw new Error('Link nao encontrado');
  sessionLinks[idx] = { ...sessionLinks[idx], ...permissions };
  return sessionLinks[idx];
}

export async function mockRemoveGuardianLink(linkId: string): Promise<void> {
  await delay();
  sessionLinks = sessionLinks.filter((l) => l.id !== linkId);
}
