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
      // Fetch academy count as base KPI
      const { count: totalAcademias } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });
      const { count: academiasAtivas } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      return {
        ...emptyMissionControl,
        kpis: {
          ...emptyMissionControl.kpis,
          totalAcademias: totalAcademias ?? 0,
          academiasAtivas: academiasAtivas ?? 0,
        },
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
