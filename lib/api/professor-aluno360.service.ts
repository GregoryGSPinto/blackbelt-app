import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'aluno360.get');
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
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'aluno360.addNota');
  }
}
