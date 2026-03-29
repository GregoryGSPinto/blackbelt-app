import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface ExperimentalRecepcao {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  idade: number;
  modalidade: string;
  turma: string;
  horario: string;
  data: string;
  origem: string;
  observacoes: string;
  status: 'agendada' | 'confirmada' | 'chegou' | 'nao_veio' | 'matriculou' | 'follow_up' | 'desistiu';
  criadoEm: string;
}

export interface FunnelExperimental {
  agendadas: number;
  vieram: number;
  matricularam: number;
  conversao: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function listExperimentais(): Promise<{ hoje: ExperimentalRecepcao[]; followUp: ExperimentalRecepcao[]; historico: ExperimentalRecepcao[]; funnel: FunnelExperimental }> {
  const fallback = { hoje: [] as ExperimentalRecepcao[], followUp: [] as ExperimentalRecepcao[], historico: [] as ExperimentalRecepcao[], funnel: { agendadas: 0, vieram: 0, matricularam: 0, conversao: 0 } };
  try {
    if (isMock()) {
      const { mockListExperimentais } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockListExperimentais();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('experimentais')
      .select('*')
      .order('data', { ascending: false });
    if (error || !data) {
      logServiceError(error, 'recepcao-experimental');
      return fallback;
    }
    const all = data as unknown as ExperimentalRecepcao[];
    const hoje = all.filter(e => e.data === today);
    const followUp = all.filter(e => e.status === 'follow_up');
    const historico = all.filter(e => e.data !== today && e.status !== 'follow_up');
    const agendadas = all.length;
    const vieram = all.filter(e => ['chegou', 'matriculou'].includes(e.status)).length;
    const matricularam = all.filter(e => e.status === 'matriculou').length;
    return { hoje, followUp, historico, funnel: { agendadas, vieram, matricularam, conversao: agendadas > 0 ? matricularam / agendadas : 0 } };
  } catch (error) {
    logServiceError(error, 'recepcao-experimental');
    return fallback;
  }
}

export async function marcarChegou(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarChegou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarChegou(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('experimentais')
      .update({ status: 'chegou' })
      .eq('id', id);
    if (error) {
      logServiceError(error, 'recepcao-experimental');
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    logServiceError(error, 'recepcao-experimental');
    return { ok: false };
  }
}

export async function marcarNaoVeio(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarNaoVeio } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarNaoVeio(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('experimentais')
      .update({ status: 'nao_veio' })
      .eq('id', id);
    if (error) {
      logServiceError(error, 'recepcao-experimental');
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    logServiceError(error, 'recepcao-experimental');
    return { ok: false };
  }
}

export async function marcarMatriculou(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarMatriculou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarMatriculou(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('experimentais')
      .update({ status: 'matriculou' })
      .eq('id', id);
    if (error) {
      logServiceError(error, 'recepcao-experimental');
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    logServiceError(error, 'recepcao-experimental');
    return { ok: false };
  }
}
