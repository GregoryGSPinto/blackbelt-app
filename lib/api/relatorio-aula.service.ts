import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('relatorios_aula').select('*').eq('professor_id', professorId);
    if (filtros?.turmaId) query = query.eq('turma_id', filtros.turmaId);
    const { data, error } = await query.order('data', { ascending: false });
    if (error) {
      console.warn('[listRelatorios] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as RelatorioAula[];
  } catch (error) {
    console.warn('[listRelatorios] Fallback:', error);
    return [];
  }
}

export async function getRelatorio(turmaId: string, data: string): Promise<RelatorioAula> {
  try {
    if (isMock()) {
      const { mockGetRelatorio } = await import('@/lib/mocks/relatorio-aula.mock');
      return mockGetRelatorio(turmaId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase.from('relatorios_aula').select('*').eq('turma_id', turmaId).eq('data', data).single();
    if (error) {
      console.warn('[getRelatorio] error:', error.message);
      return { id: '', turmaId, turmaNome: '', modalidade: '', professorId: '', professorNome: '', data, horario: '', totalMatriculados: 0, totalPresentes: 0, taxaPresenca: 0, alunosPresentes: [], alunosAusentes: [], presencaVsMediaTurma: 0, presencaVsAulaAnterior: 0, criadoEm: '' } as RelatorioAula;
    }
    return row as unknown as RelatorioAula;
  } catch (error) {
    console.warn('[getRelatorio] Fallback:', error);
    return { id: '', turmaId, turmaNome: '', modalidade: '', professorId: '', professorNome: '', data, horario: '', totalMatriculados: 0, totalPresentes: 0, taxaPresenca: 0, alunosPresentes: [], alunosAusentes: [], presencaVsMediaTurma: 0, presencaVsAulaAnterior: 0, criadoEm: '' } as RelatorioAula;
  }
}

export async function getRelatorioMetricas(professorId: string): Promise<RelatorioMetricas> {
  try {
    if (isMock()) {
      const { mockGetRelatorioMetricas } = await import('@/lib/mocks/relatorio-aula.mock');
      return mockGetRelatorioMetricas(professorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('relatorios_aula').select('*').eq('professor_id', professorId);
    if (error || !data || data.length === 0) {
      console.warn('[getRelatorioMetricas] error:', error?.message ?? 'no data');
      return { aulasEsteMes: 0, mediaPresenca: 0, melhorTurma: { nome: '', presenca: 0 }, alunoMaisFrequente: { nome: '', presenca: 0 }, alunoMenosFrequente: { nome: '', presenca: 0 } } as RelatorioMetricas;
    }
    return { aulasEsteMes: data.length, mediaPresenca: 0, melhorTurma: { nome: '', presenca: 0 }, alunoMaisFrequente: { nome: '', presenca: 0 }, alunoMenosFrequente: { nome: '', presenca: 0 } } as RelatorioMetricas;
  } catch (error) {
    console.warn('[getRelatorioMetricas] Fallback:', error);
    return { aulasEsteMes: 0, mediaPresenca: 0, melhorTurma: { nome: '', presenca: 0 }, alunoMaisFrequente: { nome: '', presenca: 0 }, alunoMenosFrequente: { nome: '', presenca: 0 } } as RelatorioMetricas;
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
    console.warn('[exportarPDF] Fallback:', error);
    return;
  }
}
