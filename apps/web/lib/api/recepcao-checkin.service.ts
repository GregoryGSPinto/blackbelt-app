import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface AlunoCheckin {
  id: string;
  nome: string;
  avatar: string;
  faixa: string;
  turma: string;
  statusFinanceiro: 'em_dia' | 'atrasado' | 'inadimplente';
  diasAtraso: number;
  ultimoTreino: string;
}

export interface PessoaDentro {
  id: string;
  nome: string;
  avatar: string;
  faixa: string;
  horaEntrada: string;
  turma: string;
  tipo: 'aluno' | 'professor' | 'visitante';
}

export interface CapacidadeInfo {
  totalDentro: number;
  capacidadeMax: number;
  percentual: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function buscarAlunoCheckin(query: string): Promise<AlunoCheckin[]> {
  try {
    if (isMock()) {
      const { mockBuscarAluno } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockBuscarAluno(query);
    }
    const response = await fetch(`/api/reception/checkin?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? 'Erro ao buscar alunos para check-in');
    }

    return (payload.results ?? []) as AlunoCheckin[];
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return [];
  }
}

export async function registrarEntrada(alunoId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockRegistrarEntrada } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarEntrada(alunoId);
    }
    const response = await fetch('/api/reception/checkin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'entry', studentId: alunoId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      return { success: false, message: payload.error ?? 'Erro ao registrar entrada' };
    }
    return { success: true, message: 'Entrada registrada!' };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return { success: false, message: 'Erro ao registrar entrada' };
  }
}

export async function registrarSaida(checkinId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarSaida(checkinId);
    }
    const response = await fetch('/api/reception/checkin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'exit', checkinId }),
    });
    if (!response.ok) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return { success: false };
  }
}

export async function getDentroAgora(): Promise<{ pessoas: PessoaDentro[]; capacidade: CapacidadeInfo }> {
  const fallback = { pessoas: [], capacidade: { totalDentro: 0, capacidadeMax: 80, percentual: 0 } };
  try {
    if (isMock()) {
      const { mockGetDentroAgora } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockGetDentroAgora();
    }
    const response = await fetch('/api/reception/checkin', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return fallback;
    const payload = await response.json();
    return {
      pessoas: (payload.pessoas ?? []) as PessoaDentro[],
      capacidade: (payload.capacidade ?? fallback.capacidade) as CapacidadeInfo,
    };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return fallback;
  }
}

export async function registrarVisitante(nome: string, motivo: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarVisitante } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarVisitante(nome, motivo);
    }
    const response = await fetch('/api/reception/checkin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'visitor', nome, motivo }),
    });
    if (!response.ok) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return { success: false };
  }
}
