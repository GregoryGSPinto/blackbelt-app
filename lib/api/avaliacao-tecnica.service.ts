import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface CriterioAvaliacao {
  slug: string;
  nome: string;
  descricao: string;
  pesoPromocao: number;
}

export const CRITERIOS_BJJ: CriterioAvaliacao[] = [
  { slug: 'guarda', nome: 'Jogo de Guarda', descricao: 'Retenção, recuperação, sweeps, submissões da guarda', pesoPromocao: 20 },
  { slug: 'passagem', nome: 'Passagem de Guarda', descricao: 'Técnicas de passagem, pressão, estabilização', pesoPromocao: 15 },
  { slug: 'finalizacao', nome: 'Finalizações', descricao: 'Estrangulamentos, chaves de braço/perna, controle', pesoPromocao: 20 },
  { slug: 'defesa', nome: 'Defesa e Escapes', descricao: 'Escapes de montada, costas, side control, defesa de sub', pesoPromocao: 15 },
  { slug: 'quedas', nome: 'Quedas e Projeções', descricao: 'Takedowns, puxadas de guarda, defesa de queda', pesoPromocao: 10 },
  { slug: 'posicionamento', nome: 'Controle de Posição', descricao: 'Montada, costas, side control, north-south', pesoPromocao: 10 },
  { slug: 'competitivo', nome: 'Mentalidade Competitiva', descricao: 'Intensidade, estratégia, compostura sob pressão', pesoPromocao: 5 },
  { slug: 'conhecimento', nome: 'Conhecimento Teórico', descricao: 'Regras, princípios, história, etiqueta', pesoPromocao: 5 },
];

export interface AvaliacaoTecnica {
  id: string;
  alunoId: string;
  alunoNome: string;
  professorId: string;
  professorNome: string;
  data: string;
  faixaNoMomento: string;
  criterios: { slug: string; nota: number }[];
  mediaGeral: number;
  observacoes: string;
  recomendacao: 'manter_faixa' | 'quase_pronto' | 'pronto_para_promover';
}

export interface EvolucaoAluno {
  alunoId: string;
  avaliacoes: AvaliacaoTecnica[];
  evolucaoPorCriterio: {
    slug: string;
    nome: string;
    historico: { data: string; nota: number }[];
    tendencia: 'subindo' | 'estavel' | 'caindo';
  }[];
  mediaAtual: number;
  mediaAnterior: number;
  prontoParaPromocao: boolean;
  requisitosPromocao: {
    criterio: string;
    notaAtual: number;
    notaMinima: number;
    atingiu: boolean;
  }[];
}

// ── Service Functions ──────────────────────────────────────────────────

export async function createAvaliacao(
  alunoId: string,
  criterios: { slug: string; nota: number }[],
  observacoes: string,
): Promise<AvaliacaoTecnica> {
  try {
    if (isMock()) {
      const { mockCreateAvaliacao } = await import('@/lib/mocks/avaliacao-tecnica.mock');
      return mockCreateAvaliacao(alunoId, criterios, observacoes);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('Not authenticated'), 'avaliacao-tecnica');
      return { id: '', alunoId, alunoNome: '', professorId: '', professorNome: '', data: new Date().toISOString(), faixaNoMomento: '', criterios, mediaGeral: 0, observacoes, recomendacao: 'manter_faixa' };
    }

    const now = new Date().toISOString();
    const mediaGeral = criterios.length > 0 ? criterios.reduce((s, c) => s + c.nota, 0) / criterios.length : 0;
    const recomendacao = mediaGeral >= 8 ? 'pronto_para_promover' : mediaGeral >= 6 ? 'quase_pronto' : 'manter_faixa';

    const { data, error } = await supabase
      .from('technical_evaluations')
      .insert({
        student_id: alunoId,
        professor_id: user.id,
        criteria: criterios,
        average_score: mediaGeral,
        observations: observacoes,
        recommendation: recomendacao,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      logServiceError(error, 'avaliacao-tecnica');
    }

    return {
      id: data?.id ?? '',
      alunoId,
      alunoNome: '',
      professorId: user.id,
      professorNome: '',
      data: now,
      faixaNoMomento: '',
      criterios,
      mediaGeral,
      observacoes,
      recomendacao: recomendacao as AvaliacaoTecnica['recomendacao'],
    };
  } catch (error) {
    logServiceError(error, 'avaliacao-tecnica');
    return { id: '', alunoId, alunoNome: '', professorId: '', professorNome: '', data: new Date().toISOString(), faixaNoMomento: '', criterios, mediaGeral: 0, observacoes, recomendacao: 'manter_faixa' };
  }
}

export async function listAvaliacoes(
  professorId: string,
  filtros?: { turmaId?: string; periodo?: string; faixa?: string },
): Promise<AvaliacaoTecnica[]> {
  try {
    if (isMock()) {
      const { mockListAvaliacoes } = await import('@/lib/mocks/avaliacao-tecnica.mock');
      return mockListAvaliacoes(professorId, filtros);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('technical_evaluations')
      .select('*, students(profiles(display_name), belt)')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError(error, 'avaliacao-tecnica');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const student = row.students as Record<string, unknown> | null;
      const profile = student?.profiles as Record<string, unknown> | null;
      return {
        id: row.id as string,
        alunoId: row.student_id as string,
        alunoNome: (profile?.display_name ?? '') as string,
        professorId,
        professorNome: '',
        data: row.created_at as string,
        faixaNoMomento: (student?.belt ?? '') as string,
        criterios: (row.criteria ?? []) as { slug: string; nota: number }[],
        mediaGeral: (row.average_score ?? 0) as number,
        observacoes: (row.observations ?? '') as string,
        recomendacao: (row.recommendation ?? 'manter_faixa') as AvaliacaoTecnica['recomendacao'],
      };
    });
  } catch (error) {
    logServiceError(error, 'avaliacao-tecnica');
    return [];
  }
}

export async function getEvolucaoAluno(alunoId: string): Promise<EvolucaoAluno> {
  try {
    if (isMock()) {
      const { mockGetEvolucaoAluno } = await import('@/lib/mocks/avaliacao-tecnica.mock');
      return mockGetEvolucaoAluno(alunoId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('technical_evaluations')
      .select('*')
      .eq('student_id', alunoId)
      .order('created_at', { ascending: true });

    if (error) {
      logServiceError(error, 'avaliacao-tecnica');
      return { alunoId, avaliacoes: [], evolucaoPorCriterio: [], mediaAtual: 0, mediaAnterior: 0, prontoParaPromocao: false, requisitosPromocao: [] };
    }

    const avaliacoes: AvaliacaoTecnica[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      alunoId,
      alunoNome: '',
      professorId: (row.professor_id ?? '') as string,
      professorNome: '',
      data: row.created_at as string,
      faixaNoMomento: '',
      criterios: (row.criteria ?? []) as { slug: string; nota: number }[],
      mediaGeral: (row.average_score ?? 0) as number,
      observacoes: (row.observations ?? '') as string,
      recomendacao: (row.recommendation ?? 'manter_faixa') as AvaliacaoTecnica['recomendacao'],
    }));

    const mediaAtual = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1].mediaGeral : 0;
    const mediaAnterior = avaliacoes.length > 1 ? avaliacoes[avaliacoes.length - 2].mediaGeral : 0;

    return {
      alunoId,
      avaliacoes,
      evolucaoPorCriterio: [],
      mediaAtual,
      mediaAnterior,
      prontoParaPromocao: mediaAtual >= 8,
      requisitosPromocao: [],
    };
  } catch (error) {
    logServiceError(error, 'avaliacao-tecnica');
    return { alunoId, avaliacoes: [], evolucaoPorCriterio: [], mediaAtual: 0, mediaAnterior: 0, prontoParaPromocao: false, requisitosPromocao: [] };
  }
}

export async function getCriterios(): Promise<CriterioAvaliacao[]> {
  try {
    if (isMock()) {
      return CRITERIOS_BJJ;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.from('evaluation_criteria').select('*');
    if (error || !data?.length) {
      logServiceError(new Error('Using default criteria'), 'avaliacao-tecnica');
      return CRITERIOS_BJJ;
    }
    return data as unknown as CriterioAvaliacao[];
  } catch (error) {
    logServiceError(error, 'avaliacao-tecnica');
    return CRITERIOS_BJJ;
  }
}
