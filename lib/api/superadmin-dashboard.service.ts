import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

export async function getMissionControl(): Promise<MissionControlDTO> {
  try {
    if (isMock()) {
      const { mockGetMissionControl } = await import('@/lib/mocks/superadmin-dashboard.mock');
      return mockGetMissionControl();
    }
    const res = await fetch('/api/superadmin/dashboard');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'superadmin-dashboard.getMissionControl'); }
}

export async function resolverAlerta(alertaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResolverAlerta } = await import('@/lib/mocks/superadmin-dashboard.mock');
      return mockResolverAlerta(alertaId);
    }
    const res = await fetch(`/api/superadmin/alertas/${alertaId}/resolver`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) { handleServiceError(error, 'superadmin-dashboard.resolverAlerta'); }
}
