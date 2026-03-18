import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface RecompensaKids {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  custoEstrelas: number;
  tipo: 'figurinha_especial' | 'titulo' | 'moldura' | 'cor_perfil' | 'premio_fisico';
  disponivel: boolean;
  jaResgatada: boolean;
  entregue?: boolean;
  estoque?: number | null;
}

export interface HistoricoResgate {
  id: string;
  recompensa: string;
  emoji: string;
  custoEstrelas: number;
  data: string;
  tipo: string;
  entregue: boolean;
}

export async function getRecompensasKids(studentId: string): Promise<RecompensaKids[]> {
  try {
    if (isMock()) {
      const { mockGetRecompensasKids } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockGetRecompensasKids(studentId);
    }
    try {
      const res = await fetch(`/api/kids/recompensas?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-recompensas.list');
      return res.json();
    } catch {
      console.warn('[kids-recompensas.getRecompensasKids] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'kids-recompensas.list');
  }
}

export async function getHistoricoResgates(studentId: string): Promise<HistoricoResgate[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoResgates } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockGetHistoricoResgates(studentId);
    }
    try {
      const res = await fetch(`/api/kids/recompensas/historico?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-recompensas.historico');
      return res.json();
    } catch {
      console.warn('[kids-recompensas.getHistoricoResgates] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'kids-recompensas.historico');
  }
}

export async function resgatarRecompensa(studentId: string, recompensaId: string): Promise<HistoricoResgate> {
  try {
    if (isMock()) {
      const { mockResgatarRecompensa } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockResgatarRecompensa(studentId, recompensaId);
    }
    try {
      const res = await fetch('/api/kids/recompensas/resgatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, recompensaId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'kids-recompensas.resgatar');
      return res.json();
    } catch {
      console.warn('[kids-recompensas.resgatarRecompensa] API not available, using fallback');
      return { id: "", studentId: "", recompensaId: "", recompensaNome: "", custoEstrelas: 0, data: "", entregue: false } as unknown as HistoricoResgate;
    }
  } catch (error) {
    handleServiceError(error, 'kids-recompensas.resgatar');
  }
}
