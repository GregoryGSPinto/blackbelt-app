import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface AulaResumo {
  turma: string;
  horario: string;
  professor: string;
  sala: string;
  matriculados: number;
  capacidade: number;
  status: 'em_andamento' | 'proxima' | 'concluida';
}

export interface CheckinResumo {
  alunoNome: string;
  alunoAvatar?: string;
  faixa: string;
  turma: string;
  horario: string;
  metodo: 'qr' | 'manual' | 'catraca';
}

export interface PendenciaRecepcao {
  tipo: 'pagamento_vencido' | 'aula_experimental' | 'contrato_pendente' | 'cadastro_incompleto' | 'mensagem';
  titulo: string;
  descricao: string;
  urgencia: 'alta' | 'media' | 'baixa';
  acao: { label: string; rota: string };
}

export interface ExperimentalResumo {
  id: string;
  nomeVisitante: string;
  telefone: string;
  turma: string;
  horario: string;
  status: 'agendada' | 'confirmada' | 'chegou' | 'nao_veio';
  origem: string;
}

export interface RecepcaoDashboardDTO {
  aulaEmAndamento?: {
    turma: string;
    professor: string;
    horario: string;
    presentes: number;
    capacidade: number;
    sala: string;
  };
  aulasHoje: AulaResumo[];
  checkinsHoje: CheckinResumo[];
  totalCheckinsHoje: number;
  pendencias: PendenciaRecepcao[];
  experimentaisHoje: ExperimentalResumo[];
  aniversariantes: { nome: string; avatar?: string; idade: number }[];
  resumo: {
    alunosAtivos: number;
    aulasHoje: number;
    pagamentosVencidosHoje: number;
    experimentaisHoje: number;
  };
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

const EMPTY_DASHBOARD: RecepcaoDashboardDTO = {
  aulasHoje: [],
  checkinsHoje: [],
  totalCheckinsHoje: 0,
  pendencias: [],
  experimentaisHoje: [],
  aniversariantes: [],
  resumo: { alunosAtivos: 0, aulasHoje: 0, pagamentosVencidosHoje: 0, experimentaisHoje: 0 },
};

export async function getRecepcaoDashboard(): Promise<RecepcaoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetRecepcaoDashboard } = await import('@/lib/mocks/recepcao-dashboard.mock');
      return mockGetRecepcaoDashboard();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];

    const [classesRes, checkinsRes] = await Promise.all([
      supabase.from('classes').select('*').eq('date', today),
      supabase.from('checkins').select('*').eq('date', today),
    ]);

    if (classesRes.error) console.warn('[getRecepcaoDashboard] classes error:', classesRes.error.message);
    if (checkinsRes.error) console.warn('[getRecepcaoDashboard] checkins error:', checkinsRes.error.message);

    return {
      ...EMPTY_DASHBOARD,
      totalCheckinsHoje: (checkinsRes.data ?? []).length,
      resumo: {
        alunosAtivos: 0,
        aulasHoje: (classesRes.data ?? []).length,
        pagamentosVencidosHoje: 0,
        experimentaisHoje: 0,
      },
    };
  } catch (error) {
    console.warn('[getRecepcaoDashboard] Fallback:', error);
    return EMPTY_DASHBOARD;
  }
}
