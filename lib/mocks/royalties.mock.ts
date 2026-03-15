import type {
  RoyaltyCalculation,
  RoyaltyHistorySummary,
  RoyaltyInvoice,
  RoyaltyStatus,
} from '@/lib/api/royalties.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const ACADEMIES = [
  { id: 'acad-1', name: 'Black Belt Moema', baseRevenue: 62400 },
  { id: 'acad-2', name: 'Black Belt Alphaville', baseRevenue: 48900 },
  { id: 'acad-3', name: 'Black Belt Barra', baseRevenue: 71200 },
  { id: 'acad-4', name: 'Black Belt Savassi', baseRevenue: 32100 },
  { id: 'acad-5', name: 'Black Belt Moinhos', baseRevenue: 41800 },
];

const MONTHS_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function generateCalculations(): RoyaltyCalculation[] {
  const now = new Date();
  const calculations: RoyaltyCalculation[] = [];

  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthLabel = `${MONTHS_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

    for (const academy of ACADEMIES) {
      const grossRevenue = Math.round(academy.baseRevenue * (0.85 + Math.random() * 0.3));
      const royaltyPct = 8;
      const marketingPct = 2;
      const royaltyAmount = Math.round(grossRevenue * royaltyPct / 100);
      const marketingAmount = Math.round(grossRevenue * marketingPct / 100);
      const totalDue = royaltyAmount + marketingAmount;

      let status: RoyaltyStatus = 'pago';
      let paidDate: string | null = new Date(d.getFullYear(), d.getMonth() + 1, 10).toISOString();

      if (m === 0) {
        status = 'pendente';
        paidDate = null;
      } else if (m === 1 && academy.id === 'acad-4') {
        status = 'atrasado';
        paidDate = null;
      }

      calculations.push({
        id: `roy-${academy.id}-${monthLabel}`,
        academy_id: academy.id,
        academy_name: academy.name,
        month: monthLabel,
        gross_revenue: grossRevenue,
        royalty_percentage: royaltyPct,
        royalty_amount: royaltyAmount,
        marketing_fund_pct: marketingPct,
        marketing_fund_amount: marketingAmount,
        total_due: totalDue,
        status,
        due_date: new Date(d.getFullYear(), d.getMonth() + 1, 15).toISOString(),
        paid_date: paidDate,
        model: 'percentual_fixo',
      });
    }
  }

  return calculations;
}

const ALL_CALCULATIONS = generateCalculations();

export async function mockCalculateRoyalties(academyId: string, month: string): Promise<RoyaltyCalculation> {
  await delay();
  const existing = ALL_CALCULATIONS.find((c) => c.academy_id === academyId && c.month === month);
  if (existing) return existing;

  const academy = ACADEMIES.find((a) => a.id === academyId) ?? ACADEMIES[0];
  const grossRevenue = Math.round(academy.baseRevenue * (0.9 + Math.random() * 0.2));
  const royaltyAmount = Math.round(grossRevenue * 0.08);
  const marketingAmount = Math.round(grossRevenue * 0.02);
  return {
    id: `roy-${academyId}-${month}`,
    academy_id: academyId,
    academy_name: academy.name,
    month,
    gross_revenue: grossRevenue,
    royalty_percentage: 8,
    royalty_amount: royaltyAmount,
    marketing_fund_pct: 2,
    marketing_fund_amount: marketingAmount,
    total_due: royaltyAmount + marketingAmount,
    status: 'pendente',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    paid_date: null,
    model: 'percentual_fixo',
  };
}

export async function mockGetRoyaltyHistory(_franchiseId: string, _period?: string): Promise<RoyaltyHistorySummary> {
  await delay();
  const totalCollected = ALL_CALCULATIONS.filter((c) => c.status === 'pago').reduce((s, c) => s + c.total_due, 0);
  const totalPending = ALL_CALCULATIONS.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.total_due, 0);
  const totalOverdue = ALL_CALCULATIONS.filter((c) => c.status === 'atrasado').reduce((s, c) => s + c.total_due, 0);
  return {
    total_collected: totalCollected,
    total_pending: totalPending,
    total_overdue: totalOverdue,
    calculations: ALL_CALCULATIONS,
  };
}

export async function mockGenerateRoyaltyInvoice(academyId: string, month: string): Promise<RoyaltyInvoice> {
  await delay();
  const academy = ACADEMIES.find((a) => a.id === academyId) ?? ACADEMIES[0];
  const grossRevenue = Math.round(academy.baseRevenue * (0.9 + Math.random() * 0.2));
  const royaltyAmount = Math.round(grossRevenue * 0.08);
  const marketingAmount = Math.round(grossRevenue * 0.02);
  return {
    id: `inv-${academyId}-${month}`,
    academy_id: academyId,
    academy_name: academy.name,
    month,
    royalty_amount: royaltyAmount,
    marketing_fund_amount: marketingAmount,
    total_due: royaltyAmount + marketingAmount,
    status: 'pendente',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    generated_at: new Date().toISOString(),
  };
}

export async function mockPayRoyalty(invoiceId: string): Promise<RoyaltyCalculation> {
  await delay();
  const calc = ALL_CALCULATIONS.find((c) => c.id === invoiceId) ?? ALL_CALCULATIONS[0];
  return { ...calc, status: 'pago', paid_date: new Date().toISOString() };
}
