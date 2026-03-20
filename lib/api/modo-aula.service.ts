import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('classes')
      .select('id, name, modality, schedule, room, capacity')
      .eq('id', turmaId)
      .single();

    if (error || !data) {
      console.warn('[getModoAula] Supabase error:', error?.message);
      return { turma: { id: turmaId, nome: '', modalidade: '', horario: '', sala: '', capacidade: 0 }, alunos: [], alertas: [] };
    }

    return {
      turma: {
        id: String(data.id),
        nome: String(data.name ?? ''),
        modalidade: String(data.modality ?? ''),
        horario: String(data.schedule ?? ''),
        sala: String(data.room ?? ''),
        capacidade: Number(data.capacity ?? 0),
      },
      alunos: [],
      alertas: [],
    };
  } catch (error) {
    console.warn('[getModoAula] Fallback:', error);
    return { turma: { id: turmaId, nome: '', modalidade: '', horario: '', sala: '', capacidade: 0 }, alunos: [], alertas: [] };
  }
}

export async function registrarPresenca(turmaId: string, alunoId: string, presente: boolean): Promise<void> {
  try {
    if (isMock()) {
      const { mockRegistrarPresenca } = await import('@/lib/mocks/modo-aula.mock');
      return mockRegistrarPresenca(turmaId, alunoId, presente);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('attendance')
      .upsert({ class_id: turmaId, student_id: alunoId, present: presente, date: new Date().toISOString().split('T')[0] });

    if (error) {
      console.warn('[registrarPresenca] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[registrarPresenca] Fallback:', error);
  }
}

export async function encerrarAula(turmaId: string): Promise<{ totalPresentes: number; totalAlunos: number }> {
  try {
    if (isMock()) {
      const { mockEncerrarAula } = await import('@/lib/mocks/modo-aula.mock');
      return mockEncerrarAula(turmaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', turmaId)
      .eq('date', today)
      .eq('present', true);

    if (error) {
      console.warn('[encerrarAula] Supabase error:', error.message);
      return { totalPresentes: 0, totalAlunos: 0 };
    }

    return { totalPresentes: count ?? 0, totalAlunos: 0 };
  } catch (error) {
    console.warn('[encerrarAula] Fallback:', error);
    return { totalPresentes: 0, totalAlunos: 0 };
  }
}
