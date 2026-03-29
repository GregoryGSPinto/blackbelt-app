import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('diarios_aula').insert(payload).select().single();
    if (error) {
      logServiceError(error, 'diario-aula');
      return { id: '', turmaId: payload.turmaId, turmaNome: '', data: payload.data, professorId: '', professorNome: '', tecnicasEnsinadas: payload.tecnicasEnsinadas, temaGeral: payload.temaGeral, observacoesGerais: payload.observacoesGerais, alunosDestaque: payload.alunosDestaque, alunosDificuldade: payload.alunosDificuldade, totalPresentes: payload.totalPresentes, totalMatriculados: payload.totalMatriculados, duracaoMinutos: payload.duracaoMinutos, intensidade: payload.intensidade, tipo: payload.tipo, criadoEm: new Date().toISOString() } as DiarioAula;
    }
    return data as unknown as DiarioAula;
  } catch (error) {
    logServiceError(error, 'diario-aula');
    return { id: '', turmaId: payload.turmaId, turmaNome: '', data: payload.data, professorId: '', professorNome: '', tecnicasEnsinadas: payload.tecnicasEnsinadas, temaGeral: payload.temaGeral, observacoesGerais: payload.observacoesGerais, alunosDestaque: payload.alunosDestaque, alunosDificuldade: payload.alunosDificuldade, totalPresentes: payload.totalPresentes, totalMatriculados: payload.totalMatriculados, duracaoMinutos: payload.duracaoMinutos, intensidade: payload.intensidade, tipo: payload.tipo, criadoEm: new Date().toISOString() } as DiarioAula;
  }
}

export async function updateDiario(id: string, dados: Partial<CreateDiarioPayload>): Promise<DiarioAula> {
  try {
    if (isMock()) {
      const { mockUpdateDiario } = await import('@/lib/mocks/diario-aula.mock');
      return mockUpdateDiario(id, dados);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('diarios_aula').update(dados).eq('id', id).select().single();
    if (error) {
      logServiceError(error, 'diario-aula');
      return { id, turmaId: '', turmaNome: '', data: '', professorId: '', professorNome: '', tecnicasEnsinadas: [], temaGeral: '', observacoesGerais: '', alunosDestaque: [], alunosDificuldade: [], totalPresentes: 0, totalMatriculados: 0, duracaoMinutos: 0, intensidade: 'leve', tipo: 'tecnica', criadoEm: '' } as DiarioAula;
    }
    return data as unknown as DiarioAula;
  } catch (error) {
    logServiceError(error, 'diario-aula');
    return { id, turmaId: '', turmaNome: '', data: '', professorId: '', professorNome: '', tecnicasEnsinadas: [], temaGeral: '', observacoesGerais: '', alunosDestaque: [], alunosDificuldade: [], totalPresentes: 0, totalMatriculados: 0, duracaoMinutos: 0, intensidade: 'leve', tipo: 'tecnica', criadoEm: '' } as DiarioAula;
  }
}

export async function getDiario(id: string): Promise<DiarioAula> {
  try {
    if (isMock()) {
      const { mockGetDiario } = await import('@/lib/mocks/diario-aula.mock');
      return mockGetDiario(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('diarios_aula').select('*').eq('id', id).single();
    if (error) {
      logServiceError(error, 'diario-aula');
      return { id, turmaId: '', turmaNome: '', data: '', professorId: '', professorNome: '', tecnicasEnsinadas: [], temaGeral: '', observacoesGerais: '', alunosDestaque: [], alunosDificuldade: [], totalPresentes: 0, totalMatriculados: 0, duracaoMinutos: 0, intensidade: 'leve', tipo: 'tecnica', criadoEm: '' } as DiarioAula;
    }
    return data as unknown as DiarioAula;
  } catch (error) {
    logServiceError(error, 'diario-aula');
    return { id, turmaId: '', turmaNome: '', data: '', professorId: '', professorNome: '', tecnicasEnsinadas: [], temaGeral: '', observacoesGerais: '', alunosDestaque: [], alunosDificuldade: [], totalPresentes: 0, totalMatriculados: 0, duracaoMinutos: 0, intensidade: 'leve', tipo: 'tecnica', criadoEm: '' } as DiarioAula;
  }
}

export async function listDiarios(professorId: string, filtros?: { turmaId?: string; periodo?: string }): Promise<DiarioAula[]> {
  try {
    if (isMock()) {
      const { mockListDiarios } = await import('@/lib/mocks/diario-aula.mock');
      return mockListDiarios(professorId, filtros);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('diarios_aula').select('*').eq('professor_id', professorId);
    if (filtros?.turmaId) query = query.eq('turma_id', filtros.turmaId);
    const { data, error } = await query.order('data', { ascending: false });
    if (error) {
      logServiceError(error, 'diario-aula');
      return [];
    }
    return (data ?? []) as unknown as DiarioAula[];
  } catch (error) {
    logServiceError(error, 'diario-aula');
    return [];
  }
}
