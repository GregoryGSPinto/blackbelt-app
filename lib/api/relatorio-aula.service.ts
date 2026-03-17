import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface RelatorioAula {
  id: string;
  turmaId: string;
  turmaNome: string;
  modalidade: string;
  professorId: string;
  professorNome: string;
  data: string;
  horario: string;

  totalMatriculados: number;
  totalPresentes: number;
  taxaPresenca: number;
  alunosPresentes: { nome: string; faixa: string; metodoCheckin: string }[];
  alunosAusentes: { nome: string; faixa: string; diasDesdeUltimoTreino: number }[];

  temaAula?: string;
  tecnicasEnsinadas?: string[];
  tipoAula?: string;
  intensidade?: string;
  observacoes?: string;

  destaques?: { aluno: string; motivo: string }[];
  dificuldades?: { aluno: string; observacao: string }[];

  presencaVsMediaTurma: number;
  presencaVsAulaAnterior: number;

  criadoEm: string;
}

export interface RelatorioMetricas {
  aulasEsteMes: number;
  mediaPresenca: number;
  melhorTurma: { nome: string; presenca: number };
  alunoMaisFrequente: { nome: string; presenca: number };
  alunoMenosFrequente: { nome: string; presenca: number };
}

// ── Service Functions ──────────────────────────────────────────────────

export async function listRelatorios(
  professorId: string,
  filtros?: { turmaId?: string; periodo?: string },
): Promise<RelatorioAula[]> {
  try {
    if (isMock()) {
      const { mockListRelatorios } = await import('@/lib/mocks/relatorio-aula.mock');
      return mockListRelatorios(professorId, filtros);
    }
    console.warn('[relatorioAula.list] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'relatorioAula.list');
  }
}

export async function getRelatorio(turmaId: string, data: string): Promise<RelatorioAula> {
  try {
    if (isMock()) {
      const { mockGetRelatorio } = await import('@/lib/mocks/relatorio-aula.mock');
      return mockGetRelatorio(turmaId, data);
    }
    console.warn('[relatorioAula.get] fallback — not yet connected to Supabase');
    return { id: '', turmaId, turmaNome: '', modalidade: '', professorId: '', professorNome: '', data, horario: '', totalMatriculados: 0, totalPresentes: 0, taxaPresenca: 0, alunosPresentes: [], alunosAusentes: [], presencaVsMediaTurma: 0, presencaVsAulaAnterior: 0, criadoEm: '' } as RelatorioAula;
  } catch (error) {
    handleServiceError(error, 'relatorioAula.get');
  }
}

export async function getRelatorioMetricas(professorId: string): Promise<RelatorioMetricas> {
  try {
    if (isMock()) {
      const { mockGetRelatorioMetricas } = await import('@/lib/mocks/relatorio-aula.mock');
      return mockGetRelatorioMetricas(professorId);
    }
    console.warn('[relatorioAula.metricas] fallback — not yet connected to Supabase');
    return { aulasEsteMes: 0, mediaPresenca: 0, melhorTurma: { nome: '', presenca: 0 }, alunoMaisFrequente: { nome: '', presenca: 0 }, alunoMenosFrequente: { nome: '', presenca: 0 } } as RelatorioMetricas;
  } catch (error) {
    handleServiceError(error, 'relatorioAula.metricas');
  }
}

export async function exportarPDF(_relatorioId: string): Promise<void> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    console.warn('[relatorioAula.exportarPDF] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'relatorioAula.exportarPDF');
  }
}
