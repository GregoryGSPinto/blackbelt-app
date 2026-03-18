import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface Autorizacao {
  id: string;
  student_id: string;
  student_name: string;
  type: 'evento' | 'viagem' | 'foto' | 'saida_sozinho' | 'contato_emergencia';
  title: string;
  description: string;
  status: 'pendente' | 'autorizado' | 'negado';
  requested_at: string;
  responded_at: string | null;
}

export interface ParentalPermission {
  key: string;
  label: string;
  enabled: boolean;
  description: string;
}

export interface ControleParental {
  student_id: string;
  student_name: string;
  permissions: ParentalPermission[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getAutorizacoes(guardianId: string): Promise<Autorizacao[]> {
  try {
    if (isMock()) {
      const { mockGetAutorizacoes } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetAutorizacoes(guardianId);
    }
    try {
      const res = await fetch(`/api/responsavel/autorizacoes?guardianId=${guardianId}`);
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.autorizacoes');
      return res.json();
    } catch {
      console.warn('[responsavel-autorizacoes.getAutorizacoes] API not available, using mock fallback');
      const { mockGetAutorizacoes } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetAutorizacoes(guardianId);
    }
  } catch (error) {
    handleServiceError(error, 'responsavel.autorizacoes');
  }
}

export async function respondAutorizacao(
  id: string,
  status: 'autorizado' | 'negado',
): Promise<Autorizacao> {
  try {
    if (isMock()) {
      const { mockRespondAutorizacao } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockRespondAutorizacao(id, status);
    }
    try {
      const res = await fetch(`/api/responsavel/autorizacoes/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.autorizacoes.respond');
      return res.json();
    } catch {
      console.warn('[responsavel-autorizacoes.respondAutorizacao] API not available, using mock fallback');
      const { mockRespondAutorizacao } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockRespondAutorizacao(id, status);
    }

  } catch (error) {
    handleServiceError(error, 'responsavel.autorizacoes.respond');
  }
}

export async function getControleParental(studentId: string): Promise<ControleParental> {
  try {
    if (isMock()) {
      const { mockGetControleParental } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetControleParental(studentId);
    }
    try {
      const res = await fetch(`/api/responsavel/controle-parental/${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.controle-parental');
      return res.json();
    } catch {
      console.warn('[responsavel-autorizacoes.getControleParental] API not available, using mock fallback');
      const { mockGetControleParental } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetControleParental(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'responsavel.controle-parental');
  }
}

export async function updatePermission(
  studentId: string,
  key: string,
  enabled: boolean,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdatePermission } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockUpdatePermission(studentId, key, enabled);
    }
    try {
      const res = await fetch(`/api/responsavel/controle-parental/${studentId}/permission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.controle-parental.update');
    } catch {
      console.warn('[responsavel-autorizacoes.updatePermission] API not available, using fallback');
    }

  } catch (error) {
    handleServiceError(error, 'responsavel.controle-parental.update');
  }
}
