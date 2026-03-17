import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface Recebimento {
  id: string;
  horario: string;
  alunoNome: string;
  tipo: 'mensalidade' | 'matricula' | 'produto' | 'evento' | 'outro';
  descricao: string;
  valor: number;
  metodo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto';
}

export interface VencimentoHoje {
  id: string;
  alunoNome: string;
  valor: number;
  plano: string;
}

export interface MetodoResumo {
  metodo: string;
  total: number;
  quantidade: number;
}

export interface CaixaDia {
  data: string;
  totalRecebido: number;
  totalPendente: number;
  totalRecebimentos: number;
  porMetodo: MetodoResumo[];
  recebimentos: Recebimento[];
  vencendoHoje: VencimentoHoje[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getCaixa(): Promise<CaixaDia> {
  try {
    if (isMock()) {
      const { mockGetCaixa } = await import('@/lib/mocks/recepcao-caixa.mock');
      return mockGetCaixa();
    }
    const res = await fetch('/api/recepcao/caixa');
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-caixa.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-caixa.get');
  }
}

export async function registrarRecebimento(data: {
  alunoNome: string;
  tipo: string;
  descricao: string;
  valor: number;
  metodo: string;
}): Promise<{ ok: boolean; id: string }> {
  try {
    if (isMock()) {
      const { mockRegistrarRecebimento } = await import('@/lib/mocks/recepcao-caixa.mock');
      return mockRegistrarRecebimento(data);
    }
    const res = await fetch('/api/recepcao/caixa/recebimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-caixa.recebimento');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-caixa.recebimento');
  }
}
