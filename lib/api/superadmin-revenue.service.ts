import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    if (isMock()) {
      const { mockGetRevenueMetrics } = await import('@/lib/mocks/superadmin-revenue.mock');
      return mockGetRevenueMetrics();
    }
    try {
      const res = await fetch('/api/superadmin/revenue');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-revenue.getRevenueMetrics] API not available, using mock fallback');
      const { mockGetRevenueMetrics } = await import('@/lib/mocks/superadmin-revenue.mock');
      return mockGetRevenueMetrics();
    }
  } catch (error) { handleServiceError(error, 'superadmin-revenue.getMetrics'); }
}
