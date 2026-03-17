import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'avaliacaoTecnica.create');
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
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'avaliacaoTecnica.list');
  }
}

export async function getEvolucaoAluno(alunoId: string): Promise<EvolucaoAluno> {
  try {
    if (isMock()) {
      const { mockGetEvolucaoAluno } = await import('@/lib/mocks/avaliacao-tecnica.mock');
      return mockGetEvolucaoAluno(alunoId);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'avaliacaoTecnica.evolucao');
  }
}

export async function getCriterios(): Promise<CriterioAvaliacao[]> {
  try {
    if (isMock()) {
      return CRITERIOS_BJJ;
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'avaliacaoTecnica.criterios');
  }
}
