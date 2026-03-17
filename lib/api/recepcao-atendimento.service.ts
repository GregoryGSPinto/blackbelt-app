import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface AlunoAtendimento {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  faixa: string;
  tipo: 'adulto' | 'teen' | 'kids';
  statusFinanceiro: 'em_dia' | 'atrasado';
  diasAtraso?: number;
  valorDevido?: number;
  plano: string;
  proximoVencimento: string;
  ultimoCheckin: string;
  presencasMes: number;
  turmas: string[];
  alertas: string[];
  avatar?: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function buscarAlunoAtendimento(query: string): Promise<AlunoAtendimento[]> {
  try {
    if (isMock()) {
      const { mockBuscarAluno } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockBuscarAluno(query);
    }
    const res = await fetch(`/api/recepcao/atendimento/buscar?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-atendimento.buscar');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-atendimento.buscar');
  }
}

export async function checkinManual(alunoId: string, turmaId: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockCheckinManual } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockCheckinManual(alunoId, turmaId);
    }
    const res = await fetch('/api/recepcao/atendimento/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId, turmaId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-atendimento.checkin');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-atendimento.checkin');
  }
}

export async function registrarPagamento(data: {
  alunoId: string;
  valor: number;
  metodo: string;
  referencia: string;
}): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarPagamento } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockRegistrarPagamento(data);
    }
    const res = await fetch('/api/recepcao/atendimento/pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-atendimento.pagamento');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-atendimento.pagamento');
  }
}
