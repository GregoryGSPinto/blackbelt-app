import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const [classesRes, checkinsRes] = await Promise.all([
      supabase.from('classes').select('id, schedule, modalities(name), profiles!classes_professor_id_fkey(display_name)'),
      supabase.from('checkins').select('id, profile_name, belt, check_in_at, person_type, class_name').gte('check_in_at', todayISO),
    ]);

    if (classesRes.error) logServiceError(classesRes.error, 'recepcao-dashboard');
    if (checkinsRes.error) logServiceError(checkinsRes.error, 'recepcao-dashboard');

    const checkins = checkinsRes.data ?? [];
    const checkinsHoje: CheckinResumo[] = checkins.map((c: Record<string, unknown>) => ({
      alunoNome: (c.profile_name ?? '') as string,
      faixa: (c.belt ?? 'white') as string,
      turma: (c.class_name ?? '') as string,
      horario: c.check_in_at ? new Date(c.check_in_at as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      metodo: 'manual' as const,
    }));

    return {
      ...EMPTY_DASHBOARD,
      checkinsHoje,
      totalCheckinsHoje: checkins.length,
      resumo: {
        alunosAtivos: 0,
        aulasHoje: (classesRes.data ?? []).length,
        pagamentosVencidosHoje: 0,
        experimentaisHoje: 0,
      },
    };
  } catch (error) {
    logServiceError(error, 'recepcao-dashboard');
    return EMPTY_DASHBOARD;
  }
}
