import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface PessoaDentro {
  id: string;
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
  faixa?: string;
  horaEntrada: string;
  turma?: string;
}

export interface MovimentacaoItem {
  id: string;
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
  direcao: 'entrada' | 'saida';
  horario: string;
}

export interface AcessoAcademia {
  pessoasDentro: PessoaDentro[];
  totalDentro: number;
  capacidadeMaxima: number;
  movimentacao: MovimentacaoItem[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getAcesso(): Promise<AcessoAcademia> {
  try {
    if (isMock()) {
      const { mockGetAcesso } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockGetAcesso();
    }
    try {
      const res = await fetch('/api/recepcao/acesso');
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-acesso.get');
      return res.json();
    } catch {
      console.warn('[recepcao-acesso.getAcesso] API not available, using fallback');
      return {} as AcessoAcademia;
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-acesso.get');
  }
}

export async function registrarEntradaManual(data: {
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
}): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarEntrada } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockRegistrarEntrada(data);
    }
    const res = await fetch('/api/recepcao/acesso/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-acesso.entrada');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-acesso.entrada');
  }
}

export async function registrarSaida(pessoaId: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockRegistrarSaida(pessoaId);
    }
    try {
      const res = await fetch(`/api/recepcao/acesso/${pessoaId}/saida`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-acesso.saida');
      return res.json();
    } catch {
      console.warn('[recepcao-acesso.registrarSaida] API not available, using fallback');
      return {} as { ok: boolean };
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-acesso.saida');
  }
}
