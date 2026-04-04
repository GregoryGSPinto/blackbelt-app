import type { FinanceiroData, DebtorRow, RecentPayment, PlanAnalysis, MonthlyRevenue } from '@/lib/api/financeiro.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_DEBTORS: DebtorRow[] = [
  {
    student_id: 'student-34',
    name: 'Marcos Vinicius',
    plan: 'Mensal',
    amount: 150,
    days_overdue: 22,
  },
  {
    student_id: 'student-37',
    name: 'Guilherme Torres',
    plan: 'Trimestral',
    amount: 400,
    days_overdue: 12,
  },
];

const MOCK_RECENT_PAYMENTS: RecentPayment[] = [
  { id: 'pay-1', name: 'Lucas Silva', plan: 'Mensal', amount: 150, method: 'PIX', date: '2026-03-14' },
  { id: 'pay-2', name: 'Pedro Santos', plan: 'Mensal', amount: 150, method: 'cartao', date: '2026-03-14' },
  { id: 'pay-3', name: 'Ana Oliveira', plan: 'Mensal', amount: 150, method: 'PIX', date: '2026-03-13' },
  { id: 'pay-4', name: 'Mariana Costa', plan: 'Trimestral', amount: 400, method: 'boleto', date: '2026-03-13' },
  { id: 'pay-5', name: 'Bruno Ferreira', plan: 'Trimestral', amount: 400, method: 'cartao', date: '2026-03-12' },
  { id: 'pay-6', name: 'Gabriel Souza', plan: 'Anual', amount: 1400, method: 'PIX', date: '2026-03-12' },
  { id: 'pay-7', name: 'Juliana Lima', plan: 'Mensal', amount: 150, method: 'PIX', date: '2026-03-11' },
  { id: 'pay-8', name: 'Rafael Pereira', plan: 'Mensal', amount: 150, method: 'boleto', date: '2026-03-11' },
  { id: 'pay-9', name: 'Camila Rodrigues', plan: 'Mensal', amount: 150, method: 'cartao', date: '2026-03-10' },
  { id: 'pay-10', name: 'Diego Almeida', plan: 'Mensal', amount: 150, method: 'PIX', date: '2026-03-10' },
];

const MOCK_PLAN_ANALYSIS: PlanAnalysis[] = [
  { plan_id: 'plan-mensal', plan_name: 'Mensal', subscriber_count: 30, revenue: 4500, pct_of_total: 54 },
  { plan_id: 'plan-trimestral', plan_name: 'Trimestral', subscriber_count: 12, revenue: 4800, pct_of_total: 30 },
  { plan_id: 'plan-anual', plan_name: 'Anual', subscriber_count: 5, revenue: 7000, pct_of_total: 16 },
];

const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'out', receita: 3200 },
  { month: 'nov', receita: 3450 },
  { month: 'dez', receita: 3100 },
  { month: 'jan', receita: 3520 },
  { month: 'fev', receita: 3562 },
  { month: 'mar', receita: 3847 },
];

export async function mockGetFinanceiroData(_academyId: string): Promise<FinanceiroData> {
  await delay();
  return {
    receitaMes: 3847,
    receitaMesAnterior: 3562,
    metaMes: 4150,
    mrr: 3847,
    ticketMedio: 192,
    inadimplenciaPct: 4.2,
    previsaoProximoMes: 4020,
    debtors: MOCK_DEBTORS,
    recentPayments: MOCK_RECENT_PAYMENTS,
    planAnalysis: MOCK_PLAN_ANALYSIS,
    monthlyRevenue: MOCK_MONTHLY_REVENUE,
  };
}
