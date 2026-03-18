import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ─── Interfaces ───────────────────────────────────────────────

export interface FaixaBase {
  id: string;
  nome: string;
  slug: string;
  minAlunos: number;
  maxAlunos: number;
  precoMensal: number;
  precoAnual: number;
  professoresInclusos: number;
  turmasInclusas: number;
  unidadesInclusas: number;
}

export interface Modulo {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  precoMensal: number;
  precoAnual: number;
  features: string[];
  dependeDe?: string[];
  categoria: 'operacao' | 'ensino' | 'engajamento' | 'comercial' | 'avancado';
  destaque: boolean;
  ordem: number;
}

export interface PacoteSugerido {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  icone: string;
  modulosSlugs: string[];
  descontoPercent: number;
  precoOriginal: number;
  precoComDesconto: number;
  popular: boolean;
}

export interface PlanoMontado {
  faixaBase: FaixaBase;
  modulosSelecionados: Modulo[];
  professoresAdicionais: number;
  unidadesAdicionais: number;
  ciclo: 'mensal' | 'anual';
  pacoteAplicado?: PacoteSugerido;
  precoBase: number;
  precoModulos: number;
  precoProfessoresExtra: number;
  precoUnidadesExtra: number;
  subtotal: number;
  descontoPacote: number;
  descontoAnual: number;
  total: number;
  totalAnual: number;
  economiaAnual: number;
}

export interface UsoDescoberta {
  moduloSlug: string;
  moduloNome: string;
  vezesUsado: number;
  ultimoUso: string;
  inclusoNoPlano: boolean;
}

export interface Cobranca {
  id: string;
  data: string;
  valor: number;
  descricao: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  metodo: string;
}

export interface ModuloExtra {
  slug: string;
  nome: string;
  icone: string;
  precoMensal: number;
  vezesUsado: number;
  diasRestantes: number;
}

export interface SimulacaoUpgrade {
  modulosNovos: Modulo[];
  custoAdicional: number;
  totalNovo: number;
  economiaComPacote?: number;
  pacoteSugerido?: PacoteSugerido;
}

export interface AssinaturaSaaS {
  id: string;
  academyId: string;
  tierId: string;
  modulosPagos: string[];
  professoresAdicionais: number;
  unidadesAdicionais: number;
  ciclo: 'mensal' | 'anual';
  pacoteId?: string;
  precoTotal: number;
  status: 'trial' | 'discovery' | 'full' | 'suspended' | 'cancelled' | 'past_due';
  trialStartedAt: string;
  trialEndsAt: string;
  discoveryEndsAt: string;
  planStartedAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  modulosAtivos: string[];
  emPeriodoDescoberta: boolean;
  diasRestantesDescoberta: number;
  usoDescoberta: UsoDescoberta[];
}

// ─── CalcConfig (used by calcularPlano) ───────────────────────

interface CalcConfig {
  faixa: FaixaBase;
  modulos: Modulo[];
  professoresAdicionais: number;
  unidadesAdicionais: number;
  ciclo: 'mensal' | 'anual';
  pacote?: PacoteSugerido;
}

// ─── Pure function (no API call, no mock) ─────────────────────

export function calcularPlano(config: CalcConfig): PlanoMontado {
  const precoBase = config.ciclo === 'anual' ? config.faixa.precoAnual : config.faixa.precoMensal;

  let precoModulos = config.modulos.reduce(
    (sum, m) => sum + (config.ciclo === 'anual' ? m.precoAnual : m.precoMensal),
    0,
  );

  const precoProfessoresExtra = config.professoresAdicionais * 29;
  const precoUnidadesExtra = config.unidadesAdicionais * 49;

  let descontoPacote = 0;
  if (config.pacote) {
    descontoPacote = precoModulos * (config.pacote.descontoPercent / 100);
    precoModulos -= descontoPacote;
  }

  const subtotal = precoBase + precoModulos + precoProfessoresExtra + precoUnidadesExtra;
  const descontoAnual = 0; // already factored into precoAnual
  const total = subtotal;
  const totalAnual = total * 12;

  const mensal = config.ciclo === 'mensal'
    ? config.faixa.precoMensal
      + config.modulos.reduce((s, m) => s + m.precoMensal, 0)
      + precoProfessoresExtra
      + precoUnidadesExtra
    : total;

  const economiaAnual = config.ciclo === 'anual' ? (mensal * 12) - totalAnual : 0;

  return {
    faixaBase: config.faixa,
    modulosSelecionados: config.modulos,
    professoresAdicionais: config.professoresAdicionais,
    unidadesAdicionais: config.unidadesAdicionais,
    ciclo: config.ciclo,
    pacoteAplicado: config.pacote,
    precoBase,
    precoModulos,
    precoProfessoresExtra,
    precoUnidadesExtra,
    subtotal,
    descontoPacote,
    descontoAnual,
    total,
    totalAnual,
    economiaAnual,
  };
}

// ─── API functions ────────────────────────────────────────────

export async function getFaixas(): Promise<FaixaBase[]> {
  try {
    if (isMock()) {
      const { mockGetFaixas } = await import('@/lib/mocks/pricing.mock');
      return mockGetFaixas();
    }
    try {
      const res = await fetch('/api/pricing/tiers');
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getFaixas');
      return res.json();
    } catch {
      console.warn('[pricing.getFaixas] API not available, using mock fallback');
      const { mockGetFaixas } = await import('@/lib/mocks/pricing.mock');
      return mockGetFaixas();
    }
  } catch (error) { handleServiceError(error, 'pricing.getFaixas'); }
}

export async function getModulos(): Promise<Modulo[]> {
  try {
    if (isMock()) {
      const { mockGetModulos } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulos();
    }
    try {
      const res = await fetch('/api/pricing/modules');
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getModulos');
      return res.json();
    } catch {
      console.warn('[pricing.getModulos] API not available, using mock fallback');
      const { mockGetModulos } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulos();
    }
  } catch (error) { handleServiceError(error, 'pricing.getModulos'); }
}

export async function getPacotes(): Promise<PacoteSugerido[]> {
  try {
    if (isMock()) {
      const { mockGetPacotes } = await import('@/lib/mocks/pricing.mock');
      return mockGetPacotes();
    }
    try {
      const res = await fetch('/api/pricing/packages');
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getPacotes');
      return res.json();
    } catch {
      console.warn('[pricing.getPacotes] API not available, using mock fallback');
      const { mockGetPacotes } = await import('@/lib/mocks/pricing.mock');
      return mockGetPacotes();
    }
  } catch (error) { handleServiceError(error, 'pricing.getPacotes'); }
}

export async function getAssinatura(academyId: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockGetAssinatura } = await import('@/lib/mocks/pricing.mock');
      return mockGetAssinatura(academyId);
    }
    try {
      const res = await fetch(`/api/pricing/subscription?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getAssinatura');
      return res.json();
    } catch {
      console.warn('[pricing.getAssinatura] API not available, using mock fallback');
      const { mockGetAssinatura } = await import('@/lib/mocks/pricing.mock');
      return mockGetAssinatura(academyId);
    }
  } catch (error) { handleServiceError(error, 'pricing.getAssinatura'); }
}

export async function ativarModulo(academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockAtivarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockAtivarModulo(academyId, moduloSlug);
    }
    try {
      const res = await fetch('/api/pricing/modules/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, moduloSlug }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'pricing.ativarModulo');
      return res.json();
    } catch {
      console.warn('[pricing.ativarModulo] API not available, using mock fallback');
      const { mockAtivarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockAtivarModulo(academyId, moduloSlug);
    }
  } catch (error) { handleServiceError(error, 'pricing.ativarModulo'); }
}

export async function desativarModulo(academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockDesativarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockDesativarModulo(academyId, moduloSlug);
    }
    try {
      const res = await fetch('/api/pricing/modules/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, moduloSlug }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'pricing.desativarModulo');
      return res.json();
    } catch {
      console.warn('[pricing.desativarModulo] API not available, using mock fallback');
      const { mockDesativarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockDesativarModulo(academyId, moduloSlug);
    }
  } catch (error) { handleServiceError(error, 'pricing.desativarModulo'); }
}

export async function getHistoricoCobrancas(academyId: string): Promise<Cobranca[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoCobrancas } = await import('@/lib/mocks/pricing.mock');
      return mockGetHistoricoCobrancas(academyId);
    }
    try {
      const res = await fetch(`/api/pricing/billing?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getHistoricoCobrancas');
      return res.json();
    } catch {
      console.warn('[pricing.getHistoricoCobrancas] API not available, using mock fallback');
      const { mockGetHistoricoCobrancas } = await import('@/lib/mocks/pricing.mock');
      return mockGetHistoricoCobrancas(academyId);
    }
  } catch (error) { handleServiceError(error, 'pricing.getHistoricoCobrancas'); }
}

export async function getUsoDescoberta(academyId: string): Promise<UsoDescoberta[]> {
  try {
    if (isMock()) {
      const { mockGetUsoDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetUsoDescoberta(academyId);
    }
    try {
      const res = await fetch(`/api/pricing/discovery-usage?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getUsoDescoberta');
      return res.json();
    } catch {
      console.warn('[pricing.getUsoDescoberta] API not available, using mock fallback');
      const { mockGetUsoDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetUsoDescoberta(academyId);
    }
  } catch (error) { handleServiceError(error, 'pricing.getUsoDescoberta'); }
}

export async function isModuloAcessivel(academyId: string, moduloSlug: string): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockIsModuloAcessivel } = await import('@/lib/mocks/pricing.mock');
      return mockIsModuloAcessivel(academyId, moduloSlug);
    }
    try {
      const res = await fetch(`/api/pricing/module-access?academyId=${academyId}&module=${moduloSlug}`);
      if (!res.ok) throw new ServiceError(res.status, 'pricing.isModuloAcessivel');
      const data = await res.json();
      return data.accessible;
    } catch {
      console.warn('[pricing.isModuloAcessivel] API not available, using fallback');
      return false;
    }
  } catch (error) { handleServiceError(error, 'pricing.isModuloAcessivel'); }
}

export async function getModulosExtrasDescoberta(academyId: string): Promise<ModuloExtra[]> {
  try {
    if (isMock()) {
      const { mockGetModulosExtrasDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulosExtrasDescoberta(academyId);
    }
    try {
      const res = await fetch(`/api/pricing/discovery-extras?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'pricing.getModulosExtrasDescoberta');
      return res.json();
    } catch {
      console.warn('[pricing.getModulosExtrasDescoberta] API not available, using mock fallback');
      const { mockGetModulosExtrasDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulosExtrasDescoberta(academyId);
    }
  } catch (error) { handleServiceError(error, 'pricing.getModulosExtrasDescoberta'); }
}

export async function simularUpgrade(academyId: string, novosModulos: string[]): Promise<SimulacaoUpgrade> {
  try {
    if (isMock()) {
      const { mockSimularUpgrade } = await import('@/lib/mocks/pricing.mock');
      return mockSimularUpgrade(academyId, novosModulos);
    }
    try {
      const res = await fetch('/api/pricing/simulate-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, novosModulos }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'pricing.simularUpgrade');
      return res.json();
    } catch {
      console.warn('[pricing.simularUpgrade] API not available, using mock fallback');
      const { mockSimularUpgrade } = await import('@/lib/mocks/pricing.mock');
      return mockSimularUpgrade(academyId, novosModulos);
    }
  } catch (error) { handleServiceError(error, 'pricing.simularUpgrade'); }
}
