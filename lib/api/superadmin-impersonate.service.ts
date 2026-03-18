import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      const res = await fetch('/api/superadmin/impersonate/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academiaId }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-impersonate.startImpersonation] API not available, using mock fallback');
      const { mockStartImpersonation } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockStartImpersonation(academiaId);
    }
  } catch (error) { handleServiceError(error, 'superadmin-impersonate.start'); }
}

export async function stopImpersonation(): Promise<void> {
  try {
    if (isMock()) {
      const { mockStopImpersonation } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockStopImpersonation();
    }
    try {
      const res = await fetch('/api/superadmin/impersonate/stop', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[superadmin-impersonate.stopImpersonation] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'superadmin-impersonate.stop'); }
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
    // API not yet implemented — use mock
    const { mockListImpersonateAcademias } = await import('@/lib/mocks/superadmin-impersonate.mock');
      return mockListImpersonateAcademias();
  } catch (error) { handleServiceError(error, 'superadmin-impersonate.listAcademias'); }
}
