import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ── Interfaces ─────────────────────────────────────────────────────

export interface SaudeTurma {
  turmaId: string;
  turmaNome: string;
  professorNome: string;
  modalidade: string;
  alunos: number;
  presencaMedia: number;
  evolucaoMedia: number;
  tendencia: 'subindo' | 'estavel' | 'caindo';
  alertas: string[];
  score: number;
}

export interface RankingProfessor {
  professorId: string;
  professorNome: string;
  faixa: string;
  turmas: number;
  alunosTotal: number;
  presencaMediaTurmas: number;
  evolucaoMediaAlunos: number;
  avaliacoesFeitas: number;
  avaliacoesPendentes: number;
  planosAulaEscritos: number;
  videosSobidos: number;
  duvidaRespondidas: number;
  duvidaPendentes: number;
  ultimaAvaliacao: string | null;
  ultimoPlanoAula: string | null;
  score: number;
  alertas: string[];
}

export interface AlunoAtencao {
  alunoId: string;
  alunoNome: string;
  faixa: string;
  turma: string;
  professor: string;
  motivo: string;
  tipo: 'estagnado' | 'ausente' | 'nao_avaliado' | 'regressao' | 'tempo_faixa' | 'comportamento';
  urgencia: 'alta' | 'media' | 'baixa';
  acaoSugerida: string;
}

export interface TimelineItem {
  data: string;
  tipo: string;
  descricao: string;
}

export interface ResumoDashboard {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  mediaPresencaGeral: number;
  mediaEvolucaoGeral: number;
  alunosEvoluidosMes: number;
  alunosEstagnadosMes: number;
  graduacoesRealizadasMes: number;
  graduacoesProntas: number;
}

export interface PedagogicoDashboardDTO {
  resumo: ResumoDashboard;
  saudeTurmas: SaudeTurma[];
  rankingProfessores: RankingProfessor[];
  alunosAtencao: AlunoAtencao[];
  timeline: TimelineItem[];
}

export interface EvolucaoAluno {
  alunoId: string;
  alunoNome: string;
  faixa: string;
  notaAtual: number;
  notaAnterior: number;
  tendencia: 'subindo' | 'estavel' | 'caindo';
  presenca: number;
}

export interface ComparativoProfessor {
  metrica: string;
  valor: number;
  mediaAcademia: number;
}

export interface MetricasProfessor {
  presencaMedia: number;
  evolucaoMedia: number;
  retencao: number;
  avaliacoesMes: number;
  planosAulaMes: number;
  frequenciaAvaliacao: number;
}

export interface AnaliseProfessor {
  professorId: string;
  professorNome: string;
  faixa: string;
  metricas: MetricasProfessor;
  evolucaoAlunos: EvolucaoAluno[];
  comparativo: ComparativoProfessor[];
  pontosFortes: string[];
  pontosAMelhorar: string[];
  acoesSugeridas: string[];
}

export interface Tecnica {
  id: string;
  nome: string;
  descricao: string;
  faixaMinima: string;
  posicao: string;
  videoUrl: string | null;
}

export interface ModuloCurriculo {
  id: string;
  nome: string;
  descricao: string;
  faixa: string;
  ordem: number;
  tecnicas: Tecnica[];
}

export interface ProgressoTurma {
  turmaId: string;
  turmaNome: string;
  moduloAtual: string;
  percentualConcluido: number;
}

export interface CurriculoAcademia {
  id: string;
  academyId: string;
  modalidade: string;
  nome: string;
  descricao: string;
  modulos: ModuloCurriculo[];
  progressoTurmas: ProgressoTurma[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface ParticipanteReuniao {
  professorId: string;
  professorNome: string;
  presente: boolean;
}

export interface PautaItem {
  titulo: string;
  descricao: string;
  responsavel: string;
  status: 'pendente' | 'em_discussao' | 'resolvido';
}

export interface AcaoDefinida {
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
}

export interface DecisaoReuniao {
  descricao: string;
  aprovadoPor: string[];
}

export interface ReuniaoPedagogica {
  id: string;
  academyId: string;
  data: string;
  titulo: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  participantes: ParticipanteReuniao[];
  pauta: PautaItem[];
  ata: string;
  decisoes: DecisaoReuniao[];
  acoesDefinidas: AcaoDefinida[];
  criadoPor: string;
  criadoEm: string;
}

export interface Ocorrencia {
  id: string;
  academyId: string;
  alunoId: string;
  alunoNome: string;
  turmaId: string;
  turmaNome: string;
  professorId: string;
  professorNome: string;
  tipo: 'comportamento' | 'disciplina' | 'seguranca' | 'positiva' | 'observacao';
  gravidade: 'leve' | 'moderada' | 'grave';
  descricao: string;
  acaoTomada: string;
  responsavelNotificado: boolean;
  data: string;
  criadoEm: string;
}

export interface MetricasRelatorio {
  totalAlunos: number;
  presencaMedia: number;
  evolucaoMedia: number;
  graduacoes: number;
  novasMatriculas: number;
  evasoes: number;
  retencao: number;
}

export interface ProfessorRelatorio {
  professorId: string;
  professorNome: string;
  turmas: number;
  alunos: number;
  presencaMedia: number;
  avaliacoesFeitas: number;
  planosEntregues: number;
  score: number;
}

export interface AlunoDestaque {
  alunoId: string;
  alunoNome: string;
  motivo: string;
}

export interface AlunoAtencaoRelatorio {
  alunoId: string;
  alunoNome: string;
  motivo: string;
  acaoSugerida: string;
}

export interface MetaProximoMes {
  descricao: string;
  responsavel: string;
  prazo: string;
}

export interface RelatorioPedagogicoMensal {
  id: string;
  academyId: string;
  mes: string;
  resumoExecutivo: string;
  metricas: MetricasRelatorio;
  porProfessor: ProfessorRelatorio[];
  alunosDestaque: AlunoDestaque[];
  alunosAtencao: AlunoAtencaoRelatorio[];
  metaProximoMes: MetaProximoMes[];
  geradoEm: string;
}

// ── Dashboard ──────────────────────────────────────────────────────

export async function getPedagogicoDashboard(academyId: string): Promise<PedagogicoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetPedagogicoDashboard } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetPedagogicoDashboard(academyId);
    }
    const res = await fetch(`/api/pedagogico/dashboard?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.dashboard');
  }
}

// ── Análise de Professor ───────────────────────────────────────────

export async function getAnaliseProfessor(professorId: string): Promise<AnaliseProfessor> {
  try {
    if (isMock()) {
      const { mockGetAnaliseProfessor } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetAnaliseProfessor(professorId);
    }
    const res = await fetch(`/api/pedagogico/professor/${professorId}/analise`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.analiseProfessor');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.analiseProfessor');
  }
}

// ── Currículos CRUD ────────────────────────────────────────────────

export async function getCurriculos(academyId: string): Promise<CurriculoAcademia[]> {
  try {
    if (isMock()) {
      const { mockGetCurriculos } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetCurriculos(academyId);
    }
    const res = await fetch(`/api/pedagogico/curriculos?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.getCurriculos');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.getCurriculos');
  }
}

export async function getCurriculo(id: string): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockGetCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetCurriculo(id);
    }
    const res = await fetch(`/api/pedagogico/curriculos/${id}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.getCurriculo');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.getCurriculo');
  }
}

export async function createCurriculo(data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockCreateCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateCurriculo(data);
    }
    const res = await fetch('/api/pedagogico/curriculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.createCurriculo');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.createCurriculo');
  }
}

export async function updateCurriculo(id: string, data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockUpdateCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockUpdateCurriculo(id, data);
    }
    const res = await fetch(`/api/pedagogico/curriculos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.updateCurriculo');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.updateCurriculo');
  }
}

// ── Reuniões Pedagógicas ───────────────────────────────────────────

export async function getReunioes(academyId: string): Promise<ReuniaoPedagogica[]> {
  try {
    if (isMock()) {
      const { mockGetReunioes } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetReunioes(academyId);
    }
    const res = await fetch(`/api/pedagogico/reunioes?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.getReunioes');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.getReunioes');
  }
}

export async function createReuniao(data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  try {
    if (isMock()) {
      const { mockCreateReuniao } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateReuniao(data);
    }
    const res = await fetch('/api/pedagogico/reunioes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.createReuniao');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.createReuniao');
  }
}

export async function updateReuniao(id: string, data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  try {
    if (isMock()) {
      const { mockUpdateReuniao } = await import('@/lib/mocks/pedagogico.mock');
      return mockUpdateReuniao(id, data);
    }
    const res = await fetch(`/api/pedagogico/reunioes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.updateReuniao');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.updateReuniao');
  }
}

// ── Ocorrências ────────────────────────────────────────────────────

export async function getOcorrencias(academyId: string): Promise<Ocorrencia[]> {
  try {
    if (isMock()) {
      const { mockGetOcorrencias } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetOcorrencias(academyId);
    }
    const res = await fetch(`/api/pedagogico/ocorrencias?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.getOcorrencias');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.getOcorrencias');
  }
}

export async function createOcorrencia(data: Partial<Ocorrencia>): Promise<Ocorrencia> {
  try {
    if (isMock()) {
      const { mockCreateOcorrencia } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateOcorrencia(data);
    }
    const res = await fetch('/api/pedagogico/ocorrencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.createOcorrencia');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.createOcorrencia');
  }
}

// ── Relatório Mensal ───────────────────────────────────────────────

export async function gerarRelatorioPedagogico(academyId: string, mes: string): Promise<RelatorioPedagogicoMensal> {
  try {
    if (isMock()) {
      const { mockGerarRelatorioPedagogico } = await import('@/lib/mocks/pedagogico.mock');
      return mockGerarRelatorioPedagogico(academyId, mes);
    }
    const res = await fetch(`/api/pedagogico/relatorio?academyId=${academyId}&mes=${mes}`);
    if (!res.ok) throw new ServiceError(res.status, 'pedagogico.gerarRelatorio');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'pedagogico.gerarRelatorio');
  }
}
