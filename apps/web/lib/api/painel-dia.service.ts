import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface AulaHoje {
  id: string;
  turma: string;
  horario: string;
  professor: string;
  alunosEsperados: number;
  sala: string;
}

export interface Aniversariante {
  id: string;
  nome: string;
  idade: number;
  avatar?: string;
}

export interface PagamentoVencendo {
  id: string;
  aluno: string;
  valor: number;
  diasAtraso: number;
}

export interface AlunoRisco {
  id: string;
  nome: string;
  ultimoCheckin: string;
  diasAusente: number;
  faixa: string;
}

export interface GraduacaoPronta {
  id: string;
  aluno: string;
  faixaAtual: string;
  proximaFaixa: string;
  requisitosOk: boolean;
}

export interface ResumoDia {
  alunosAtivos: number;
  aulasHoje: number;
  presencasHoje: number;
  receitaMes: number;
  taxaPresencaSemana: number;
}

export interface DailyBriefingDTO {
  aulasHoje: AulaHoje[];
  aniversariantes: Aniversariante[];
  vencendoAmanha: PagamentoVencendo[];
  alunosRisco: AlunoRisco[];
  graduacoesProntas: GraduacaoPronta[];
  resumo: ResumoDia;
}

export async function getDailyBriefing(academyId: string): Promise<DailyBriefingDTO> {
  try {
    if (isMock()) {
      const { mockGetDailyBriefing } = await import('@/lib/mocks/painel-dia.mock');
      return mockGetDailyBriefing(academyId);
    }
    const EMPTY: DailyBriefingDTO = {
      aulasHoje: [],
      aniversariantes: [],
      vencendoAmanha: [],
      alunosRisco: [],
      graduacoesProntas: [],
      resumo: { alunosAtivos: 0, aulasHoje: 0, presencasHoje: 0, receitaMes: 0, taxaPresencaSemana: 0 },
    };

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayDay = now.getDay();
      const todayMonth = now.getMonth() + 1;
      const todayDayOfMonth = now.getDate();

      // ── Parallel queries ─────────────────────────────────────
      const [classesRes, checkinsRes, studentsRes, overdueRes, revenueRes, weekAttRes] = await Promise.all([
        supabase.from('classes')
          .select('id, schedule, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id, name)')
          .eq('units.academy_id', academyId),
        supabase.from('attendance')
          .select('id, student_id, checked_at')
          .gte('checked_at', todayStart)
          .lt('checked_at', tomorrowStart),
        supabase.from('students')
          .select('id, belt, started_at, profiles!students_profile_id_fkey(id, display_name, avatar, birth_date)')
          .eq('academy_id', academyId),
        supabase.from('invoices')
          .select('id, amount, due_date, subscription_id, subscriptions!inner(student_id, students!inner(profiles!students_profile_id_fkey(display_name)))')
          .eq('status', 'open')
          .lt('due_date', todayStart),
        supabase.from('invoices')
          .select('amount')
          .eq('status', 'paid')
          .gte('created_at', startOfMonth),
        supabase.from('attendance')
          .select('id', { count: 'exact', head: true })
          .gte('checked_at', weekAgo),
      ]);

      // ── Today's classes ──────────────────────────────────────
      const allStudents = studentsRes.data ?? [];
      const aulasHoje: AulaHoje[] = [];
      for (const cls of (classesRes.data ?? []) as Record<string, unknown>[]) {
        const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string }>) ?? [];
        for (const slot of schedule) {
          if (slot.day_of_week === todayDay) {
            const mod = cls.modalities as Record<string, unknown> | null;
            const prof = cls.profiles as Record<string, unknown> | null;
            const unit = cls.units as Record<string, unknown> | null;
            aulasHoje.push({
              id: String(cls.id ?? ''),
              turma: (mod?.name ?? '') as string,
              horario: slot.start_time,
              professor: (prof?.display_name ?? '') as string,
              alunosEsperados: 0,
              sala: (unit?.name ?? '') as string,
            });
          }
        }
      }

      // ── Birthdays (profiles where birth_date month/day match today) ──
      const aniversariantes: Aniversariante[] = [];
      for (const s of allStudents as Record<string, unknown>[]) {
        const prof = s.profiles as Record<string, unknown> | null;
        if (!prof?.birth_date) continue;
        const bd = new Date(prof.birth_date as string);
        if (bd.getMonth() + 1 === todayMonth && bd.getDate() === todayDayOfMonth) {
          const age = now.getFullYear() - bd.getFullYear();
          aniversariantes.push({
            id: String(s.id ?? ''),
            nome: (prof.display_name ?? '') as string,
            idade: age,
            avatar: (prof.avatar as string) || undefined,
          });
        }
      }

      // ── Overdue invoices ─────────────────────────────────────
      const vencendoAmanha: PagamentoVencendo[] = (overdueRes.data ?? []).map((inv: Record<string, unknown>) => {
        const sub = inv.subscriptions as Record<string, unknown> | null;
        const stu = sub?.students as Record<string, unknown> | null;
        const prof = stu?.profiles as Record<string, unknown> | null;
        const dueDate = new Date(inv.due_date as string);
        const diasAtraso = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          id: String(inv.id ?? ''),
          aluno: (prof?.display_name ?? '') as string,
          valor: Number(inv.amount ?? 0),
          diasAtraso,
        };
      });

      // ── At-risk students (no check-in in 14+ days) ──────────
      const todayCheckins = (checkinsRes.data ?? []).length;
      const alunosRisco: AlunoRisco[] = [];

      // Batch: fetch all attendance ordered by student + recency in one query
      const studentIds = allStudents.map((s: Record<string, unknown>) => String(s.id));
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('student_id, checked_at')
        .in('student_id', studentIds.length > 0 ? studentIds : ['__none__'])
        .order('checked_at', { ascending: false });

      // Build map: student_id -> last checked_at
      const lastAttMap = new Map<string, string>();
      for (const att of (recentAttendance ?? []) as Array<Record<string, unknown>>) {
        const sid = String(att.student_id);
        if (!lastAttMap.has(sid)) {
          lastAttMap.set(sid, att.checked_at as string);
        }
      }

      for (const s of allStudents as Record<string, unknown>[]) {
        const prof = s.profiles as Record<string, unknown> | null;
        const sid = String(s.id);
        const lastCheckedAt = lastAttMap.get(sid);
        if (lastCheckedAt) {
          const lastDate = new Date(lastCheckedAt);
          const diasAusente = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diasAusente >= 14) {
            alunosRisco.push({
              id: sid,
              nome: (prof?.display_name ?? '') as string,
              ultimoCheckin: lastCheckedAt.split('T')[0],
              diasAusente,
              faixa: String(s.belt ?? 'white'),
            });
          }
        }
        // Students with NO attendance at all are also at risk
        if (!lastCheckedAt) {
          const startedAt = s.started_at ? new Date(s.started_at as string) : now;
          const diasAusente = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
          if (diasAusente >= 14) {
            alunosRisco.push({
              id: sid,
              nome: (prof?.display_name ?? '') as string,
              ultimoCheckin: '',
              diasAusente,
              faixa: String(s.belt ?? 'white'),
            });
          }
        }
      }
      // Limit to top 10 most at-risk
      alunosRisco.sort((a, b) => b.diasAusente - a.diasAusente);
      alunosRisco.splice(10);

      // ── Summary ──────────────────────────────────────────────
      const totalActiveStudents = allStudents.length;
      const receitaMes = (revenueRes.data ?? []).reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.amount) || 0), 0);
      const weekAttCount = weekAttRes.count ?? 0;
      const expectedWeekAtt = totalActiveStudents * 3; // assume 3 sessions/week target
      const taxaPresencaSemana = expectedWeekAtt > 0 ? Math.round((weekAttCount / expectedWeekAtt) * 100) : 0;

      return {
        aulasHoje,
        aniversariantes,
        vencendoAmanha,
        alunosRisco,
        graduacoesProntas: [],
        resumo: {
          alunosAtivos: totalActiveStudents,
          aulasHoje: aulasHoje.length,
          presencasHoje: todayCheckins,
          receitaMes,
          taxaPresencaSemana: Math.min(100, taxaPresencaSemana),
        },
      };
    } catch (err) {
      logServiceError(err, 'painel-dia');
      return EMPTY;
    }
  } catch (error) {
    logServiceError(error, 'painel-dia');
    return {
      aulasHoje: [],
      aniversariantes: [],
      vencendoAmanha: [],
      alunosRisco: [],
      graduacoesProntas: [],
      resumo: { alunosAtivos: 0, aulasHoje: 0, presencasHoje: 0, receitaMes: 0, taxaPresencaSemana: 0 },
    };
  }
}
