import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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

export async function getRecepcaoDashboard(): Promise<RecepcaoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetRecepcaoDashboard } = await import('@/lib/mocks/recepcao-dashboard.mock');
      return mockGetRecepcaoDashboard();
    }
    const res = await fetch('/api/recepcao/dashboard');
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-dashboard.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-dashboard.get');
  }
}
