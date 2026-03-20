import { isMock } from '@/lib/env';

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
    if (error) {
      console.warn('[getAlunosEmRisco] error:', error.message);
      return [];
    }
    return (data ?? []).map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nome: d.student_name as string,
      faixa: '',
      risco: d.risk_level as 'alto' | 'medio' | 'baixo',
      score: d.score as number,
      motivos: (d.motivos as string[]) ?? [],
      dados: d.dados as unknown as AlunoRiscoDados,
      acoesSugeridas: d.acoes_sugeridas as unknown as AcaoSugerida[],
      ultimoContato: d.ultimo_contato as string | undefined,
      statusAcao: d.status_acao as 'pendente' | 'acao_tomada' | 'recuperado' | 'cancelou',
    }));
  } catch (error) {
    console.warn('[getAlunosEmRisco] Fallback:', error);
    return [];
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
    if (error) {
      console.warn('[getChurnMetrics] error:', error.message);
      return { totalRisco: 0, alto: 0, medio: 0, recuperados: 0, cancelados: 0, taxaRecuperacao: 0 };
    }
    const all = data ?? [];
    const alto = all.filter((d: Record<string, string>) => d.risk_level === 'alto').length;
    const medio = all.filter((d: Record<string, string>) => d.risk_level === 'medio').length;
    const recuperados = all.filter((d: Record<string, string>) => d.status_acao === 'recuperado').length;
    const cancelados = all.filter((d: Record<string, string>) => d.status_acao === 'cancelou').length;
    return { totalRisco: alto + medio, alto, medio, recuperados, cancelados, taxaRecuperacao: recuperados > 0 ? Math.round((recuperados / (recuperados + cancelados)) * 100) : 0 };
  } catch (error) {
    console.warn('[getChurnMetrics] Fallback:', error);
    return { totalRisco: 0, alto: 0, medio: 0, recuperados: 0, cancelados: 0, taxaRecuperacao: 0 };
  }
}

export async function getChurnTrend(academyId: string): Promise<ChurnTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetChurnTrend } = await import('@/lib/mocks/churn-prediction.mock');
      return mockGetChurnTrend(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('churn_trend')
      .select('mes, risco, cancelados, recuperados')
      .eq('academy_id', academyId)
      .order('mes', { ascending: true });
    if (error) {
      console.warn('[getChurnTrend] error:', error.message);
      return [];
    }
    return (data ?? []) as ChurnTrendPoint[];
  } catch (error) {
    console.warn('[getChurnTrend] Fallback:', error);
    return [];
  }
}

export async function marcarAcaoTomada(studentId: string, _acao: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarAcaoTomada } = await import('@/lib/mocks/churn-prediction.mock');
      return mockMarcarAcaoTomada(studentId, _acao);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('churn_predictions').update({ status_acao: 'acao_tomada', ultimo_contato: new Date().toISOString() }).eq('id', studentId);
    if (error) {
      console.warn('[marcarAcaoTomada] error:', error.message);
    }
  } catch (error) {
    console.warn('[marcarAcaoTomada] Fallback:', error);
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
    if (error) {
      console.warn('[marcarRecuperado] error:', error.message);
    }
  } catch (error) {
    console.warn('[marcarRecuperado] Fallback:', error);
  }
}
