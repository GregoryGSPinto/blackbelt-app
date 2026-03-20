import { isMock } from '@/lib/env';

export interface AdminDashboardDTO {
  totalAlunos: number;
  alunosAtivos: number;
  novosEsteMes: number;
  totalTurmas: number;
  turmasHoje: number;
  receitaMensal: number;
  inadimplencia: number;
  presencaMedia: number;
  ultimosCheckins: RecentCheckin[];
  proximasAulas: UpcomingClass[];
  alertas: DashboardAlert[];
}

export interface RecentCheckin {
  student_name: string;
  class_name: string;
  time: string;
}

export interface UpcomingClass {
  class_name: string;
  professor_name: string;
  time: string;
  enrolled: number;
}

export interface DashboardAlert {
  type: 'payment' | 'capacity' | 'system';
  message: string;
  severity: 'warning' | 'error' | 'info';
}

export interface AdminMetrics {
  presencaPorDia: { date: string; count: number }[];
  receitaPorMes: { month: string; receita: number; inadimplencia: number }[];
  alunosPorFaixa: { belt: string; count: number }[];
  turmasLotacao: { name: string; percent: number }[];
}

export async function getAdminDashboard(academyId: string): Promise<AdminDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetAdminDashboard } = await import('@/lib/mocks/admin.mock');
      return mockGetAdminDashboard(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallel queries
    const [studentsRes, newStudentsRes, classesRes, attendanceRes, recentCheckinsRes, subscriptionsRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', academyId),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', startOfMonth),
      supabase.from('classes').select('id, schedule, capacity, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id), class_enrollments(count)').eq('units.academy_id', academyId),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).gte('checked_at', startOfMonth),
      supabase.from('attendance').select('student_id, class_id, checked_at, students(profiles(display_name)), classes(modalities(name))').order('checked_at', { ascending: false }).limit(5),
      supabase.from('subscriptions').select('status, plans!inner(academy_id)').eq('plans.academy_id', academyId),
    ]);

    const totalAlunos = studentsRes.count ?? 0;
    const novosEsteMes = newStudentsRes.count ?? 0;
    const classes = classesRes.data ?? [];
    const totalTurmas = classes.length;

    // Active students (attended at least once this month)
    const alunosAtivos = totalAlunos; // simplified

    // Today's classes
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let turmasHoje = 0;
    const proximasAulas: UpcomingClass[] = [];

    for (const cls of classes) {
      const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
      for (const slot of schedule) {
        if (slot.day_of_week === currentDay) {
          turmasHoje++;
          if (slot.start_time > currentTime) {
            const modalities = cls.modalities as Record<string, unknown> | null;
            const profiles = cls.profiles as Record<string, unknown> | null;
            const enrollments = cls.class_enrollments as Array<Record<string, number>> | null;
            proximasAulas.push({
              class_name: (modalities?.name ?? '') as string,
              professor_name: (profiles?.display_name ?? '') as string,
              time: slot.start_time,
              enrolled: enrollments?.[0]?.count ?? 0,
            });
          }
        }
      }
    }

    // Recent checkins
    const ultimosCheckins: RecentCheckin[] = (recentCheckinsRes.data ?? []).map((a: Record<string, unknown>) => {
      const students = a.students as Record<string, unknown> | null;
      const profiles = students?.profiles as Record<string, unknown> | null;
      const classData = a.classes as Record<string, unknown> | null;
      const modalities = classData?.modalities as Record<string, unknown> | null;
      return {
        student_name: (profiles?.display_name ?? '') as string,
        class_name: (modalities?.name ?? '') as string,
        time: a.checked_at as string,
      };
    });

    // Revenue (simplified)
    const subs = subscriptionsRes.data ?? [];
    const activeSubs = subs.filter((s: Record<string, unknown>) => s.status === 'active').length;
    const pastDueSubs = subs.filter((s: Record<string, unknown>) => s.status === 'past_due').length;

    // Attendance average
    const monthAttendance = attendanceRes.count ?? 0;
    const presencaMedia = totalAlunos > 0 ? Math.round((monthAttendance / (totalAlunos * 20)) * 100) : 0;

    const alertas: DashboardAlert[] = [];
    if (pastDueSubs > 0) {
      alertas.push({ type: 'payment', message: `${pastDueSubs} aluno(s) inadimplente(s)`, severity: 'warning' });
    }

    return {
      totalAlunos,
      alunosAtivos,
      novosEsteMes,
      totalTurmas,
      turmasHoje,
      receitaMensal: activeSubs * 150, // simplified
      inadimplencia: subs.length > 0 ? Math.round((pastDueSubs / subs.length) * 100) : 0,
      presencaMedia,
      ultimosCheckins,
      proximasAulas: proximasAulas.slice(0, 5),
      alertas,
    };
  } catch (error) {
    console.warn('[getAdminDashboard] Fallback:', error);
    return {
      totalAlunos: 0, alunosAtivos: 0, novosEsteMes: 0, totalTurmas: 0, turmasHoje: 0,
      receitaMensal: 0, inadimplencia: 0, presencaMedia: 0, ultimosCheckins: [], proximasAulas: [], alertas: [],
    };
  }
}

export async function getAdminMetrics(academyId: string, _period: string = '30d'): Promise<AdminMetrics> {
  try {
    if (isMock()) {
      const { mockGetAdminMetrics } = await import('@/lib/mocks/admin.mock');
      return mockGetAdminMetrics(academyId, _period);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [attendanceRes, studentsRes, classesRes] = await Promise.all([
      supabase.from('attendance').select('checked_at').gte('checked_at', thirtyDaysAgo),
      supabase.from('students').select('belt').eq('academy_id', academyId),
      supabase.from('classes').select('capacity, modalities(name), units!inner(academy_id), class_enrollments(count)').eq('units.academy_id', academyId),
    ]);

    // Attendance per day
    const dayMap = new Map<string, number>();
    for (const a of attendanceRes.data ?? []) {
      const day = new Date(a.checked_at).toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
    }
    const presencaPorDia = [...dayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Students by belt
    const beltMap = new Map<string, number>();
    for (const s of studentsRes.data ?? []) {
      beltMap.set(s.belt, (beltMap.get(s.belt) ?? 0) + 1);
    }
    const alunosPorFaixa = [...beltMap.entries()].map(([belt, count]) => ({ belt, count }));

    // Class capacity
    const turmasLotacao = (classesRes.data ?? []).map((c: Record<string, unknown>) => {
      const modalities = c.modalities as Record<string, unknown> | null;
      const enrollments = c.class_enrollments as Array<Record<string, number>> | null;
      const enrolled = enrollments?.[0]?.count ?? 0;
      const capacity = (c.capacity as number) ?? 30;
      return {
        name: (modalities?.name ?? '') as string,
        percent: capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0,
      };
    });

    return {
      presencaPorDia,
      receitaPorMes: [], // Simplified — would need invoice aggregation
      alunosPorFaixa,
      turmasLotacao,
    };
  } catch (error) {
    console.warn('[getAdminMetrics] Fallback:', error);
    return { presencaPorDia: [], receitaPorMes: [], alunosPorFaixa: [], turmasLotacao: [] };
  }
}
