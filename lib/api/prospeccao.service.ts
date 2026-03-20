import { isMock } from '@/lib/env';

// --- Domain Types ---

export interface ProspectScore {
  geral: number;
  infraestrutura: number;
  presencaDigital: number;
  reputacao: number;
  potencialConversao: number;
}

export interface ProspectEstimativas {
  alunosEstimados: number;
  faturamentoEstimado: number;
  ticketMedio: number;
  marketShare: number;
}

export interface ProspectReview {
  autor: string;
  nota: number;
  texto: string;
  data: string;
  plataforma: string;
}

export interface ProspectAnalise {
  pontosFortes: string[];
  pontosFracos: string[];
  oportunidades: string[];
  ameacas: string[];
}

export interface ProspectAbordagem {
  canal: string;
  mensagemSugerida: string;
  melhorHorario: string;
  argumentos: string[];
  objecoesPrevistas: string[];
}

export interface ProspectCRM {
  status: string;
  ultimoContato?: string;
  proximoContato?: string;
  historicoContatos: {
    data: string;
    canal: string;
    resumo: string;
    resultado: string;
  }[];
  observacoes: string[];
  responsavel?: string;
  motivoPerda?: string;
}

export interface AcademiaProspectada {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email?: string;
  website?: string;
  instagram?: string;
  googleMapsUrl?: string;
  notaGoogle: number;
  totalAvaliacoes: number;
  modalidades: string[];
  horarioFuncionamento: string;
  fotos: string[];
  score: ProspectScore;
  estimativas: ProspectEstimativas;
  reviews: ProspectReview[];
  analise: ProspectAnalise;
  abordagem: ProspectAbordagem;
  crm: ProspectCRM;
  classificacao: 'quente' | 'morno' | 'frio';
  distanciaKm?: number;
  criadoEm: string;
  atualizadoEm: string;
}

// --- Service Types ---

export interface BuscaProspeccao {
  query?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  raioKm?: number;
  modalidades?: string[];
  minNota?: number;
  maxResultados?: number;
  classificacao?: 'quente' | 'morno' | 'frio';
  status?: string;
}

export interface ResultadoBusca {
  total: number;
  academias: AcademiaProspectada[];
  buscaRealizada: string;
  tempo: number;
  filtrosAplicados: string[];
}

export interface ResultadoBuscaReal {
  prospects: AcademiaProspectada[];
  fromCache: boolean;
  cacheAge?: string;
  totalEncontrados: number;
  analisadosPorIA: boolean;
}

export interface ProspeccaoDashboard {
  totalProspects: number;
  porStatus: {
    novo: number;
    contactado: number;
    interessado: number;
    demoAgendada: number;
    negociando: number;
    fechado: number;
    perdido: number;
  };
  taxaConversao: number;
  tempoMedioFechamento: number;
  mrrClientes: number;
  ultimasBuscas: { query: string; resultados: number; data: string }[];
  proximosContatos: { academia: string; data: string; canal: string }[];
  regioes: {
    bairro: string;
    cidade: string;
    estado: string;
    academias: number;
    quentes: number;
    mornos: number;
    frios: number;
  }[];
  // Analytics
  funnelData: { stage: string; count: number; percentage: number }[];
  weeklyData: { semana: string; novos: number; contatos: number; demos: number; fechados: number }[];
  scoreDistribution: { classificacao: string; count: number; percentage: number }[];
  canaisEficacia: { canal: string; taxaResposta: number; contatos: number }[];
  topObjecoes: { motivo: string; percentage: number; count: number }[];
}

export interface ContatoInput {
  data: string;
  canal: string;
  resumo: string;
  resultado: string;
}

// --- Helper ---

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const EMPTY_RESULTADO_BUSCA: ResultadoBusca = {
  total: 0,
  academias: [],
  buscaRealizada: '',
  tempo: 0,
  filtrosAplicados: [],
};

const EMPTY_DASHBOARD: ProspeccaoDashboard = {
  totalProspects: 0,
  porStatus: { novo: 0, contactado: 0, interessado: 0, demoAgendada: 0, negociando: 0, fechado: 0, perdido: 0 },
  taxaConversao: 0,
  tempoMedioFechamento: 0,
  mrrClientes: 0,
  ultimasBuscas: [],
  proximosContatos: [],
  regioes: [],
  funnelData: [],
  weeklyData: [],
  scoreDistribution: [],
  canaisEficacia: [],
  topObjecoes: [],
};

const EMPTY_PROSPECT: AcademiaProspectada = {
  id: '',
  nome: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  telefone: '',
  notaGoogle: 0,
  totalAvaliacoes: 0,
  modalidades: [],
  horarioFuncionamento: '',
  fotos: [],
  score: { geral: 0, infraestrutura: 0, presencaDigital: 0, reputacao: 0, potencialConversao: 0 },
  estimativas: { alunosEstimados: 0, faturamentoEstimado: 0, ticketMedio: 0, marketShare: 0 },
  reviews: [],
  analise: { pontosFortes: [], pontosFracos: [], oportunidades: [], ameacas: [] },
  abordagem: { canal: '', mensagemSugerida: '', melhorHorario: '', argumentos: [], objecoesPrevistas: [] },
  crm: { status: '', historicoContatos: [], observacoes: [] },
  classificacao: 'frio',
  criadoEm: '',
  atualizadoEm: '',
};

// --- Service Functions ---

export async function buscarAcademias(params: BuscaProspeccao): Promise<ResultadoBusca> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay();

      const inicio = Date.now();
      const filtrosAplicados: string[] = [];
      let resultados = [...MOCK_ACADEMIAS_PROSPECTADAS];

      if (params.query) {
        const q = params.query.toLowerCase();
        filtrosAplicados.push(`query: "${params.query}"`);
        resultados = resultados.filter(
          (a) =>
            a.nome.toLowerCase().includes(q) ||
            a.endereco.toLowerCase().includes(q) ||
            a.bairro.toLowerCase().includes(q) ||
            a.modalidades.some((m) => m.toLowerCase().includes(q)),
        );
      }

      if (params.cidade) {
        filtrosAplicados.push(`cidade: ${params.cidade}`);
        resultados = resultados.filter(
          (a) => a.cidade.toLowerCase() === params.cidade!.toLowerCase(),
        );
      }

      if (params.estado) {
        filtrosAplicados.push(`estado: ${params.estado}`);
        resultados = resultados.filter(
          (a) => a.estado.toLowerCase() === params.estado!.toLowerCase(),
        );
      }

      if (params.bairro) {
        filtrosAplicados.push(`bairro: ${params.bairro}`);
        resultados = resultados.filter(
          (a) => a.bairro.toLowerCase().includes(params.bairro!.toLowerCase()),
        );
      }

      if (params.modalidades && params.modalidades.length > 0) {
        filtrosAplicados.push(`modalidades: ${params.modalidades.join(', ')}`);
        resultados = resultados.filter((a) =>
          params.modalidades!.some((m) =>
            a.modalidades.some((am) => am.toLowerCase().includes(m.toLowerCase())),
          ),
        );
      }

      if (params.minNota !== undefined) {
        filtrosAplicados.push(`nota >= ${params.minNota}`);
        resultados = resultados.filter((a) => a.notaGoogle >= params.minNota!);
      }

      if (params.classificacao) {
        filtrosAplicados.push(`classificacao: ${params.classificacao}`);
        resultados = resultados.filter((a) => a.classificacao === params.classificacao);
      }

      if (params.status) {
        filtrosAplicados.push(`status: ${params.status}`);
        resultados = resultados.filter((a) => a.crm.status === params.status);
      }

      if (params.maxResultados) {
        resultados = resultados.slice(0, params.maxResultados);
      }

      const tempo = Date.now() - inicio;

      return {
        total: resultados.length,
        academias: resultados,
        buscaRealizada: params.query ?? 'todos',
        tempo,
        filtrosAplicados,
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const inicio = Date.now();
    const filtrosAplicados: string[] = [];

    let query = supabase.from('prospects').select('*');

    if (params.query) {
      filtrosAplicados.push(`query: "${params.query}"`);
      query = query.or(`nome.ilike.%${params.query}%,endereco.ilike.%${params.query}%,bairro.ilike.%${params.query}%`);
    }
    if (params.cidade) {
      filtrosAplicados.push(`cidade: ${params.cidade}`);
      query = query.ilike('cidade', params.cidade);
    }
    if (params.estado) {
      filtrosAplicados.push(`estado: ${params.estado}`);
      query = query.ilike('estado', params.estado);
    }
    if (params.bairro) {
      filtrosAplicados.push(`bairro: ${params.bairro}`);
      query = query.ilike('bairro', `%${params.bairro}%`);
    }
    if (params.minNota !== undefined) {
      filtrosAplicados.push(`nota >= ${params.minNota}`);
      query = query.gte('nota_google', params.minNota);
    }
    if (params.classificacao) {
      filtrosAplicados.push(`classificacao: ${params.classificacao}`);
      query = query.eq('classificacao', params.classificacao);
    }
    if (params.status) {
      filtrosAplicados.push(`status: ${params.status}`);
      query = query.eq('crm_status', params.status);
    }
    if (params.maxResultados) {
      query = query.limit(params.maxResultados);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[buscarAcademias] error:', error.message);
      return { ...EMPTY_RESULTADO_BUSCA, buscaRealizada: params.query ?? 'todos' };
    }

    const academias: AcademiaProspectada[] = (data ?? []).map((row: Record<string, unknown>) => mapRowToProspect(row));
    const tempo = Date.now() - inicio;

    return {
      total: academias.length,
      academias,
      buscaRealizada: params.query ?? 'todos',
      tempo,
      filtrosAplicados,
    };
  } catch (error) {
    console.warn('[buscarAcademias] Fallback:', error);
    return { ...EMPTY_RESULTADO_BUSCA, buscaRealizada: params.query ?? 'todos' };
  }
}

export async function getProspects(filters?: BuscaProspeccao): Promise<AcademiaProspectada[]> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay();

      if (!filters) return MOCK_ACADEMIAS_PROSPECTADAS;

      let resultados = [...MOCK_ACADEMIAS_PROSPECTADAS];

      if (filters.classificacao) {
        resultados = resultados.filter((a) => a.classificacao === filters.classificacao);
      }
      if (filters.status) {
        resultados = resultados.filter((a) => a.crm.status === filters.status);
      }
      if (filters.cidade) {
        resultados = resultados.filter(
          (a) => a.cidade.toLowerCase() === filters.cidade!.toLowerCase(),
        );
      }
      if (filters.estado) {
        resultados = resultados.filter(
          (a) => a.estado.toLowerCase() === filters.estado!.toLowerCase(),
        );
      }

      return resultados;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('prospects').select('*');

    if (filters?.classificacao) query = query.eq('classificacao', filters.classificacao);
    if (filters?.status) query = query.eq('crm_status', filters.status);
    if (filters?.cidade) query = query.ilike('cidade', filters.cidade);
    if (filters?.estado) query = query.ilike('estado', filters.estado);

    const { data, error } = await query;
    if (error) {
      console.warn('[getProspects] error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapRowToProspect(row));
  } catch (error) {
    console.warn('[getProspects] Fallback:', error);
    return [];
  }
}

export async function getProspect(id: string): Promise<AcademiaProspectada> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay();

      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === id);
      if (!prospect) {
        console.warn('[getProspect] Prospect não encontrado:', id);
        return { ...EMPTY_PROSPECT, id };
      }
      return prospect;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.from('prospects').select('*').eq('id', id).single();
    if (error) {
      console.warn('[getProspect] error:', error.message);
      return { ...EMPTY_PROSPECT, id };
    }

    return mapRowToProspect(data);
  } catch (error) {
    console.warn('[getProspect] Fallback:', error);
    return { ...EMPTY_PROSPECT, id };
  }
}

export async function updateStatus(id: string, status: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('prospects')
      .update({ crm_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('[updateStatus] error:', error.message);
    }
  } catch (error) {
    console.warn('[updateStatus] Fallback:', error);
  }
}

export async function addContato(id: string, contato: ContatoInput): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('prospect_contatos')
      .insert({ prospect_id: id, data: contato.data, canal: contato.canal, resumo: contato.resumo, resultado: contato.resultado });

    if (error) {
      console.warn('[addContato] error:', error.message);
    }
  } catch (error) {
    console.warn('[addContato] Fallback:', error);
  }
}

export async function addObservacao(id: string, texto: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('prospect_observacoes')
      .insert({ prospect_id: id, texto });

    if (error) {
      console.warn('[addObservacao] error:', error.message);
    }
  } catch (error) {
    console.warn('[addObservacao] Fallback:', error);
  }
}

export async function agendarContato(id: string, data: string, canal: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('prospects')
      .update({ proximo_contato: data, proximo_contato_canal: canal, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('[agendarContato] error:', error.message);
    }
  } catch (error) {
    console.warn('[agendarContato] Fallback:', error);
  }
}

export async function getProspeccaoDashboard(): Promise<ProspeccaoDashboard> {
  try {
    if (isMock()) {
      const { MOCK_DASHBOARD } = await import('@/lib/mocks/prospeccao.mock');
      await delay();
      return MOCK_DASHBOARD;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.from('prospects').select('crm_status, classificacao, cidade, estado, bairro');
    if (error) {
      console.warn('[getProspeccaoDashboard] error:', error.message);
      return EMPTY_DASHBOARD;
    }

    const rows = data ?? [];
    const total = rows.length;
    const statusCounts = { novo: 0, contactado: 0, interessado: 0, demoAgendada: 0, negociando: 0, fechado: 0, perdido: 0 };
    for (const r of rows) {
      const s = (r as Record<string, unknown>).crm_status as string;
      if (s in statusCounts) statusCounts[s as keyof typeof statusCounts]++;
    }
    const fechado = statusCounts.fechado;
    const taxaConversao = total > 0 ? Math.round((fechado / total) * 100) : 0;

    return {
      ...EMPTY_DASHBOARD,
      totalProspects: total,
      porStatus: statusCounts,
      taxaConversao,
    };
  } catch (error) {
    console.warn('[getProspeccaoDashboard] Fallback:', error);
    return EMPTY_DASHBOARD;
  }
}

export async function exportarCSV(filters?: BuscaProspeccao): Promise<string> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay();

      let dados = [...MOCK_ACADEMIAS_PROSPECTADAS];

      if (filters?.classificacao) {
        dados = dados.filter((a) => a.classificacao === filters.classificacao);
      }
      if (filters?.status) {
        dados = dados.filter((a) => a.crm.status === filters.status);
      }
      if (filters?.cidade) {
        dados = dados.filter(
          (a) => a.cidade.toLowerCase() === filters.cidade!.toLowerCase(),
        );
      }
      if (filters?.estado) {
        dados = dados.filter(
          (a) => a.estado.toLowerCase() === filters.estado!.toLowerCase(),
        );
      }

      const header = 'nome,telefone,instagram,bairro,score,classificacao,status';
      const rows = dados.map(
        (a) =>
          `"${a.nome}","${a.telefone}","${a.instagram ?? ''}","${a.bairro}",${a.score.geral},"${a.classificacao}","${a.crm.status}"`,
      );

      return [header, ...rows].join('\n');
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('prospects').select('*');

    if (filters?.classificacao) query = query.eq('classificacao', filters.classificacao);
    if (filters?.status) query = query.eq('crm_status', filters.status);
    if (filters?.cidade) query = query.ilike('cidade', filters.cidade);
    if (filters?.estado) query = query.ilike('estado', filters.estado);

    const { data, error } = await query;
    if (error) {
      console.warn('[exportarCSV] error:', error.message);
      return 'nome,telefone,instagram,bairro,score,classificacao,status';
    }

    const academias = (data ?? []).map((row: Record<string, unknown>) => mapRowToProspect(row));
    const header = 'nome,telefone,instagram,bairro,score,classificacao,status';
    const csvRows = academias.map(
      (a: AcademiaProspectada) =>
        `"${a.nome}","${a.telefone}","${a.instagram ?? ''}","${a.bairro}",${a.score.geral},"${a.classificacao}","${a.crm.status}"`,
    );

    return [header, ...csvRows].join('\n');
  } catch (error) {
    console.warn('[exportarCSV] Fallback:', error);
    return 'nome,telefone,instagram,bairro,score,classificacao,status';
  }
}

export async function enriquecerAcademia(prospectId: string): Promise<AcademiaProspectada> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay(500);
      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === prospectId);
      if (!prospect) {
        console.warn('[enriquecerAcademia] Prospect não encontrado:', prospectId);
        return { ...EMPTY_PROSPECT, id: prospectId };
      }
      return prospect;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.from('prospects').select('*').eq('id', prospectId).single();
    if (error) {
      console.warn('[enriquecerAcademia] error:', error.message);
      return { ...EMPTY_PROSPECT, id: prospectId };
    }

    return mapRowToProspect(data);
  } catch (error) {
    console.warn('[enriquecerAcademia] Fallback:', error);
    return { ...EMPTY_PROSPECT, id: prospectId };
  }
}

export async function regenerarMensagem(prospectId: string, canal: string, _contexto?: string): Promise<string> {
  try {
    if (isMock()) {
      await delay(400);
      const msgs: Record<string, string> = {
        whatsapp: `Ola! Sou da BlackBelt, plataforma de gestao para academias de artes marciais. Vi que sua academia tem otima reputacao e gostaria de mostrar como podemos ajudar a crescer ainda mais. Podemos conversar?`,
        instagram: `Oi! Parabens pelo trabalho incrivel na academia! Somos da BlackBelt e ajudamos academias como a sua a crescer com tecnologia. Posso te mostrar como funciona?`,
        email: `Prezado(a), sou da BlackBelt, plataforma lider em gestao para academias de artes marciais. Gostaria de apresentar como podemos otimizar a gestao da sua academia e aumentar a retencao de alunos. Podemos agendar uma demonstracao?`,
      };
      return msgs[canal.toLowerCase()] ?? msgs.whatsapp;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Try to get the prospect data for context
    const { data } = await supabase.from('prospects').select('nome, modalidades').eq('id', prospectId).single();
    const nome = (data as Record<string, unknown> | null)?.nome ?? 'sua academia';

    const fallbackMsgs: Record<string, string> = {
      whatsapp: `Ola! Sou da BlackBelt, plataforma de gestao para academias. Vi que ${nome} tem otima reputacao e gostaria de mostrar como podemos ajudar a crescer ainda mais. Podemos conversar?`,
      instagram: `Oi! Parabens pelo trabalho incrivel na ${nome}! Somos da BlackBelt e ajudamos academias a crescer com tecnologia. Posso te mostrar como funciona?`,
      email: `Prezado(a), sou da BlackBelt. Gostaria de apresentar como podemos otimizar a gestao da ${nome} e aumentar a retencao de alunos. Podemos agendar uma demonstracao?`,
    };

    return fallbackMsgs[canal.toLowerCase()] ?? fallbackMsgs.whatsapp;
  } catch (error) {
    console.warn('[regenerarMensagem] Fallback:', error);
    return `Ola! Sou da BlackBelt, plataforma de gestao para academias. Gostaria de mostrar como podemos ajudar sua academia a crescer. Podemos conversar?`;
  }
}

// --- Row mapper ---

function mapRowToProspect(row: Record<string, unknown>): AcademiaProspectada {
  return {
    id: (row.id as string) ?? '',
    nome: (row.nome as string) ?? '',
    endereco: (row.endereco as string) ?? '',
    bairro: (row.bairro as string) ?? '',
    cidade: (row.cidade as string) ?? '',
    estado: (row.estado as string) ?? '',
    telefone: (row.telefone as string) ?? '',
    email: row.email as string | undefined,
    website: row.website as string | undefined,
    instagram: row.instagram as string | undefined,
    googleMapsUrl: row.google_maps_url as string | undefined,
    notaGoogle: (row.nota_google as number) ?? 0,
    totalAvaliacoes: (row.total_avaliacoes as number) ?? 0,
    modalidades: (row.modalidades as string[]) ?? [],
    horarioFuncionamento: (row.horario_funcionamento as string) ?? '',
    fotos: (row.fotos as string[]) ?? [],
    score: (row.score as ProspectScore) ?? { geral: 0, infraestrutura: 0, presencaDigital: 0, reputacao: 0, potencialConversao: 0 },
    estimativas: (row.estimativas as ProspectEstimativas) ?? { alunosEstimados: 0, faturamentoEstimado: 0, ticketMedio: 0, marketShare: 0 },
    reviews: (row.reviews as ProspectReview[]) ?? [],
    analise: (row.analise as ProspectAnalise) ?? { pontosFortes: [], pontosFracos: [], oportunidades: [], ameacas: [] },
    abordagem: (row.abordagem as ProspectAbordagem) ?? { canal: '', mensagemSugerida: '', melhorHorario: '', argumentos: [], objecoesPrevistas: [] },
    crm: (row.crm as ProspectCRM) ?? { status: (row.crm_status as string) ?? '', historicoContatos: [], observacoes: [] },
    classificacao: ((row.classificacao as string) ?? 'frio') as 'quente' | 'morno' | 'frio',
    distanciaKm: row.distancia_km as number | undefined,
    criadoEm: (row.created_at as string) ?? '',
    atualizadoEm: (row.updated_at as string) ?? '',
  };
}
