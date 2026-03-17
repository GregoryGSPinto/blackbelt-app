import type { ImpersonateSession, ImpersonateAcademia } from '@/lib/api/superadmin-impersonate.service';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const ACADEMIAS: ImpersonateAcademia[] = [
  { id: 'academy-guerreiros', nome: 'Guerreiros BJJ', plano: 'Pro', alunos: 86, healthScore: 78 },
  { id: 'academy-titans', nome: 'Titans MMA', plano: 'Starter', alunos: 25, healthScore: 45 },
  { id: 'academy-dragon', nome: 'Dragon Fight', plano: 'Black Belt', alunos: 150, healthScore: 91 },
];

export async function mockStartImpersonation(academiaId: string): Promise<ImpersonateSession> {
  await delay(300);
  const academia = ACADEMIAS.find((a) => a.id === academiaId) ?? ACADEMIAS[0];
  const session: ImpersonateSession = {
    originalUserId: 'user-superadmin',
    impersonatedUserId: `admin-${academiaId}`,
    academiaId: academia.id,
    academiaNome: academia.nome,
    role: 'admin',
    iniciadoEm: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('bb_original_session', JSON.stringify({ userId: 'user-superadmin', role: 'superadmin' }));
    sessionStorage.setItem('bb_impersonate_session', JSON.stringify(session));
  }
  return session;
}

export async function mockStopImpersonation(): Promise<void> {
  await delay(200);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('bb_original_session');
    sessionStorage.removeItem('bb_impersonate_session');
  }
}

export async function mockListImpersonateAcademias(): Promise<ImpersonateAcademia[]> {
  await delay(300);
  return ACADEMIAS.map((a) => ({ ...a }));
}
