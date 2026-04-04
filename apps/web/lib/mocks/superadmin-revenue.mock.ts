import type { RevenueMetrics } from '@/lib/api/superadmin-revenue.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const DATA: RevenueMetrics = {
  mrr: 12450,
  arr: 149400,
  mrrAnterior: 11505,
  crescimentoMrr: 8.2,
  churnRate: 3.2,
  churnReceita: 350,
  revenueChurnRate: 2.8,
  ltv: 4800,
  cac: 150,
  ltvCacRatio: 32,
  paybackMeses: 0.75,
  receitaPorPlano: [
    { plano: 'Starter', academias: 30, mrr: 2970, percentual: 23.9 },
    { plano: 'Pro', academias: 22, mrr: 6578, percentual: 52.8 },
    { plano: 'Black Belt', academias: 8, mrr: 3992, percentual: 32.1 },
    { plano: 'Enterprise', academias: 2, mrr: 910, percentual: 7.3 },
  ],
  evolucaoMensal: [
    { mes: 'Abr/25', mrr: 7200, novoMrr: 800, expansaoMrr: 200, churnMrr: -300, contracaoMrr: -100 },
    { mes: 'Mai/25', mrr: 7800, novoMrr: 900, expansaoMrr: 150, churnMrr: -350, contracaoMrr: -100 },
    { mes: 'Jun/25', mrr: 8100, novoMrr: 600, expansaoMrr: 100, churnMrr: -250, contracaoMrr: -150 },
    { mes: 'Jul/25', mrr: 8600, novoMrr: 700, expansaoMrr: 200, churnMrr: -300, contracaoMrr: -100 },
    { mes: 'Ago/25', mrr: 9200, novoMrr: 900, expansaoMrr: 100, churnMrr: -300, contracaoMrr: -100 },
    { mes: 'Set/25', mrr: 9500, novoMrr: 500, expansaoMrr: 200, churnMrr: -250, contracaoMrr: -150 },
    { mes: 'Out/25', mrr: 9900, novoMrr: 600, expansaoMrr: 150, churnMrr: -200, contracaoMrr: -150 },
    { mes: 'Nov/25', mrr: 10200, novoMrr: 500, expansaoMrr: 200, churnMrr: -250, contracaoMrr: -150 },
    { mes: 'Dez/25', mrr: 10800, novoMrr: 800, expansaoMrr: 200, churnMrr: -200, contracaoMrr: -200 },
    { mes: 'Jan/26', mrr: 11100, novoMrr: 600, expansaoMrr: 100, churnMrr: -250, contracaoMrr: -150 },
    { mes: 'Fev/26', mrr: 11505, novoMrr: 700, expansaoMrr: 100, churnMrr: -300, contracaoMrr: -95 },
    { mes: 'Mar/26', mrr: 12450, novoMrr: 1200, expansaoMrr: 200, churnMrr: -350, contracaoMrr: -105 },
  ],
  cohort: [
    { mesEntrada: 'Out/25', totalEntrou: 8, retencao: [100, 88, 88, 75, 75, 75] },
    { mesEntrada: 'Nov/25', totalEntrou: 7, retencao: [100, 86, 86, 71, 71] },
    { mesEntrada: 'Dez/25', totalEntrou: 6, retencao: [100, 83, 83, 67] },
    { mesEntrada: 'Jan/26', totalEntrou: 9, retencao: [100, 89, 78] },
    { mesEntrada: 'Fev/26', totalEntrou: 7, retencao: [100, 86] },
    { mesEntrada: 'Mar/26', totalEntrou: 8, retencao: [100] },
  ],
  projecao3Meses: [
    { mes: 'Abr/26', mrrEstimado: 13500, cenario: 'otimista' },
    { mes: 'Mai/26', mrrEstimado: 14200, cenario: 'otimista' },
    { mes: 'Jun/26', mrrEstimado: 15000, cenario: 'otimista' },
    { mes: 'Abr/26', mrrEstimado: 13000, cenario: 'realista' },
    { mes: 'Mai/26', mrrEstimado: 13500, cenario: 'realista' },
    { mes: 'Jun/26', mrrEstimado: 14000, cenario: 'realista' },
    { mes: 'Abr/26', mrrEstimado: 12200, cenario: 'pessimista' },
    { mes: 'Mai/26', mrrEstimado: 12500, cenario: 'pessimista' },
    { mes: 'Jun/26', mrrEstimado: 12800, cenario: 'pessimista' },
  ],
};

export async function mockGetRevenueMetrics(): Promise<RevenueMetrics> {
  await delay(500);
  return JSON.parse(JSON.stringify(DATA));
}
