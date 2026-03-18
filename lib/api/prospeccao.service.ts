import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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

    try {
      const res = await fetch('/api/prospeccao/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: params.query,
          cidade: params.cidade,
          bairro: params.bairro,
          raioKm: params.raioKm,
        }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.buscar');
      return res.json();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.buscar] API not available, using mock data');
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');

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
  } catch (error) {
    handleServiceError(error, 'prospeccao.buscar');
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

    try {
      const queryParams = filters
        ? '?' + new URLSearchParams(
            Object.entries(filters)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)]),
          ).toString()
        : '';
      const res = await fetch(`/api/prospeccao/prospects${queryParams}`);
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.getProspects');
      return res.json();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.getProspects] API not available, using mock data');
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');

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
  } catch (error) {
    handleServiceError(error, 'prospeccao.getProspects');
  }
}

export async function getProspect(id: string): Promise<AcademiaProspectada> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay();

      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === id);
      if (!prospect) throw new ServiceError(404, 'prospeccao.getProspect', `Prospect ${id} não encontrado`);
      return prospect;
    }

    try {
      const res = await fetch(`/api/prospeccao/prospects/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.getProspect');
      return res.json();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.getProspect] API not available, using mock data');
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');

      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === id);
      if (!prospect) throw new ServiceError(404, 'prospeccao.getProspect', `Prospect ${id} não encontrado`);
      return prospect;
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.getProspect');
  }
}

export async function updateStatus(id: string, status: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    try {
      const res = await fetch(`/api/prospeccao/prospects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.updateStatus');
    } catch {
      // Fallback: no-op until API routes are implemented
      console.warn('[prospeccao.updateStatus] API not available, operation skipped');
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.updateStatus');
  }
}

export async function addContato(id: string, contato: ContatoInput): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    try {
      const res = await fetch(`/api/prospeccao/prospects/${id}/contatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contato),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.addContato');
    } catch {
      // Fallback: no-op until API routes are implemented
      console.warn('[prospeccao.addContato] API not available, operation skipped');
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.addContato');
  }
}

export async function addObservacao(id: string, texto: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    try {
      const res = await fetch(`/api/prospeccao/prospects/${id}/observacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.addObservacao');
    } catch {
      // Fallback: no-op until API routes are implemented
      console.warn('[prospeccao.addObservacao] API not available, operation skipped');
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.addObservacao');
  }
}

export async function agendarContato(id: string, data: string, canal: string): Promise<void> {
  try {
    if (isMock()) {
      await delay();
      // No-op for mock — in production, persists to database
      return;
    }

    try {
      const res = await fetch(`/api/prospeccao/prospects/${id}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, canal }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.agendarContato');
    } catch {
      // Fallback: no-op until API routes are implemented
      console.warn('[prospeccao.agendarContato] API not available, operation skipped');
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.agendarContato');
  }
}

export async function getProspeccaoDashboard(): Promise<ProspeccaoDashboard> {
  try {
    if (isMock()) {
      const { MOCK_DASHBOARD } = await import('@/lib/mocks/prospeccao.mock');
      await delay();
      return MOCK_DASHBOARD;
    }

    try {
      const res = await fetch('/api/prospeccao/dashboard');
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.dashboard');
      return res.json();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.getProspeccaoDashboard] API not available, using mock data');
      const { MOCK_DASHBOARD } = await import('@/lib/mocks/prospeccao.mock');
      return MOCK_DASHBOARD;
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.dashboard');
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

    try {
      const queryParams = filters
        ? '?' + new URLSearchParams(
            Object.entries(filters)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)]),
          ).toString()
        : '';
      const res = await fetch(`/api/prospeccao/exportar${queryParams}`);
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.exportarCSV');
      return res.text();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.exportarCSV] API not available, using mock data');
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');

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
  } catch (error) {
    handleServiceError(error, 'prospeccao.exportarCSV');
  }
}

export async function enriquecerAcademia(prospectId: string): Promise<AcademiaProspectada> {
  try {
    if (isMock()) {
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      await delay(500);
      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === prospectId);
      if (!prospect) throw new ServiceError(404, 'prospeccao.enriquecer', `Prospect ${prospectId} não encontrado`);
      return prospect;
    }

    try {
      const res = await fetch('/api/prospeccao/enriquecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.enriquecer');
      return res.json();
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.enriquecer] API not available, using mock data');
      const { MOCK_ACADEMIAS_PROSPECTADAS } = await import('@/lib/mocks/prospeccao.mock');
      const prospect = MOCK_ACADEMIAS_PROSPECTADAS.find((a) => a.id === prospectId);
      if (!prospect) throw new ServiceError(404, 'prospeccao.enriquecer', `Prospect ${prospectId} não encontrado`);
      return prospect;
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.enriquecer');
  }
}

export async function regenerarMensagem(prospectId: string, canal: string, contexto?: string): Promise<string> {
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

    try {
      const res = await fetch('/api/prospeccao/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, canal, contexto }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'prospeccao.mensagem');
      const data = await res.json();
      return data.mensagem ?? data;
    } catch {
      // Fallback to mock until API routes are implemented
      console.warn('[prospeccao.mensagem] API not available, using mock data');
      return `Ola! Sou da BlackBelt, plataforma de gestao para academias. Gostaria de mostrar como podemos ajudar sua academia a crescer. Podemos conversar?`;
    }
  } catch (error) {
    handleServiceError(error, 'prospeccao.mensagem');
  }
}
