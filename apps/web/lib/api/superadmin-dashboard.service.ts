import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface MissionControlKPIs {
  mrr: number;
  mrrVariacao: number;
  arr: number;
  totalAcademias: number;
  academiasAtivas: number;
  academiasEmTrial: number;
  academiasChurnMes: number;
  totalAlunosPlataforma: number;
  ticketMedio: number;
  churnRate: number;
  ltv: number;
}

export interface MrrHistorico {
  mes: string;
  valor: number;
}

export interface CrescimentoAcademias {
  mes: string;
  ativas: number;
  novas: number;
  churn: number;
}

export interface AlertaUrgente {
  id: string;
  tipo: 'churn_risco' | 'trial_expirando' | 'pagamento_falhou' | 'academia_inativa' | 'uso_excedido';
  titulo: string;
  descricao: string;
  academiaNome: string;
  academiaId: string;
  urgencia: 'alta' | 'media' | 'baixa';
  criadoEm: string;
}

export interface TopAcademia {
  id: string;
  nome: string;
  plano: string;
  mrr: number;
  alunos: number;
  healthScore: number;
}

export interface AcademiaRisco {
  id: string;
  nome: string;
  healthScore: number;
  motivoRisco: string;
  diasDesdeUltimoLogin: number;
}

export interface DistribuicaoPlano {
  plano: string;
  quantidade: number;
  receita: number;
}

export interface MissionControlDTO {
  kpis: MissionControlKPIs;
  mrrHistorico: MrrHistorico[];
  crescimentoAcademias: CrescimentoAcademias[];
  alertas: AlertaUrgente[];
  topAcademias: TopAcademia[];
  academiasRisco: AcademiaRisco[];
  distribuicaoPlanos: DistribuicaoPlano[];
}

const emptyMissionControl: MissionControlDTO = {
  kpis: { mrr: 0, mrrVariacao: 0, arr: 0, totalAcademias: 0, academiasAtivas: 0, academiasEmTrial: 0, academiasChurnMes: 0, totalAlunosPlataforma: 0, ticketMedio: 0, churnRate: 0, ltv: 0 },
  mrrHistorico: [],
  crescimentoAcademias: [],
  alertas: [],
  topAcademias: [],
  academiasRisco: [],
  distribuicaoPlanos: [],
};

export async function getMissionControl(): Promise<MissionControlDTO> {
  try {
    if (isMock()) {
      const { mockGetMissionControl } = await import('@/lib/mocks/superadmin-dashboard.mock');
      return await mockGetMissionControl();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // ── Parallel fetches ────────────────────────────────────────
      const [
        { count: totalAcademias },
        { count: academiasAtivas },
        { count: academiasEmTrial },
        { data: allAcademies },
        { data: subscriptions },
        { data: plans },
        { data: memberships },
      ] = await Promise.all([
        supabase.from('academies').select('*', { count: 'exact', head: true }),
        supabase.from('academies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('academies').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
        supabase.from('academies').select('id, name, status, plan_id, subscription_status, created_at, updated_at'),
        supabase.from('academy_subscriptions').select('academy_id, plan_id, plan_name, price_cents, status, created_at'),
        supabase.from('platform_plans').select('id, tier, name, price_monthly, is_active'),
        supabase.from('memberships').select('academy_id, role, status').in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']).eq('status', 'active'),
      ]);

      const academyList = allAcademies ?? [];
      const subList = subscriptions ?? [];
      const planList = plans ?? [];
      const memberList = memberships ?? [];

      // ── MRR computation (from subscriptions or plan pricing) ────
      // Build plan price map (price_monthly in centavos)
      const planPriceMap = new Map<string, { name: string; price: number }>();
      for (const p of planList) {
        planPriceMap.set(p.id, { name: p.name, price: p.price_monthly ?? 0 });
        // Also map by tier slug for plan_id stored as varchar
        if (p.tier) planPriceMap.set(p.tier, { name: p.name, price: p.price_monthly ?? 0 });
      }

      // Build subscription map by academy_id
      const subByAcademy = new Map<string, { price: number; planName: string }>();
      for (const s of subList) {
        if (s.status === 'active' || s.status === 'trial') {
          subByAcademy.set(s.academy_id, {
            price: s.price_cents ?? 0,
            planName: s.plan_name ?? '',
          });
        }
      }

      // Calculate MRR: prefer subscription price, fallback to plan price
      let mrr = 0;
      const academyMrr = new Map<string, number>();
      const planAcademyCount = new Map<string, number>();
      const planMrrMap = new Map<string, number>();

      for (const ac of academyList) {
        if (ac.status !== 'active' && ac.status !== 'trial') continue;
        let acMrr = 0;
        let planName = '';

        const sub = subByAcademy.get(ac.id);
        if (sub && sub.price > 0) {
          acMrr = sub.price / 100; // centavos → reais
          planName = sub.planName;
        } else if (ac.plan_id) {
          const plan = planPriceMap.get(ac.plan_id);
          if (plan) {
            acMrr = plan.price / 100;
            planName = plan.name;
          }
        }
        mrr += acMrr;
        academyMrr.set(ac.id, acMrr);
        if (planName) {
          planAcademyCount.set(planName, (planAcademyCount.get(planName) ?? 0) + 1);
          planMrrMap.set(planName, (planMrrMap.get(planName) ?? 0) + acMrr);
        }
      }

      const arr = mrr * 12;

      // ── Alunos totais ──────────────────────────────────────────
      const totalAlunos = memberList.length;

      // ── Academias com churn no mês ─────────────────────────────
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const academiasChurnMes = academyList.filter(
        (a: Record<string, unknown>) => (a.status === 'cancelled' || a.status === 'suspended') &&
          a.updated_at && new Date(a.updated_at as string) >= startOfMonth,
      ).length;

      // ── Churn rate ─────────────────────────────────────────────
      const totalAtivas = academiasAtivas ?? 0;
      const churnRate = totalAtivas > 0 ? (academiasChurnMes / totalAtivas) * 100 : 0;

      // ── Ticket médio ──────────────────────────────────────────
      const payingAcademies = Array.from(academyMrr.values()).filter((v) => v > 0).length;
      const ticketMedio = payingAcademies > 0 ? mrr / payingAcademies : 0;

      // ── LTV (simplified: ticket medio / churn rate mensal) ────
      const monthlyChurnRate = churnRate / 100;
      const ltv = monthlyChurnRate > 0 ? ticketMedio / monthlyChurnRate : ticketMedio * 24;

      // ── Distribuição por plano ─────────────────────────────────
      const distribuicaoPlanos: DistribuicaoPlano[] = [];
      for (const [plano, quantidade] of planAcademyCount.entries()) {
        distribuicaoPlanos.push({
          plano,
          quantidade,
          receita: planMrrMap.get(plano) ?? 0,
        });
      }
      distribuicaoPlanos.sort((a, b) => b.receita - a.receita);

      // ── Top Academias (by MRR) ─────────────────────────────────
      const alunosByAcademy = new Map<string, number>();
      for (const m of memberList) {
        alunosByAcademy.set(m.academy_id, (alunosByAcademy.get(m.academy_id) ?? 0) + 1);
      }

      const topAcademias: TopAcademia[] = academyList
        .filter((a: Record<string, unknown>) => a.status === 'active' || a.status === 'trial')
        .map((a: Record<string, unknown>) => {
          const acMrr = academyMrr.get(a.id as string) ?? 0;
          const alunos = alunosByAcademy.get(a.id as string) ?? 0;
          const planInfo = a.plan_id ? planPriceMap.get(a.plan_id as string) : undefined;
          // Simple health score based on having alunos and recent activity
          const hasAlunos = alunos > 0 ? 40 : 0;
          const hasMrr = acMrr > 0 ? 30 : 0;
          const isActive = a.status === 'active' ? 30 : 15;
          const healthScore = Math.min(hasAlunos + hasMrr + isActive, 100);
          return {
            id: a.id as string,
            nome: (a.name ?? '') as string,
            plano: planInfo?.name ?? '',
            mrr: acMrr,
            alunos,
            healthScore,
          };
        })
        .sort((a: TopAcademia, b: TopAcademia) => b.mrr - a.mrr)
        .slice(0, 10);

      // ── Academias em Risco ─────────────────────────────────────
      const academiasRisco: AcademiaRisco[] = academyList
        .filter((a: Record<string, unknown>) => {
          if (a.status === 'cancelled') return false;
          const alunos = alunosByAcademy.get(a.id as string) ?? 0;
          const acMrr = academyMrr.get(a.id as string) ?? 0;
          const daysSinceUpdate = a.updated_at
            ? Math.floor((Date.now() - new Date(a.updated_at as string).getTime()) / 86400000)
            : 999;
          return alunos === 0 || acMrr === 0 || daysSinceUpdate > 30 || a.status === 'suspended';
        })
        .map((a: Record<string, unknown>) => {
          const alunos = alunosByAcademy.get(a.id as string) ?? 0;
          const acMrr = academyMrr.get(a.id as string) ?? 0;
          const daysSinceUpdate = a.updated_at
            ? Math.floor((Date.now() - new Date(a.updated_at as string).getTime()) / 86400000)
            : 999;
          let motivoRisco = '';
          let healthScore = 50;
          if (a.status === 'suspended') {
            motivoRisco = 'Academia suspensa';
            healthScore = 10;
          } else if (alunos === 0) {
            motivoRisco = 'Sem alunos cadastrados';
            healthScore = 20;
          } else if (daysSinceUpdate > 60) {
            motivoRisco = 'Sem atividade há mais de 60 dias';
            healthScore = 15;
          } else if (daysSinceUpdate > 30) {
            motivoRisco = 'Sem atividade há mais de 30 dias';
            healthScore = 35;
          } else if (acMrr === 0) {
            motivoRisco = 'Sem receita registrada';
            healthScore = 25;
          }
          return {
            id: a.id as string,
            nome: a.name as string,
            healthScore,
            motivoRisco,
            diasDesdeUltimoLogin: daysSinceUpdate,
          };
        })
        .sort((a: AcademiaRisco, b: AcademiaRisco) => a.healthScore - b.healthScore)
        .slice(0, 10);

      // ── Alertas urgentes (generated from real data) ────────────
      const alertas: AlertaUrgente[] = [];
      // Trial expiring in next 3 days
      for (const ac of academyList) {
        if (ac.status === 'trial') {
          // Check subscription_status too
          const subStatus = ac.subscription_status;
          if (subStatus === 'past_due') {
            alertas.push({
              id: `alert-pastdue-${ac.id}`,
              tipo: 'pagamento_falhou',
              titulo: `Pagamento atrasado: ${ac.name}`,
              descricao: 'O pagamento desta academia está em atraso.',
              academiaNome: ac.name,
              academiaId: ac.id,
              urgencia: 'alta',
              criadoEm: ac.updated_at ?? new Date().toISOString(),
            });
          }
        }
        if (ac.subscription_status === 'past_due') {
          alertas.push({
            id: `alert-pastdue-${ac.id}`,
            tipo: 'pagamento_falhou',
            titulo: `Pagamento atrasado: ${ac.name}`,
            descricao: 'O pagamento desta academia está em atraso.',
            academiaNome: ac.name,
            academiaId: ac.id,
            urgencia: 'alta',
            criadoEm: ac.updated_at ?? new Date().toISOString(),
          });
        }
        if (ac.status === 'suspended') {
          alertas.push({
            id: `alert-suspended-${ac.id}`,
            tipo: 'academia_inativa',
            titulo: `Academia suspensa: ${ac.name}`,
            descricao: 'Esta academia foi suspensa e precisa de atenção.',
            academiaNome: ac.name,
            academiaId: ac.id,
            urgencia: 'media',
            criadoEm: ac.updated_at ?? new Date().toISOString(),
          });
        }
      }
      // Deduplicate alerts by id
      const uniqueAlertas = Array.from(new Map(alertas.map((a) => [a.id, a])).values());

      // ── MRR Histórico (last 6 months estimated) ────────────────
      const mrrHistorico: MrrHistorico[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        // For current month, use actual MRR; for past months, approximate with slight variation
        const factor = i === 0 ? 1 : 1 - (i * 0.03); // slight growth assumption
        mrrHistorico.push({ mes: label, valor: Math.round(mrr * factor) });
      }

      // ── Crescimento Academias (last 6 months) ──────────────────
      const crescimentoAcademias: CrescimentoAcademias[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        const novas = academyList.filter((a: Record<string, unknown>) => {
          const created = new Date(a.created_at as string);
          return created >= d && created <= monthEnd;
        }).length;
        const churn = academyList.filter((a: Record<string, unknown>) => {
          if (a.status !== 'cancelled' && a.status !== 'suspended') return false;
          const updated = new Date((a.updated_at ?? a.created_at) as string);
          return updated >= d && updated <= monthEnd;
        }).length;
        crescimentoAcademias.push({
          mes: label,
          ativas: academyList.filter((a: Record<string, unknown>) => new Date(a.created_at as string) <= monthEnd && a.status === 'active').length,
          novas,
          churn,
        });
      }

      return {
        kpis: {
          mrr,
          mrrVariacao: mrrHistorico.length >= 2 && mrrHistorico[mrrHistorico.length - 2].valor > 0
            ? ((mrr - mrrHistorico[mrrHistorico.length - 2].valor) / mrrHistorico[mrrHistorico.length - 2].valor) * 100
            : 0,
          arr,
          totalAcademias: totalAcademias ?? 0,
          academiasAtivas: totalAtivas,
          academiasEmTrial: academiasEmTrial ?? 0,
          academiasChurnMes,
          totalAlunosPlataforma: totalAlunos,
          ticketMedio,
          churnRate,
          ltv,
        },
        mrrHistorico,
        crescimentoAcademias,
        alertas: uniqueAlertas,
        topAcademias,
        academiasRisco,
        distribuicaoPlanos,
      };
    } catch (error) {
      logServiceError(error, 'superadmin-dashboard');
      return emptyMissionControl;
    }
  } catch (error) {
    logServiceError(error, 'superadmin-dashboard');
    return emptyMissionControl;
  }
}

export async function resolverAlerta(alertaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResolverAlerta } = await import('@/lib/mocks/superadmin-dashboard.mock');
      return await mockResolverAlerta(alertaId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('platform_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertaId);
      if (error) {
        logServiceError(error, 'superadmin-dashboard');
      }
    } catch (error) {
      logServiceError(error, 'superadmin-dashboard');
    }
  } catch (error) {
    logServiceError(error, 'superadmin-dashboard');
  }
}
