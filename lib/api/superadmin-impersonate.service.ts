import { isMock } from '@/lib/env';

export interface ImpersonateSession {
  originalUserId: string;
  impersonatedUserId: string;
  academiaId: string;
  academiaNome: string;
  role: 'admin';
  iniciadoEm: string;
}

export interface ImpersonateAcademia {
  id: string;
  nome: string;
  plano: string;
  alunos: number;
  healthScore: number;
}

export async function startImpersonation(academiaId: string): Promise<ImpersonateSession> {
  try {
    if (isMock()) {
      const { mockStartImpersonation } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockStartImpersonation(academiaId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: academy } = await supabase
        .from('academies')
        .select('id, name')
        .eq('id', academiaId)
        .single();
      const session: ImpersonateSession = {
        originalUserId: user?.id ?? '',
        impersonatedUserId: '',
        academiaId,
        academiaNome: (academy?.name as string) || '',
        role: 'admin',
        iniciadoEm: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bb_original_session', JSON.stringify({ userId: user?.id }));
        sessionStorage.setItem('bb_impersonate_session', JSON.stringify(session));
      }
      return session;
    } catch {
      console.error('[superadmin-impersonate.startImpersonation] API not available, using mock fallback');
      const { mockStartImpersonation } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockStartImpersonation(academiaId);
    }
  } catch (error) {
    console.error('[startImpersonation] Fallback:', error);
    return { originalUserId: '', impersonatedUserId: '', academiaId, academiaNome: '', role: 'admin', iniciadoEm: new Date().toISOString() };
  }
}

export async function stopImpersonation(): Promise<void> {
  try {
    if (isMock()) {
      const { mockStopImpersonation } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockStopImpersonation();
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bb_original_session');
      sessionStorage.removeItem('bb_impersonate_session');
    }
  } catch (error) {
    console.error('[stopImpersonation] Fallback:', error);
  }
}

export function isImpersonating(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('bb_original_session') !== null;
}

export function getImpersonationInfo(): ImpersonateSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('bb_impersonate_session');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function listImpersonateAcademias(): Promise<ImpersonateAcademia[]> {
  try {
    if (isMock()) {
      const { mockListImpersonateAcademias } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockListImpersonateAcademias();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('academies')
        .select('id, name, plan, student_count, health_score')
        .order('name');
      if (error || !data) {
        console.error('[listImpersonateAcademias] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: (row.id as string) || '',
        nome: (row.name as string) || '',
        plano: (row.plan as string) || '',
        alunos: (row.student_count as number) || 0,
        healthScore: (row.health_score as number) || 0,
      }));
    } catch {
      console.error('[superadmin-impersonate.listImpersonateAcademias] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listImpersonateAcademias] Fallback:', error);
    return [];
  }
}
