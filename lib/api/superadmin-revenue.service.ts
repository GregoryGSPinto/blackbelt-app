import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface ReceitaPorPlano {
  plano: string;
  academias: number;
  mrr: number;
  percentual: number;
}

export interface EvolucaoMensal {
  mes: string;
  mrr: number;
  novoMrr: number;
  expansaoMrr: number;
  churnMrr: number;
  contracaoMrr: number;
}

export interface CohortEntry {
  mesEntrada: string;
  totalEntrou: number;
  retencao: number[];
}

export interface Projecao {
  mes: string;
  mrrEstimado: number;
  cenario: 'otimista' | 'realista' | 'pessimista';
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  mrrAnterior: number;
  crescimentoMrr: number;
  churnRate: number;
  churnReceita: number;
  revenueChurnRate: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackMeses: number;
  receitaPorPlano: ReceitaPorPlano[];
  evolucaoMensal: EvolucaoMensal[];
  cohort: CohortEntry[];
  projecao3Meses: Projecao[];
}

const emptyRevenue: RevenueMetrics = { mrr: 0, arr: 0, mrrAnterior: 0, crescimentoMrr: 0, churnRate: 0, churnReceita: 0, revenueChurnRate: 0, ltv: 0, cac: 0, ltvCacRatio: 0, paybackMeses: 0, receitaPorPlano: [], evolucaoMensal: [], cohort: [], projecao3Meses: [] };

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    if (isMock()) {
      const { mockGetRevenueMetrics } = await import('@/lib/mocks/superadmin-revenue.mock');
      return mockGetRevenueMetrics();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'revenue_metrics')
        .single();
      if (error || !data) {
        logServiceError(error, 'superadmin-revenue');
        return emptyRevenue;
      }
      return (data.value as RevenueMetrics) || emptyRevenue;
    } catch (error) {
      logServiceError(error, 'superadmin-revenue');
      return emptyRevenue;
    }
  } catch (error) {
    logServiceError(error, 'superadmin-revenue');
    return emptyRevenue;
  }
}
