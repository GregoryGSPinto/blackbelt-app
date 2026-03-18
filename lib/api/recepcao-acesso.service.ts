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
    // API not yet implemented — use mock
    const { mockGetAcesso } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockGetAcesso();
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
    // API not yet implemented — use mock
    const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockRegistrarSaida(pessoaId);
  } catch (error) {
    handleServiceError(error, 'recepcao-acesso.saida');
  }
}
