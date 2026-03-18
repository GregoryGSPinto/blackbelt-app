import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface NotificacaoResponsavel {
  id: string;
  type: 'presenca' | 'pagamento' | 'avaliacao' | 'evento' | 'mensagem' | 'alerta';
  title: string;
  body: string;
  student_name: string;
  read: boolean;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getNotificacoes(guardianId: string): Promise<NotificacaoResponsavel[]> {
  try {
    if (isMock()) {
      const { mockGetNotificacoes } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockGetNotificacoes(guardianId);
    }
    // API not yet implemented — use mock
    const { mockGetNotificacoes } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockGetNotificacoes(guardianId);
  } catch (error) {
    handleServiceError(error, 'responsavel.notificacoes');
  }
}

export async function marcarLida(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLida } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockMarcarLida(id);
    }
    try {
      const res = await fetch(`/api/responsavel/notificacoes/${id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.notificacoes.marcarLida');
    } catch {
      console.warn('[responsavel-notificacoes.marcarLida] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'responsavel.notificacoes.marcarLida');
  }
}

export async function marcarTodasLidas(guardianId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarTodasLidas } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockMarcarTodasLidas(guardianId);
    }
    try {
      const res = await fetch(`/api/responsavel/notificacoes/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'responsavel.notificacoes.marcarTodasLidas');
    } catch {
      console.warn('[responsavel-notificacoes.marcarTodasLidas] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'responsavel.notificacoes.marcarTodasLidas');
  }
}
