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

    // Get class with modality and unit info
    const { data: cls, error } = await supabase
      .from('classes')
      .select('id, schedule, modalities(name), units(name)')
      .eq('id', turmaId)
      .single();

    if (error || !cls) {
      console.error('[getModoAula] Supabase error:', error?.message);
      return { turma: { id: turmaId, nome: '', modalidade: '', horario: '', sala: '', capacidade: 0 }, alunos: [], alertas: [] };
    }

    const mod = cls.modalities as Record<string, unknown> | null;
    const unit = cls.units as Record<string, unknown> | null;

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select(`
        student_id,
        students(id, belt, profiles(display_name, avatar))
      `)
      .eq('class_id', turmaId)
      .eq('status', 'active');

    // Get today's attendance for this class
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('student_id, method, checked_at')
      .eq('class_id', turmaId)
      .gte('checked_at', todayStart.toISOString());

    const presentMap = new Map<string, { method: string; checked_at: string }>();
    for (const a of todayAttendance ?? []) {
      presentMap.set(a.student_id, { method: a.method, checked_at: a.checked_at });
    }

    const alunos: AlunoNaAula[] = (enrollments ?? []).map((e: Record<string, unknown>) => {
      const student = e.students as Record<string, unknown> | null;
      const profile = student?.profiles as Record<string, unknown> | null;
      const sid = e.student_id as string;
      const att = presentMap.get(sid);

      return {
        id: sid,
        nome: (profile?.display_name ?? '') as string,
        avatar: (profile?.avatar ?? undefined) as string | undefined,
        faixa: (student?.belt ?? 'white') as string,
        graus: 0,
        presente: !!att,
        metodoCheckin: att ? (att.method as AlunoNaAula['metodoCheckin']) : undefined,
        checkinHora: att ? new Date(att.checked_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        diasDesdeUltimoTreino: 0,
        totalAulasNoMes: 0,
        sequenciaPresenca: 0,
        aniversarioHoje: false,
      };
    });

    return {
      turma: {
        id: cls.id as string,
        nome: (mod?.name ?? '') as string,
        modalidade: (mod?.name ?? '') as string,
        horario: '',
        sala: (unit?.name ?? '') as string,
        capacidade: 0,
      },
      alunos,
      alertas: [],
    };
  } catch (error) {
    console.error('[getModoAula] Fallback:', error);
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

    if (presente) {
      // Insert attendance record (upsert to avoid duplicates)
      const { error } = await supabase
        .from('attendance')
        .upsert(
          {
            class_id: turmaId,
            student_id: alunoId,
            method: 'manual',
            checked_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,class_id', ignoreDuplicates: true },
        );

      if (error) {
        console.error('[registrarPresenca] Supabase error:', error.message);
      }
    } else {
      // Remove attendance record for today (mark as absent = no record)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('class_id', turmaId)
        .eq('student_id', alunoId)
        .gte('checked_at', todayStart.toISOString());

      if (error) {
        console.error('[registrarPresenca] Delete error:', error.message);
      }
    }
  } catch (error) {
    console.error('[registrarPresenca] Fallback:', error);
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Count today's attendance for this class
    const { count: presentCount, error: countError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', turmaId)
      .gte('checked_at', todayStart.toISOString());

    if (countError) {
      console.error('[encerrarAula] Supabase error:', countError.message);
      return { totalPresentes: 0, totalAlunos: 0 };
    }

    // Count total enrolled students
    const { count: enrolledCount } = await supabase
      .from('class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', turmaId)
      .eq('status', 'active');

    return {
      totalPresentes: presentCount ?? 0,
      totalAlunos: enrolledCount ?? 0,
    };
  } catch (error) {
    console.error('[encerrarAula] Fallback:', error);
    return { totalPresentes: 0, totalAlunos: 0 };
  }
}
