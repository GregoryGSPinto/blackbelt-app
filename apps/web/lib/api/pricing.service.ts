import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('pricing_tiers').select('*').order('min_alunos');
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []) as unknown as FaixaBase[];
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function getModulos(): Promise<Modulo[]> {
  try {
    if (isMock()) {
      const { mockGetModulos } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulos();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('pricing_modules').select('*').order('ordem');
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []) as unknown as Modulo[];
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function getPacotes(): Promise<PacoteSugerido[]> {
  try {
    if (isMock()) {
      const { mockGetPacotes } = await import('@/lib/mocks/pricing.mock');
      return mockGetPacotes();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('pricing_packages').select('*');
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []) as unknown as PacoteSugerido[];
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function getAssinatura(academyId: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockGetAssinatura } = await import('@/lib/mocks/pricing.mock');
      return mockGetAssinatura(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans!inner(*)')
      .eq('plans.academy_id', academyId)
      .limit(1)
      .maybeSingle();
    if (error) {
      logServiceError(error, 'pricing');
    }
    const raw = (data ?? { id: '', academyId, tierId: '', modulosPagos: [], professoresAdicionais: 0, unidadesAdicionais: 0, ciclo: 'mensal', precoTotal: 0, status: 'trial', trialStartedAt: '', trialEndsAt: '', discoveryEndsAt: '', currentPeriodStart: '', currentPeriodEnd: '', modulosAtivos: [], emPeriodoDescoberta: false, diasRestantesDescoberta: 0, usoDescoberta: [] }) as unknown as AssinaturaSaaS;
    raw.usoDescoberta = Array.isArray(raw.usoDescoberta) ? raw.usoDescoberta : [];
    raw.modulosPagos = Array.isArray(raw.modulosPagos) ? raw.modulosPagos : [];
    raw.modulosAtivos = Array.isArray(raw.modulosAtivos) ? raw.modulosAtivos : [];
    return raw;
  } catch (error) {
    logServiceError(error, 'pricing');
    return { id: '', academyId, tierId: '', modulosPagos: [], professoresAdicionais: 0, unidadesAdicionais: 0, ciclo: 'mensal', precoTotal: 0, status: 'trial', trialStartedAt: '', trialEndsAt: '', discoveryEndsAt: '', currentPeriodStart: '', currentPeriodEnd: '', modulosAtivos: [], emPeriodoDescoberta: false, diasRestantesDescoberta: 0, usoDescoberta: [] } as unknown as AssinaturaSaaS;
  }
}

export async function ativarModulo(academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockAtivarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockAtivarModulo(academyId, moduloSlug);
    }

    const res = await fetch('/api/pricing/modules/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, moduloSlug }),
    });
    if (!res.ok) {
      logServiceError(new Error(`API error: ${res.status}`), 'pricing');
    }
    const result = await res.json() as AssinaturaSaaS;
    result.usoDescoberta = Array.isArray(result.usoDescoberta) ? result.usoDescoberta : [];
    result.modulosPagos = Array.isArray(result.modulosPagos) ? result.modulosPagos : [];
    result.modulosAtivos = Array.isArray(result.modulosAtivos) ? result.modulosAtivos : [];
    return result;
  } catch (error) {
    logServiceError(error, 'pricing');
    return { id: '', academyId, tierId: '', modulosPagos: [], professoresAdicionais: 0, unidadesAdicionais: 0, ciclo: 'mensal', precoTotal: 0, status: 'trial', trialStartedAt: '', trialEndsAt: '', discoveryEndsAt: '', currentPeriodStart: '', currentPeriodEnd: '', modulosAtivos: [], emPeriodoDescoberta: false, diasRestantesDescoberta: 0, usoDescoberta: [] } as AssinaturaSaaS;
  }
}

export async function desativarModulo(academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  try {
    if (isMock()) {
      const { mockDesativarModulo } = await import('@/lib/mocks/pricing.mock');
      return mockDesativarModulo(academyId, moduloSlug);
    }

    const res = await fetch('/api/pricing/modules/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, moduloSlug }),
    });
    if (!res.ok) {
      logServiceError(new Error(`API error: ${res.status}`), 'pricing');
    }
    const result = await res.json() as AssinaturaSaaS;
    result.usoDescoberta = Array.isArray(result.usoDescoberta) ? result.usoDescoberta : [];
    result.modulosPagos = Array.isArray(result.modulosPagos) ? result.modulosPagos : [];
    result.modulosAtivos = Array.isArray(result.modulosAtivos) ? result.modulosAtivos : [];
    return result;
  } catch (error) {
    logServiceError(error, 'pricing');
    return { id: '', academyId, tierId: '', modulosPagos: [], professoresAdicionais: 0, unidadesAdicionais: 0, ciclo: 'mensal', precoTotal: 0, status: 'trial', trialStartedAt: '', trialEndsAt: '', discoveryEndsAt: '', currentPeriodStart: '', currentPeriodEnd: '', modulosAtivos: [], emPeriodoDescoberta: false, diasRestantesDescoberta: 0, usoDescoberta: [] } as AssinaturaSaaS;
  }
}

export async function getHistoricoCobrancas(academyId: string): Promise<Cobranca[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoCobrancas } = await import('@/lib/mocks/pricing.mock');
      return mockGetHistoricoCobrancas(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('payment_charges')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      data: (c.created_at ?? '') as string,
      valor: (c.amount ?? 0) as number,
      descricao: (c.description ?? '') as string,
      status: (c.status ?? 'pending') as Cobranca['status'],
      metodo: (c.method ?? '') as string,
    }));
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function getUsoDescoberta(academyId: string): Promise<UsoDescoberta[]> {
  try {
    if (isMock()) {
      const { mockGetUsoDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetUsoDescoberta(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('module_usage_tracking')
      .select('*')
      .eq('academy_id', academyId);
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []) as unknown as UsoDescoberta[];
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function isModuloAcessivel(academyId: string, moduloSlug: string): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockIsModuloAcessivel } = await import('@/lib/mocks/pricing.mock');
      return mockIsModuloAcessivel(academyId, moduloSlug);
    }

    const res = await fetch(`/api/pricing/module-access?academyId=${encodeURIComponent(academyId)}&module=${encodeURIComponent(moduloSlug)}`);
    if (!res.ok) {
      logServiceError(new Error(`API error: ${res.status}`), 'pricing');
      return false;
    }
    const data = await res.json();
    return data.accessible;
  } catch (error) {
    logServiceError(error, 'pricing');
    return false;
  }
}

export async function getModulosExtrasDescoberta(academyId: string): Promise<ModuloExtra[]> {
  try {
    if (isMock()) {
      const { mockGetModulosExtrasDescoberta } = await import('@/lib/mocks/pricing.mock');
      return mockGetModulosExtrasDescoberta(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('module_usage_tracking')
      .select('*, pricing_modules(*)')
      .eq('academy_id', academyId)
      .eq('included_in_plan', false);
    if (error) {
      logServiceError(error, 'pricing');
      return [];
    }
    return (data ?? []) as unknown as ModuloExtra[];
  } catch (error) {
    logServiceError(error, 'pricing');
    return [];
  }
}

export async function simularUpgrade(academyId: string, novosModulos: string[]): Promise<SimulacaoUpgrade> {
  try {
    if (isMock()) {
      const { mockSimularUpgrade } = await import('@/lib/mocks/pricing.mock');
      return mockSimularUpgrade(academyId, novosModulos);
    }

    const res = await fetch('/api/pricing/simulate-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, novosModulos }),
    });
    if (!res.ok) {
      logServiceError(new Error(`API error: ${res.status}`), 'pricing');
    }
    return res.json();
  } catch (error) {
    logServiceError(error, 'pricing');
    return { modulosNovos: [], custoAdicional: 0, totalNovo: 0 };
  }
}
