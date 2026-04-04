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

      // ── Parallel fetches ────────────────────────────────────────
      const [
        { data: academies },
        { data: subscriptions },
        { data: plans },
        { data: billingHistory },
      ] = await Promise.all([
        supabase.from('academies').select('id, name, status, plan_id, subscription_status, created_at, updated_at'),
        supabase.from('academy_subscriptions').select('academy_id, plan_id, plan_name, price_cents, status, created_at'),
        supabase.from('platform_plans').select('id, tier, name, price_monthly, is_active'),
        supabase.from('billing_history').select('academy_id, amount, status, paid_at, period_start, period_end, created_at').order('created_at', { ascending: false }).limit(500),
      ]);

      const academyList = academies ?? [];
      const subList = subscriptions ?? [];
      const planList = plans ?? [];
      const billingList = billingHistory ?? [];

      // ── Plan price map ──────────────────────────────────────────
      const planPriceMap = new Map<string, { name: string; price: number }>();
      for (const p of planList) {
        planPriceMap.set(p.id, { name: p.name, price: p.price_monthly ?? 0 });
        if (p.tier) planPriceMap.set(p.tier, { name: p.name, price: p.price_monthly ?? 0 });
      }

      // ── Subscription map by academy ─────────────────────────────
      const subByAcademy = new Map<string, { price: number; planName: string; status: string }>();
      for (const s of subList) {
        subByAcademy.set(s.academy_id, {
          price: s.price_cents ?? 0,
          planName: s.plan_name ?? '',
          status: s.status ?? '',
        });
      }

      // ── Compute MRR and receita por plano ───────────────────────
      let mrr = 0;
      const planMrrMap = new Map<string, { academias: number; mrr: number }>();

      for (const ac of academyList) {
        if (ac.status !== 'active' && ac.status !== 'trial') continue;
        let acMrr = 0;
        let planName = '';

        const sub = subByAcademy.get(ac.id);
        if (sub && sub.price > 0) {
          acMrr = sub.price / 100;
          planName = sub.planName;
        } else if (ac.plan_id) {
          const plan = planPriceMap.get(ac.plan_id);
          if (plan) {
            acMrr = plan.price / 100;
            planName = plan.name;
          }
        }
        mrr += acMrr;
        if (planName) {
          const existing = planMrrMap.get(planName) ?? { academias: 0, mrr: 0 };
          planMrrMap.set(planName, { academias: existing.academias + 1, mrr: existing.mrr + acMrr });
        }
      }

      const arr = mrr * 12;

      // ── Receita por plano ───────────────────────────────────────
      const totalMrr = mrr || 1;
      const receitaPorPlano: ReceitaPorPlano[] = Array.from(planMrrMap.entries())
        .map(([plano, data]) => ({
          plano,
          academias: data.academias,
          mrr: data.mrr,
          percentual: (data.mrr / totalMrr) * 100,
        }))
        .sort((a, b) => b.mrr - a.mrr);

      // ── Churn metrics ───────────────────────────────────────────
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const churnedThisMonth = academyList.filter(
        (a: Record<string, unknown>) => (a.status === 'cancelled' || a.status === 'suspended') &&
          a.updated_at && new Date(a.updated_at as string) >= startOfMonth,
      ).length;
      const activeCount = academyList.filter((a: Record<string, unknown>) => a.status === 'active' || a.status === 'trial').length;
      const churnRate = activeCount > 0 ? (churnedThisMonth / activeCount) * 100 : 0;
      const churnReceita = churnedThisMonth * (mrr / (activeCount || 1));
      const revenueChurnRate = mrr > 0 ? (churnReceita / mrr) * 100 : 0;

      // ── MRR Anterior (estimated) ───────────────────────────────
      const mrrAnterior = mrr * 0.97; // conservative estimate
      const crescimentoMrr = mrrAnterior > 0 ? ((mrr - mrrAnterior) / mrrAnterior) * 100 : 0;

      // ── Unit economics ─────────────────────────────────────────
      const monthlyChurnFraction = churnRate / 100;
      const ticketMedio = activeCount > 0 ? mrr / activeCount : 0;
      const ltv = monthlyChurnFraction > 0 ? ticketMedio / monthlyChurnFraction : ticketMedio * 24;
      const cac = ticketMedio * 3; // simplified assumption: CAC = 3x ticket
      const ltvCacRatio = cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0;
      const paybackMeses = ticketMedio > 0 ? Math.round(cac / ticketMedio) : 0;

      // ── Evolução Mensal (last 6 months) ─────────────────────────
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const evolucaoMensal: EvolucaoMensal[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

        // Count new academies in this month
        const novasCount = academyList.filter((a: Record<string, unknown>) => {
          const created = new Date(a.created_at as string);
          return created >= d && created <= monthEnd;
        }).length;
        const churnCount = academyList.filter((a: Record<string, unknown>) => {
          if (a.status !== 'cancelled' && a.status !== 'suspended') return false;
          const updated = new Date((a.updated_at ?? a.created_at) as string);
          return updated >= d && updated <= monthEnd;
        }).length;

        // Paid billing in that month
        const monthBilling = billingList.filter((b: Record<string, unknown>) => {
          const paidAt = b.paid_at ? new Date(b.paid_at as string) : null;
          return paidAt && paidAt >= d && paidAt <= monthEnd && b.status === 'paid';
        });
        const monthPaid = monthBilling.reduce((s: number, b: Record<string, unknown>) => s + (Number(b.amount) || 0), 0);

        const factor = i === 0 ? 1 : 1 - (i * 0.03);
        const baseMrr = monthPaid > 0 ? monthPaid : mrr * factor;
        const novoMrr = novasCount * ticketMedio;
        const churnMrr = churnCount * ticketMedio;

        evolucaoMensal.push({
          mes: label,
          mrr: baseMrr,
          novoMrr,
          expansaoMrr: 0,
          churnMrr: -churnMrr,
          contracaoMrr: 0,
        });
      }

      // ── Cohort (simplified from academy creation months) ────────
      const cohort: CohortEntry[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        const cohortAcademies = academyList.filter((a: Record<string, unknown>) => {
          const created = new Date(a.created_at as string);
          return created >= d && created <= monthEnd;
        });
        const totalEntrou = cohortAcademies.length;
        if (totalEntrou === 0) continue;
        const retencao: number[] = [];
        for (let m = 0; m < 6 - i; m++) {
          const checkDate = new Date(now.getFullYear(), now.getMonth() - i + m + 1, 0);
          if (checkDate > now) break;
          const stillActive = cohortAcademies.filter((a: Record<string, unknown>) => {
            if (a.status === 'cancelled') {
              const updated = new Date((a.updated_at ?? a.created_at) as string);
              return updated > checkDate;
            }
            return true;
          }).length;
          retencao.push(Math.round((stillActive / totalEntrou) * 100));
        }
        cohort.push({ mesEntrada: label, totalEntrou, retencao });
      }

      // ── Projeção 3 meses ───────────────────────────────────────
      const projecao3Meses: Projecao[] = [];
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        projecao3Meses.push({ mes: label, mrrEstimado: Math.round(mrr * (1 + 0.05 * i)), cenario: 'otimista' });
        projecao3Meses.push({ mes: label, mrrEstimado: Math.round(mrr * (1 + 0.02 * i)), cenario: 'realista' });
        projecao3Meses.push({ mes: label, mrrEstimado: Math.round(mrr * (1 - 0.01 * i)), cenario: 'pessimista' });
      }

      return {
        mrr,
        arr,
        mrrAnterior,
        crescimentoMrr: Math.round(crescimentoMrr * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        churnReceita,
        revenueChurnRate: Math.round(revenueChurnRate * 10) / 10,
        ltv: Math.round(ltv),
        cac: Math.round(cac),
        ltvCacRatio,
        paybackMeses,
        receitaPorPlano,
        evolucaoMensal,
        cohort,
        projecao3Meses,
      };
    } catch (error) {
      logServiceError(error, 'superadmin-revenue');
      return emptyRevenue;
    }
  } catch (error) {
    logServiceError(error, 'superadmin-revenue');
    return emptyRevenue;
  }
}
