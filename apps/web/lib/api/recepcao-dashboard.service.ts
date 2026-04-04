import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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
    const academyId = getActiveAcademyId();

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();
    const todayDay = now.getDay(); // 0=Sun .. 6=Sat
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // ── Parallel queries ──────────────────────────────────────────
    const [classesRes, checkinsRes, studentsCountRes, overdueRes, birthdayRes] = await Promise.all([
      supabase
        .from('classes')
        .select('id, schedule, capacity, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id), class_enrollments(count)')
        .eq('units.academy_id', academyId),
      supabase
        .from('checkins')
        .select('id, profile_name, belt, check_in_at, person_type, class_name')
        .gte('check_in_at', todayISO)
        .order('check_in_at', { ascending: false }),
      supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('academy_id', academyId),
      supabase
        .from('memberships')
        .select('id, monthly_amount, billing_status, profiles!memberships_profile_id_fkey(display_name)')
        .eq('academy_id', academyId)
        .eq('status', 'active')
        .eq('billing_status', 'atrasado'),
      supabase
        .from('people')
        .select('full_name, avatar_url, birth_date')
        .not('birth_date', 'is', null),
    ]);

    if (classesRes.error) logServiceError(classesRes.error, 'recepcao-dashboard');
    if (checkinsRes.error) logServiceError(checkinsRes.error, 'recepcao-dashboard');

    // ── Check-ins today ───────────────────────────────────────────
    const checkins = checkinsRes.data ?? [];
    const checkinsHoje: CheckinResumo[] = checkins.map((c: Record<string, unknown>) => ({
      alunoNome: (c.profile_name ?? '') as string,
      faixa: (c.belt ?? 'white') as string,
      turma: (c.class_name ?? '') as string,
      horario: c.check_in_at ? new Date(c.check_in_at as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      metodo: 'manual' as const,
    }));

    // ── Today's classes from schedule JSONB ────────────────────────
    const classes = classesRes.data ?? [];
    const aulasHoje: AulaResumo[] = [];
    let aulaEmAndamento: RecepcaoDashboardDTO['aulaEmAndamento'] | undefined;

    for (const cls of classes) {
      const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
      for (const slot of schedule) {
        if (slot.day_of_week === todayDay) {
          const mod = cls.modalities as Record<string, unknown> | null;
          const prof = cls.profiles as Record<string, unknown> | null;
          const enr = cls.class_enrollments as Array<Record<string, number>> | null;
          const cap = (cls.capacity as number) ?? 30;
          const enrolled = enr?.[0]?.count ?? 0;

          const isActive = slot.start_time <= currentTime && slot.end_time >= currentTime;
          const isDone = slot.end_time < currentTime;

          const turmaName = (mod?.name ?? 'Turma') as string;
          const profName = (prof?.display_name ?? '') as string;

          aulasHoje.push({
            turma: turmaName,
            horario: slot.start_time,
            professor: profName,
            sala: '',
            matriculados: enrolled,
            capacidade: cap,
            status: isActive ? 'em_andamento' : isDone ? 'concluida' : 'proxima',
          });

          if (isActive && !aulaEmAndamento) {
            // Count today's check-ins that mention this class
            const presentCount = checkins.filter(
              (ci: Record<string, unknown>) =>
                (ci.class_name as string)?.toLowerCase() === turmaName.toLowerCase()
            ).length;

            aulaEmAndamento = {
              turma: turmaName,
              professor: profName,
              horario: `${slot.start_time} - ${slot.end_time}`,
              presentes: presentCount,
              capacidade: cap,
              sala: '',
            };
          }
        }
      }
    }

    // Sort by time
    aulasHoje.sort((a, b) => a.horario.localeCompare(b.horario));

    // ── Pendencias (overdue members) ─────────────────────────────
    const pendencias: PendenciaRecepcao[] = [];
    const overdueMembers = overdueRes.data ?? [];
    for (const m of overdueMembers) {
      const prof = (m as Record<string, unknown>).profiles as Record<string, unknown> | null;
      const nome = (prof?.display_name ?? 'Aluno') as string;
      pendencias.push({
        tipo: 'pagamento_vencido',
        titulo: `Pagamento atrasado — ${nome}`,
        descricao: `Mensalidade em atraso. Verificar situacao financeira.`,
        urgencia: 'alta',
        acao: { label: 'Ver cobrancas', rota: '/recepcao/cobrancas' },
      });
    }

    // ── Birthdays ────────────────────────────────────────────────
    const aniversariantes: { nome: string; avatar?: string; idade: number }[] = [];
    const birthdayPeople = birthdayRes.data ?? [];
    for (const p of birthdayPeople) {
      const rec = p as Record<string, unknown>;
      const birthStr = rec.birth_date as string | null;
      if (!birthStr) continue;
      const bd = birthStr.slice(5); // "MM-DD"
      if (bd === todayMMDD) {
        const birthYear = parseInt(birthStr.slice(0, 4), 10);
        const age = now.getFullYear() - birthYear;
        aniversariantes.push({
          nome: (rec.full_name ?? '') as string,
          avatar: (rec.avatar_url ?? undefined) as string | undefined,
          idade: age,
        });
      }
    }

    // ── Active students count ─────────────────────────────────────
    const alunosAtivos = studentsCountRes.count ?? 0;

    return {
      aulaEmAndamento,
      aulasHoje,
      checkinsHoje,
      totalCheckinsHoje: checkins.length,
      pendencias,
      experimentaisHoje: [],
      aniversariantes,
      resumo: {
        alunosAtivos,
        aulasHoje: aulasHoje.length,
        pagamentosVencidosHoje: overdueMembers.length,
        experimentaisHoje: 0,
      },
    };
  } catch (error) {
    logServiceError(error, 'recepcao-dashboard');
    return EMPTY_DASHBOARD;
  }
}
