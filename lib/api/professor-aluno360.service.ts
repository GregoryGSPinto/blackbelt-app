import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface Aluno360 {
  id: string;
  nome: string;
  avatar?: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  idade: number;

  faixaAtual: string;
  graus: number;
  dataPromocao: string;
  tempoNaFaixaAtual: string;
  historicoFaixas: { faixa: string; data: string; professor: string }[];

  presencaTotal: number;
  presencaUltimos30Dias: number;
  presencaMedia: number;
  sequenciaAtual: number;
  maiorSequencia: number;
  frequenciaSemanal: number[];
  ultimoCheckin: string;
  diasDesdeUltimoTreino: number;

  ultimaAvaliacao?: {
    data: string;
    mediaGeral: number;
    recomendacao: string;
    criterios: { slug: string; nome: string; nota: number }[];
  };
  evolucaoMedia: { data: string; media: number }[];

  restricoesMedicas: { descricao: string; desde: string; ativa: boolean }[];
  lesoes: { descricao: string; data: string; recuperado: boolean }[];

  turmasInscritas: { id: string; nome: string; horario: string; modalidade: string }[];

  notasProfessores: {
    id: string;
    professorNome: string;
    data: string;
    texto: string;
    tipo: 'observacao' | 'destaque' | 'atencao' | 'restricao';
  }[];

  competicoes: { nome: string; data: string; resultado: string; categoria: string }[];

  situacaoFinanceira: 'em_dia' | 'atrasado' | 'inadimplente';
  plano: string;
  planoPeriodo: string;
}

export interface NotaAluno {
  id: string;
  alunoId: string;
  professorId: string;
  professorNome: string;
  data: string;
  texto: string;
  tipo: 'observacao' | 'destaque' | 'atencao' | 'restricao';
}

// ── Service Functions ──────────────────────────────────────────────────

export async function getAluno360(alunoId: string): Promise<Aluno360> {
  try {
    if (isMock()) {
      const { mockGetAluno360 } = await import('@/lib/mocks/professor-aluno360.mock');
      return mockGetAluno360(alunoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('students').select('*').eq('id', alunoId).single();
    if (error) {
      logServiceError(error, 'professor-aluno360');
      return { id: alunoId, nome: '', email: '', telefone: '', dataNascimento: '', idade: 0, faixaAtual: '', graus: 0, dataPromocao: '', tempoNaFaixaAtual: '', historicoFaixas: [], presencaTotal: 0, presencaUltimos30Dias: 0, presencaMedia: 0, sequenciaAtual: 0, maiorSequencia: 0, frequenciaSemanal: [], ultimoCheckin: '', diasDesdeUltimoTreino: 0, evolucaoMedia: [], restricoesMedicas: [], lesoes: [], turmasInscritas: [], notasProfessores: [], competicoes: [], situacaoFinanceira: 'em_dia', plano: '', planoPeriodo: '' } as Aluno360;
    }
    return data as unknown as Aluno360;
  } catch (error) {
    logServiceError(error, 'professor-aluno360');
    return { id: alunoId, nome: '', email: '', telefone: '', dataNascimento: '', idade: 0, faixaAtual: '', graus: 0, dataPromocao: '', tempoNaFaixaAtual: '', historicoFaixas: [], presencaTotal: 0, presencaUltimos30Dias: 0, presencaMedia: 0, sequenciaAtual: 0, maiorSequencia: 0, frequenciaSemanal: [], ultimoCheckin: '', diasDesdeUltimoTreino: 0, evolucaoMedia: [], restricoesMedicas: [], lesoes: [], turmasInscritas: [], notasProfessores: [], competicoes: [], situacaoFinanceira: 'em_dia', plano: '', planoPeriodo: '' } as Aluno360;
  }
}

export async function addNotaAluno(
  alunoId: string,
  nota: { texto: string; tipo: 'observacao' | 'destaque' | 'atencao' | 'restricao' },
): Promise<NotaAluno> {
  try {
    if (isMock()) {
      const { mockAddNotaAluno } = await import('@/lib/mocks/professor-aluno360.mock');
      return mockAddNotaAluno(alunoId, nota);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('notas_aluno').insert({ aluno_id: alunoId, texto: nota.texto, tipo: nota.tipo }).select().single();
    if (error) {
      logServiceError(error, 'professor-aluno360');
      return { id: '', alunoId, professorId: '', professorNome: '', data: new Date().toISOString(), texto: nota.texto, tipo: nota.tipo } as NotaAluno;
    }
    return data as unknown as NotaAluno;
  } catch (error) {
    logServiceError(error, 'professor-aluno360');
    return { id: '', alunoId, professorId: '', professorNome: '', data: new Date().toISOString(), texto: nota.texto, tipo: nota.tipo } as NotaAluno;
  }
}
