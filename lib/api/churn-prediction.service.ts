import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────

export interface AlunoRiscoDados {
  presencaUltimas4Semanas: number;
  presencaTendencia: 'caindo' | 'estavel' | 'subindo';
  diasSemTreinar: number;
  pagamentoEmDia: boolean;
  diasAtraso: number;
  tempoNaFaixa: number;
  interacaoApp: number;
  npsUltimo?: number;
  eventosParticipados: number;
  amigosNaAcademia: number;
}

export interface AcaoSugerida {
  acao: string;
  canal: string;
  template?: string;
  prioridade: 'alta' | 'media';
}

export interface AlunoRisco {
  id: string;
  nome: string;
  avatar?: string;
  faixa: string;
  risco: 'alto' | 'medio' | 'baixo';
  score: number;
  motivos: string[];
  dados: AlunoRiscoDados;
  acoesSugeridas: AcaoSugerida[];
  ultimoContato?: string;
  statusAcao: 'pendente' | 'acao_tomada' | 'recuperado' | 'cancelou';
}

export interface ChurnMetrics {
  totalRisco: number;
  alto: number;
  medio: number;
  recuperados: number;
  cancelados: number;
  taxaRecuperacao: number;
}

export interface ChurnTrendPoint {
  mes: string;
  risco: number;
  cancelados: number;
  recuperados: number;
}

// ── API ────────────────────────────────────────────────────────────

export async function getAlunosEmRisco(academyId: string): Promise<AlunoRisco[]> {
  try {
    if (isMock()) {
      const { mockGetAlunosEmRisco } = await import('@/lib/mocks/churn-prediction.mock');
      return mockGetAlunosEmRisco(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('churn_predictions').select('*').eq('academy_id', academyId).in('risk_level', ['alto', 'medio']).order('score', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d: Record<string, unknown>) => ({
      id: d.id, nome: d.student_name, faixa: '', risco: d.risk_level, score: d.score, motivos: d.motivos ?? [],
      dados: d.dados as unknown as AlunoRiscoDados, acoesSugeridas: d.acoes_sugeridas as unknown as AcaoSugerida[],
      ultimoContato: d.ultimo_contato, statusAcao: d.status_acao,
    }));
  } catch (error) {
    handleServiceError(error, 'churn.getAlunosEmRisco');
  }
}

export async function getChurnMetrics(academyId: string): Promise<ChurnMetrics> {
  try {
    if (isMock()) {
      const { mockGetChurnMetrics } = await import('@/lib/mocks/churn-prediction.mock');
      return mockGetChurnMetrics(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('churn_predictions').select('risk_level, status_acao').eq('academy_id', academyId);
    if (error) throw error;
    const all = data ?? [];
    const alto = all.filter((d: Record<string, string>) => d.risk_level === 'alto').length;
    const medio = all.filter((d: Record<string, string>) => d.risk_level === 'medio').length;
    const recuperados = all.filter((d: Record<string, string>) => d.status_acao === 'recuperado').length;
    const cancelados = all.filter((d: Record<string, string>) => d.status_acao === 'cancelou').length;
    return { totalRisco: alto + medio, alto, medio, recuperados, cancelados, taxaRecuperacao: recuperados > 0 ? Math.round((recuperados / (recuperados + cancelados)) * 100) : 0 };
  } catch (error) {
    handleServiceError(error, 'churn.getMetrics');
  }
}

export async function getChurnTrend(academyId: string): Promise<ChurnTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetChurnTrend } = await import('@/lib/mocks/churn-prediction.mock');
      return mockGetChurnTrend(academyId);
    }
    return [];
  } catch (error) {
    handleServiceError(error, 'churn.getTrend');
  }
}

export async function marcarAcaoTomada(studentId: string, acao: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarAcaoTomada } = await import('@/lib/mocks/churn-prediction.mock');
      return mockMarcarAcaoTomada(studentId, acao);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('churn_predictions').update({ status_acao: 'acao_tomada', ultimo_contato: new Date().toISOString() }).eq('id', studentId);
    if (error) throw error;
  } catch (error) {
    handleServiceError(error, 'churn.marcarAcao');
  }
}

export async function marcarRecuperado(studentId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarRecuperado } = await import('@/lib/mocks/churn-prediction.mock');
      return mockMarcarRecuperado(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('churn_predictions').update({ status_acao: 'recuperado' }).eq('id', studentId);
    if (error) throw error;
  } catch (error) {
    handleServiceError(error, 'churn.marcarRecuperado');
  }
}
