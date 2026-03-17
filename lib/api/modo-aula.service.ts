import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface ModoAulaDTO {
  turma: {
    id: string;
    nome: string;
    modalidade: string;
    horario: string;
    sala: string;
    capacidade: number;
  };
  alunos: AlunoNaAula[];
  alertas: AlertaAula[];
  aulaAnterior?: {
    data: string;
    tecnicasEnsinadas: string[];
    observacoes: string;
    presentes: number;
  };
}

export interface AlunoNaAula {
  id: string;
  nome: string;
  avatar?: string;
  faixa: string;
  graus: number;
  presente: boolean;
  metodoCheckin?: 'qr_code' | 'manual' | 'automatico';
  checkinHora?: string;
  restricaoMedica?: string;
  diasDesdeUltimoTreino: number;
  totalAulasNoMes: number;
  sequenciaPresenca: number;
  aniversarioHoje: boolean;
}

export interface AlertaAula {
  tipo: 'restricao_medica' | 'ausencia_prolongada' | 'aniversario' | 'graduacao_pronta' | 'primeiro_dia' | 'retorno';
  alunoId: string;
  alunoNome: string;
  mensagem: string;
  urgencia: 'alta' | 'media' | 'info';
}

// ── Service Functions ──────────────────────────────────────────────────

export async function getModoAula(turmaId: string): Promise<ModoAulaDTO> {
  try {
    if (isMock()) {
      const { mockGetModoAula } = await import('@/lib/mocks/modo-aula.mock');
      return mockGetModoAula(turmaId);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'modoAula.get');
  }
}

export async function registrarPresenca(turmaId: string, alunoId: string, presente: boolean): Promise<void> {
  try {
    if (isMock()) {
      const { mockRegistrarPresenca } = await import('@/lib/mocks/modo-aula.mock');
      return mockRegistrarPresenca(turmaId, alunoId, presente);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'modoAula.registrarPresenca');
  }
}

export async function encerrarAula(turmaId: string): Promise<{ totalPresentes: number; totalAlunos: number }> {
  try {
    if (isMock()) {
      const { mockEncerrarAula } = await import('@/lib/mocks/modo-aula.mock');
      return mockEncerrarAula(turmaId);
    }
    throw new Error('Supabase not implemented');
  } catch (error) {
    handleServiceError(error, 'modoAula.encerrar');
  }
}
