import { isMock } from '@/lib/env';

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

// ── Fallbacks ─────────────────────────────────────────────────────

const EMPTY_RESUMO: ResumoDashboard = {
  totalAlunos: 0,
  totalProfessores: 0,
  totalTurmas: 0,
  mediaPresencaGeral: 0,
  mediaEvolucaoGeral: 0,
  alunosEvoluidosMes: 0,
  alunosEstagnadosMes: 0,
  graduacoesRealizadasMes: 0,
  graduacoesProntas: 0,
};

const EMPTY_DASHBOARD: PedagogicoDashboardDTO = {
  resumo: EMPTY_RESUMO,
  saudeTurmas: [],
  rankingProfessores: [],
  alunosAtencao: [],
  timeline: [],
};

const EMPTY_ANALISE: AnaliseProfessor = {
  professorId: '',
  professorNome: '',
  faixa: '',
  metricas: { presencaMedia: 0, evolucaoMedia: 0, retencao: 0, avaliacoesMes: 0, planosAulaMes: 0, frequenciaAvaliacao: 0 },
  evolucaoAlunos: [],
  comparativo: [],
  pontosFortes: [],
  pontosAMelhorar: [],
  acoesSugeridas: [],
};

const EMPTY_CURRICULO: CurriculoAcademia = {
  id: '',
  academyId: '',
  modalidade: '',
  nome: '',
  descricao: '',
  modulos: [],
  progressoTurmas: [],
  criadoEm: '',
  atualizadoEm: '',
};

const EMPTY_REUNIAO: ReuniaoPedagogica = {
  id: '',
  academyId: '',
  data: '',
  titulo: '',
  status: 'agendada',
  participantes: [],
  pauta: [],
  ata: '',
  decisoes: [],
  acoesDefinidas: [],
  criadoPor: '',
  criadoEm: '',
};

const EMPTY_OCORRENCIA: Ocorrencia = {
  id: '',
  academyId: '',
  alunoId: '',
  alunoNome: '',
  turmaId: '',
  turmaNome: '',
  professorId: '',
  professorNome: '',
  tipo: 'observacao',
  gravidade: 'leve',
  descricao: '',
  acaoTomada: '',
  responsavelNotificado: false,
  data: '',
  criadoEm: '',
};

const EMPTY_RELATORIO: RelatorioPedagogicoMensal = {
  id: '',
  academyId: '',
  mes: '',
  resumoExecutivo: '',
  metricas: { totalAlunos: 0, presencaMedia: 0, evolucaoMedia: 0, graduacoes: 0, novasMatriculas: 0, evasoes: 0, retencao: 0 },
  porProfessor: [],
  alunosDestaque: [],
  alunosAtencao: [],
  metaProximoMes: [],
  geradoEm: '',
};

// ── Dashboard ──────────────────────────────────────────────────────

export async function getPedagogicoDashboard(academyId: string): Promise<PedagogicoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetPedagogicoDashboard } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetPedagogicoDashboard(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch turmas with professor info
    const { data: turmas, error: turmasErr } = await supabase
      .from('turmas')
      .select('id, nome, modalidade, professor_id, profiles:professor_id(full_name)')
      .eq('academy_id', academyId);

    if (turmasErr) {
      console.error('[getPedagogicoDashboard] turmas error:', turmasErr.message);
      return EMPTY_DASHBOARD;
    }

    // Fetch basic counts
    const { count: totalAlunos } = await supabase
      .from('academy_members')
      .select('*', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .eq('role', 'student');

    const { count: totalProfessores } = await supabase
      .from('academy_members')
      .select('*', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .eq('role', 'professor');

    const resumo: ResumoDashboard = {
      totalAlunos: totalAlunos ?? 0,
      totalProfessores: totalProfessores ?? 0,
      totalTurmas: (turmas || []).length,
      mediaPresencaGeral: 0,
      mediaEvolucaoGeral: 0,
      alunosEvoluidosMes: 0,
      alunosEstagnadosMes: 0,
      graduacoesRealizadasMes: 0,
      graduacoesProntas: 0,
    };

    const saudeTurmas: SaudeTurma[] = (turmas || []).map((t: Record<string, unknown>) => {
      const prof = t.profiles as Record<string, unknown> | null;
      return {
        turmaId: String(t.id ?? ''),
        turmaNome: String(t.nome ?? ''),
        professorNome: prof ? String(prof.full_name ?? '') : '',
        modalidade: String(t.modalidade ?? ''),
        alunos: 0,
        presencaMedia: 0,
        evolucaoMedia: 0,
        tendencia: 'estavel' as const,
        alertas: [],
        score: 0,
      };
    });

    return {
      resumo,
      saudeTurmas,
      rankingProfessores: [],
      alunosAtencao: [],
      timeline: [],
    };
  } catch (error) {
    console.error('[getPedagogicoDashboard] Fallback:', error);
    return EMPTY_DASHBOARD;
  }
}

// ── Análise de Professor ───────────────────────────────────────────

export async function getAnaliseProfessor(professorId: string): Promise<AnaliseProfessor> {
  try {
    if (isMock()) {
      const { mockGetAnaliseProfessor } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetAnaliseProfessor(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, belt')
      .eq('id', professorId)
      .single();

    if (profileErr || !profile) {
      console.error('[getAnaliseProfessor] profile error:', profileErr?.message);
      return EMPTY_ANALISE;
    }

    return {
      professorId: String(profile.id ?? ''),
      professorNome: String(profile.full_name ?? ''),
      faixa: String(profile.belt ?? ''),
      metricas: {
        presencaMedia: 0,
        evolucaoMedia: 0,
        retencao: 0,
        avaliacoesMes: 0,
        planosAulaMes: 0,
        frequenciaAvaliacao: 0,
      },
      evolucaoAlunos: [],
      comparativo: [],
      pontosFortes: [],
      pontosAMelhorar: [],
      acoesSugeridas: [],
    };
  } catch (error) {
    console.error('[getAnaliseProfessor] Fallback:', error);
    return EMPTY_ANALISE;
  }
}

// ── Currículos CRUD ────────────────────────────────────────────────

export async function getCurriculos(academyId: string): Promise<CurriculoAcademia[]> {
  try {
    if (isMock()) {
      const { mockGetCurriculos } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetCurriculos(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('curriculos')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getCurriculos] error:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      modalidade: String(row.modalidade ?? ''),
      nome: String(row.nome ?? ''),
      descricao: String(row.descricao ?? ''),
      modulos: Array.isArray(row.modulos) ? row.modulos as ModuloCurriculo[] : [],
      progressoTurmas: Array.isArray(row.progresso_turmas) ? row.progresso_turmas as ProgressoTurma[] : [],
      criadoEm: String(row.created_at ?? ''),
      atualizadoEm: String(row.updated_at ?? ''),
    }));
  } catch (error) {
    console.error('[getCurriculos] Fallback:', error);
    return [];
  }
}

export async function getCurriculo(id: string): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockGetCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetCurriculo(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('curriculos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getCurriculo] error:', error?.message);
      return EMPTY_CURRICULO;
    }

    const row = data as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      modalidade: String(row.modalidade ?? ''),
      nome: String(row.nome ?? ''),
      descricao: String(row.descricao ?? ''),
      modulos: Array.isArray(row.modulos) ? row.modulos as ModuloCurriculo[] : [],
      progressoTurmas: Array.isArray(row.progresso_turmas) ? row.progresso_turmas as ProgressoTurma[] : [],
      criadoEm: String(row.created_at ?? ''),
      atualizadoEm: String(row.updated_at ?? ''),
    };
  } catch (error) {
    console.error('[getCurriculo] Fallback:', error);
    return EMPTY_CURRICULO;
  }
}

export async function createCurriculo(data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockCreateCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateCurriculo(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: created, error } = await supabase
      .from('curriculos')
      .insert({
        academy_id: data.academyId,
        modalidade: data.modalidade,
        nome: data.nome,
        descricao: data.descricao,
        modulos: data.modulos ?? [],
        progresso_turmas: data.progressoTurmas ?? [],
      })
      .select()
      .single();

    if (error || !created) {
      console.error('[createCurriculo] error:', error?.message);
      return EMPTY_CURRICULO;
    }

    const row = created as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      modalidade: String(row.modalidade ?? ''),
      nome: String(row.nome ?? ''),
      descricao: String(row.descricao ?? ''),
      modulos: Array.isArray(row.modulos) ? row.modulos as ModuloCurriculo[] : [],
      progressoTurmas: Array.isArray(row.progresso_turmas) ? row.progresso_turmas as ProgressoTurma[] : [],
      criadoEm: String(row.created_at ?? ''),
      atualizadoEm: String(row.updated_at ?? ''),
    };
  } catch (error) {
    console.error('[createCurriculo] Fallback:', error);
    return EMPTY_CURRICULO;
  }
}

export async function updateCurriculo(id: string, data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  try {
    if (isMock()) {
      const { mockUpdateCurriculo } = await import('@/lib/mocks/pedagogico.mock');
      return mockUpdateCurriculo(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.modalidade !== undefined) updatePayload.modalidade = data.modalidade;
    if (data.nome !== undefined) updatePayload.nome = data.nome;
    if (data.descricao !== undefined) updatePayload.descricao = data.descricao;
    if (data.modulos !== undefined) updatePayload.modulos = data.modulos;
    if (data.progressoTurmas !== undefined) updatePayload.progresso_turmas = data.progressoTurmas;

    const { data: updated, error } = await supabase
      .from('curriculos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      console.error('[updateCurriculo] error:', error?.message);
      return EMPTY_CURRICULO;
    }

    const row = updated as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      modalidade: String(row.modalidade ?? ''),
      nome: String(row.nome ?? ''),
      descricao: String(row.descricao ?? ''),
      modulos: Array.isArray(row.modulos) ? row.modulos as ModuloCurriculo[] : [],
      progressoTurmas: Array.isArray(row.progresso_turmas) ? row.progresso_turmas as ProgressoTurma[] : [],
      criadoEm: String(row.created_at ?? ''),
      atualizadoEm: String(row.updated_at ?? ''),
    };
  } catch (error) {
    console.error('[updateCurriculo] Fallback:', error);
    return EMPTY_CURRICULO;
  }
}

// ── Reuniões Pedagógicas ───────────────────────────────────────────

export async function getReunioes(academyId: string): Promise<ReuniaoPedagogica[]> {
  try {
    if (isMock()) {
      const { mockGetReunioes } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetReunioes(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reunioes_pedagogicas')
      .select('*')
      .eq('academy_id', academyId)
      .order('data', { ascending: false });

    if (error) {
      console.error('[getReunioes] error:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      data: String(row.data ?? ''),
      titulo: String(row.titulo ?? ''),
      status: (row.status as ReuniaoPedagogica['status']) ?? 'agendada',
      participantes: Array.isArray(row.participantes) ? row.participantes as ParticipanteReuniao[] : [],
      pauta: Array.isArray(row.pauta) ? row.pauta as PautaItem[] : [],
      ata: String(row.ata ?? ''),
      decisoes: Array.isArray(row.decisoes) ? row.decisoes as DecisaoReuniao[] : [],
      acoesDefinidas: Array.isArray(row.acoes_definidas) ? row.acoes_definidas as AcaoDefinida[] : [],
      criadoPor: String(row.criado_por ?? ''),
      criadoEm: String(row.created_at ?? ''),
    }));
  } catch (error) {
    console.error('[getReunioes] Fallback:', error);
    return [];
  }
}

export async function createReuniao(data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  try {
    if (isMock()) {
      const { mockCreateReuniao } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateReuniao(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: created, error } = await supabase
      .from('reunioes_pedagogicas')
      .insert({
        academy_id: data.academyId,
        data: data.data,
        titulo: data.titulo,
        status: data.status ?? 'agendada',
        participantes: data.participantes ?? [],
        pauta: data.pauta ?? [],
        ata: data.ata ?? '',
        decisoes: data.decisoes ?? [],
        acoes_definidas: data.acoesDefinidas ?? [],
        criado_por: data.criadoPor,
      })
      .select()
      .single();

    if (error || !created) {
      console.error('[createReuniao] error:', error?.message);
      return EMPTY_REUNIAO;
    }

    const row = created as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      data: String(row.data ?? ''),
      titulo: String(row.titulo ?? ''),
      status: (row.status as ReuniaoPedagogica['status']) ?? 'agendada',
      participantes: Array.isArray(row.participantes) ? row.participantes as ParticipanteReuniao[] : [],
      pauta: Array.isArray(row.pauta) ? row.pauta as PautaItem[] : [],
      ata: String(row.ata ?? ''),
      decisoes: Array.isArray(row.decisoes) ? row.decisoes as DecisaoReuniao[] : [],
      acoesDefinidas: Array.isArray(row.acoes_definidas) ? row.acoes_definidas as AcaoDefinida[] : [],
      criadoPor: String(row.criado_por ?? ''),
      criadoEm: String(row.created_at ?? ''),
    };
  } catch (error) {
    console.error('[createReuniao] Fallback:', error);
    return EMPTY_REUNIAO;
  }
}

export async function updateReuniao(id: string, data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  try {
    if (isMock()) {
      const { mockUpdateReuniao } = await import('@/lib/mocks/pedagogico.mock');
      return mockUpdateReuniao(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.data !== undefined) updatePayload.data = data.data;
    if (data.titulo !== undefined) updatePayload.titulo = data.titulo;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.participantes !== undefined) updatePayload.participantes = data.participantes;
    if (data.pauta !== undefined) updatePayload.pauta = data.pauta;
    if (data.ata !== undefined) updatePayload.ata = data.ata;
    if (data.decisoes !== undefined) updatePayload.decisoes = data.decisoes;
    if (data.acoesDefinidas !== undefined) updatePayload.acoes_definidas = data.acoesDefinidas;

    const { data: updated, error } = await supabase
      .from('reunioes_pedagogicas')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      console.error('[updateReuniao] error:', error?.message);
      return EMPTY_REUNIAO;
    }

    const row = updated as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      data: String(row.data ?? ''),
      titulo: String(row.titulo ?? ''),
      status: (row.status as ReuniaoPedagogica['status']) ?? 'agendada',
      participantes: Array.isArray(row.participantes) ? row.participantes as ParticipanteReuniao[] : [],
      pauta: Array.isArray(row.pauta) ? row.pauta as PautaItem[] : [],
      ata: String(row.ata ?? ''),
      decisoes: Array.isArray(row.decisoes) ? row.decisoes as DecisaoReuniao[] : [],
      acoesDefinidas: Array.isArray(row.acoes_definidas) ? row.acoes_definidas as AcaoDefinida[] : [],
      criadoPor: String(row.criado_por ?? ''),
      criadoEm: String(row.created_at ?? ''),
    };
  } catch (error) {
    console.error('[updateReuniao] Fallback:', error);
    return EMPTY_REUNIAO;
  }
}

// ── Ocorrências ────────────────────────────────────────────────────

export async function getOcorrencias(academyId: string): Promise<Ocorrencia[]> {
  try {
    if (isMock()) {
      const { mockGetOcorrencias } = await import('@/lib/mocks/pedagogico.mock');
      return mockGetOcorrencias(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*, aluno:aluno_id(full_name), turma:turma_id(nome), professor:professor_id(full_name)')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getOcorrencias] error:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => {
      const aluno = row.aluno as Record<string, unknown> | null;
      const turma = row.turma as Record<string, unknown> | null;
      const professor = row.professor as Record<string, unknown> | null;
      return {
        id: String(row.id ?? ''),
        academyId: String(row.academy_id ?? ''),
        alunoId: String(row.aluno_id ?? ''),
        alunoNome: aluno ? String(aluno.full_name ?? '') : '',
        turmaId: String(row.turma_id ?? ''),
        turmaNome: turma ? String(turma.nome ?? '') : '',
        professorId: String(row.professor_id ?? ''),
        professorNome: professor ? String(professor.full_name ?? '') : '',
        tipo: (row.tipo as Ocorrencia['tipo']) ?? 'observacao',
        gravidade: (row.gravidade as Ocorrencia['gravidade']) ?? 'leve',
        descricao: String(row.descricao ?? ''),
        acaoTomada: String(row.acao_tomada ?? ''),
        responsavelNotificado: Boolean(row.responsavel_notificado ?? false),
        data: String(row.data ?? ''),
        criadoEm: String(row.created_at ?? ''),
      };
    });
  } catch (error) {
    console.error('[getOcorrencias] Fallback:', error);
    return [];
  }
}

export async function createOcorrencia(data: Partial<Ocorrencia>): Promise<Ocorrencia> {
  try {
    if (isMock()) {
      const { mockCreateOcorrencia } = await import('@/lib/mocks/pedagogico.mock');
      return mockCreateOcorrencia(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: created, error } = await supabase
      .from('ocorrencias')
      .insert({
        academy_id: data.academyId,
        aluno_id: data.alunoId,
        turma_id: data.turmaId,
        professor_id: data.professorId,
        tipo: data.tipo ?? 'observacao',
        gravidade: data.gravidade ?? 'leve',
        descricao: data.descricao,
        acao_tomada: data.acaoTomada ?? '',
        responsavel_notificado: data.responsavelNotificado ?? false,
        data: data.data,
      })
      .select('*, aluno:aluno_id(full_name), turma:turma_id(nome), professor:professor_id(full_name)')
      .single();

    if (error || !created) {
      console.error('[createOcorrencia] error:', error?.message);
      return EMPTY_OCORRENCIA;
    }

    const row = created as Record<string, unknown>;
    const aluno = row.aluno as Record<string, unknown> | null;
    const turma = row.turma as Record<string, unknown> | null;
    const professor = row.professor as Record<string, unknown> | null;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      alunoId: String(row.aluno_id ?? ''),
      alunoNome: aluno ? String(aluno.full_name ?? '') : '',
      turmaId: String(row.turma_id ?? ''),
      turmaNome: turma ? String(turma.nome ?? '') : '',
      professorId: String(row.professor_id ?? ''),
      professorNome: professor ? String(professor.full_name ?? '') : '',
      tipo: (row.tipo as Ocorrencia['tipo']) ?? 'observacao',
      gravidade: (row.gravidade as Ocorrencia['gravidade']) ?? 'leve',
      descricao: String(row.descricao ?? ''),
      acaoTomada: String(row.acao_tomada ?? ''),
      responsavelNotificado: Boolean(row.responsavel_notificado ?? false),
      data: String(row.data ?? ''),
      criadoEm: String(row.created_at ?? ''),
    };
  } catch (error) {
    console.error('[createOcorrencia] Fallback:', error);
    return EMPTY_OCORRENCIA;
  }
}

// ── Relatório Mensal ───────────────────────────────────────────────

export async function gerarRelatorioPedagogico(academyId: string, mes: string): Promise<RelatorioPedagogicoMensal> {
  try {
    if (isMock()) {
      const { mockGerarRelatorioPedagogico } = await import('@/lib/mocks/pedagogico.mock');
      return mockGerarRelatorioPedagogico(academyId, mes);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('relatorios_pedagogicos')
      .select('*')
      .eq('academy_id', academyId)
      .eq('mes', mes)
      .single();

    if (error || !data) {
      console.error('[gerarRelatorioPedagogico] error:', error?.message);
      return EMPTY_RELATORIO;
    }

    const row = data as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academyId: String(row.academy_id ?? ''),
      mes: String(row.mes ?? ''),
      resumoExecutivo: String(row.resumo_executivo ?? ''),
      metricas: (row.metricas as MetricasRelatorio) ?? EMPTY_RELATORIO.metricas,
      porProfessor: Array.isArray(row.por_professor) ? row.por_professor as ProfessorRelatorio[] : [],
      alunosDestaque: Array.isArray(row.alunos_destaque) ? row.alunos_destaque as AlunoDestaque[] : [],
      alunosAtencao: Array.isArray(row.alunos_atencao) ? row.alunos_atencao as AlunoAtencaoRelatorio[] : [],
      metaProximoMes: Array.isArray(row.meta_proximo_mes) ? row.meta_proximo_mes as MetaProximoMes[] : [],
      geradoEm: String(row.created_at ?? ''),
    };
  } catch (error) {
    console.error('[gerarRelatorioPedagogico] Fallback:', error);
    return EMPTY_RELATORIO;
  }
}
