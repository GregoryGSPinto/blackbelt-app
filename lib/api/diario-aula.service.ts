import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface DiarioAula {
  id: string;
  turmaId: string;
  turmaNome: string;
  data: string;
  professorId: string;
  professorNome: string;
  tecnicasEnsinadas: TecnicaEnsinada[];
  temaGeral: string;
  observacoesGerais: string;
  alunosDestaque: { alunoId: string; alunoNome: string; motivo: string }[];
  alunosDificuldade: { alunoId: string; alunoNome: string; observacao: string }[];
  totalPresentes: number;
  totalMatriculados: number;
  duracaoMinutos: number;
  intensidade: 'leve' | 'moderada' | 'intensa';
  tipo: 'tecnica' | 'sparring' | 'competicao' | 'especial' | 'mista';
  criadoEm: string;
}

export interface TecnicaEnsinada {
  nome: string;
  posicao: string;
  categoria: string;
  nivelFaixa: string;
}

export interface CreateDiarioPayload {
  turmaId: string;
  data: string;
  temaGeral: string;
  tecnicasEnsinadas: TecnicaEnsinada[];
  observacoesGerais: string;
  alunosDestaque: { alunoId: string; alunoNome: string; motivo: string }[];
  alunosDificuldade: { alunoId: string; alunoNome: string; observacao: string }[];
  totalPresentes: number;
  totalMatriculados: number;
  duracaoMinutos: number;
  intensidade: 'leve' | 'moderada' | 'intensa';
  tipo: 'tecnica' | 'sparring' | 'competicao' | 'especial' | 'mista';
}

// ── Service Functions ──────────────────────────────────────────────────

export async function createDiario(payload: CreateDiarioPayload): Promise<DiarioAula> {
  try {
    if (isMock()) {
      const { mockCreateDiario } = await import('@/lib/mocks/diario-aula.mock');
      return mockCreateDiario(payload);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'diarioAula.create');
  }
}

export async function updateDiario(id: string, dados: Partial<CreateDiarioPayload>): Promise<DiarioAula> {
  try {
    if (isMock()) {
      const { mockUpdateDiario } = await import('@/lib/mocks/diario-aula.mock');
      return mockUpdateDiario(id, dados);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'diarioAula.update');
  }
}

export async function getDiario(id: string): Promise<DiarioAula> {
  try {
    if (isMock()) {
      const { mockGetDiario } = await import('@/lib/mocks/diario-aula.mock');
      return mockGetDiario(id);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'diarioAula.get');
  }
}

export async function listDiarios(professorId: string, filtros?: { turmaId?: string; periodo?: string }): Promise<DiarioAula[]> {
  try {
    if (isMock()) {
      const { mockListDiarios } = await import('@/lib/mocks/diario-aula.mock');
      return mockListDiarios(professorId, filtros);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'diarioAula.list');
  }
}
