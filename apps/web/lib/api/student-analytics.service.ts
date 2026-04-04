import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface RadarMetrics {
  technique: number;
  discipline: number;
  attendance: number;
  evolution: number;
}

export interface MonthlyAttendance {
  month: string;
  count: number;
}

export interface StudentPerformanceDTO {
  radar: RadarMetrics;
  class_avg_radar: RadarMetrics;
  monthly_attendance: MonthlyAttendance[];
  max_streak: number;
  total_training_hours: number;
  recommendations: string[];
  video_suggestions: Array<{ id: string; title: string; reason: string }>;
}

export async function getStudentPerformance(studentId: string): Promise<StudentPerformanceDTO> {
  try {
    if (isMock()) {
      const { mockGetStudentPerformance } = await import('@/lib/mocks/student-analytics.mock');
      return mockGetStudentPerformance(studentId);
    }
    const EMPTY: StudentPerformanceDTO = { radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, class_avg_radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, monthly_attendance: [], max_streak: 0, total_training_hours: 0, recommendations: [], video_suggestions: [] };

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();

      // ── Parallel queries ─────────────────────────────────────
      const [attendanceRes, evalRes, classEvalsRes, xpRes] = await Promise.all([
        supabase.from('attendance')
          .select('checked_at')
          .eq('student_id', studentId)
          .gte('checked_at', sixMonthsAgo)
          .order('checked_at', { ascending: false }),
        supabase.from('evaluations')
          .select('criteria, score')
          .eq('student_id', studentId),
        // Class average: all evaluations for classes this student is enrolled in
        supabase.from('evaluations')
          .select('criteria, score, class_id'),
        supabase.from('xp_ledger')
          .select('amount')
          .eq('student_id', studentId),
        supabase.from('students')
          .select('id, started_at')
          .eq('id', studentId)
          .single(),
      ]);

      // ── Radar metrics (from evaluations) ─────────────────────
      const evalData = evalRes.data ?? [];
      const byC: Record<string, number[]> = { technique: [], discipline: [], attendance: [], evolution: [] };
      for (const e of evalData as Record<string, unknown>[]) {
        const c = String(e.criteria ?? '');
        if (byC[c]) byC[c].push(Number(e.score ?? 0));
      }
      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      const radar: RadarMetrics = {
        technique: avg(byC.technique),
        discipline: avg(byC.discipline),
        attendance: avg(byC.attendance),
        evolution: avg(byC.evolution),
      };

      // ── Class average radar ──────────────────────────────────
      const classEvals = classEvalsRes.data ?? [];
      const classC: Record<string, number[]> = { technique: [], discipline: [], attendance: [], evolution: [] };
      for (const e of classEvals as Record<string, unknown>[]) {
        const c = String(e.criteria ?? '');
        if (classC[c]) classC[c].push(Number(e.score ?? 0));
      }
      const classAvgRadar: RadarMetrics = {
        technique: avg(classC.technique),
        discipline: avg(classC.discipline),
        attendance: avg(classC.attendance),
        evolution: avg(classC.evolution),
      };

      // ── Monthly attendance ───────────────────────────────────
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthCounts = new Map<string, number>();
      for (const a of (attendanceRes.data ?? []) as Record<string, unknown>[]) {
        const d = new Date(a.checked_at as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
      }
      const monthlyAttendance: MonthlyAttendance[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyAttendance.push({ month: monthNames[d.getMonth()], count: monthCounts.get(key) ?? 0 });
      }

      // ── Max streak ───────────────────────────────────────────
      const dates = (attendanceRes.data ?? [])
        .map((r: Record<string, unknown>) => (r.checked_at as string).split('T')[0])
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
      let maxStreak = dates.length > 0 ? 1 : 0;
      let currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 1;
        }
      }

      // ── Total training hours (attendance count * ~1.5h per session) ──
      const totalAttendance = (attendanceRes.data ?? []).length;
      const totalTrainingHours = Math.round(totalAttendance * 1.5);

      // ── XP total ─────────────────────────────────────────────
      const totalXp = (xpRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);

      // ── Recommendations ──────────────────────────────────────
      const recommendations: string[] = [];
      if (radar.attendance < 50) recommendations.push('Tente aumentar sua frequência para ao menos 3x por semana.');
      if (radar.technique < 50) recommendations.push('Foque em refinar os movimentos básicos durante o treino.');
      if (radar.discipline < 50) recommendations.push('Mantenha a disciplina nos treinos para evoluir mais rápido.');
      if (totalXp > 200 && radar.evolution < 60) recommendations.push('Você tem bom XP — hora de focar em evoluir a qualidade técnica.');
      if (recommendations.length === 0) recommendations.push('Continue assim! Seu desempenho está excelente.');

      return {
        radar,
        class_avg_radar: classAvgRadar,
        monthly_attendance: monthlyAttendance,
        max_streak: maxStreak,
        total_training_hours: totalTrainingHours,
        recommendations,
        video_suggestions: [],
      };
    } catch (err) {
      logServiceError(err, 'student-analytics');
      return EMPTY;
    }
  } catch (error) {
    logServiceError(error, 'student-analytics');
    return { radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, class_avg_radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, monthly_attendance: [], max_streak: 0, total_training_hours: 0, recommendations: [], video_suggestions: [] };
  }
}
