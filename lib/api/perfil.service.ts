import { isMock } from '@/lib/env';
import type { BeltLevel, EvaluationCriteria, InvoiceStatus, PlanInterval } from '@/lib/types';

// ── Profile DTOs ───────────────────────────────────────────────────────

export interface StudentProfileDTO {
  id: string;
  display_name: string;
  avatar_url: string | null;
  belt: BeltLevel;
  academy_id: string;
  academy_name: string;
  started_at: string;
  total_classes: number;
  months_training: number;
  streak: number;
  ranking_position: number;
  total_students: number;
}

// ── Journey / Timeline DTOs ────────────────────────────────────────────

export type TimelineEventType =
  | 'enrollment'
  | 'belt_promotion'
  | 'achievement'
  | 'evaluation'
  | 'milestone';

export interface TimelineEventDTO {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  icon: string;
  belt?: BeltLevel;
}

// ── Evolution DTOs ─────────────────────────────────────────────────────

export interface TechniqueScoreDTO {
  criteria: EvaluationCriteria;
  label: string;
  score: number;
  max_score: number;
}

export interface EvolutionSnapshotDTO {
  date: string;
  label: string;
  scores: TechniqueScoreDTO[];
  overall: number;
}

export interface EvolutionDataDTO {
  current_scores: TechniqueScoreDTO[];
  history: EvolutionSnapshotDTO[];
}

// ── Attendance Heatmap DTOs ────────────────────────────────────────────

export interface HeatmapDayDTO {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ModalityDistributionDTO {
  modality: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AttendanceHeatmapDTO {
  days: HeatmapDayDTO[];
  total_year: number;
  longest_streak: number;
  current_streak: number;
  average_per_week: number;
  distribution: ModalityDistributionDTO[];
}

// ── Evaluation History DTOs ────────────────────────────────────────────

export interface EvaluationHistoryItemDTO {
  id: string;
  date: string;
  evaluator_name: string;
  evaluator_avatar: string | null;
  criteria: EvaluationCriteria;
  score: number;
  max_score: number;
  observation: string;
  belt_at_time: BeltLevel;
}

// ── Content Progress DTOs ──────────────────────────────────────────────

export interface VideoProgressDTO {
  video_id: string;
  title: string;
  duration: number;
  watched_seconds: number;
  progress_pct: number;
  completed: boolean;
  completed_at: string | null;
}

export interface TrailProgressDTO {
  trail_id: string;
  trail_name: string;
  total_videos: number;
  completed_videos: number;
  progress_pct: number;
  videos: VideoProgressDTO[];
}

export interface ContentProgressDTO {
  total_watched_minutes: number;
  total_completed: number;
  trails: TrailProgressDTO[];
}

// ── Financial DTOs ─────────────────────────────────────────────────────

export interface StudentPlanDTO {
  plan_id: string;
  plan_name: string;
  price: number;
  interval: PlanInterval;
  status: string;
  current_period_end: string;
}

export interface StudentInvoiceDTO {
  id: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_at: string | null;
  description: string;
}

export interface FinanceiroPerfilDTO {
  plan: StudentPlanDTO | null;
  invoices: StudentInvoiceDTO[];
}

// ── Service Functions ──────────────────────────────────────────────────

export async function getStudentProfile(studentId: string): Promise<StudentProfileDTO> {
  try {
    if (isMock()) {
      const { mockGetStudentProfile } = await import('@/lib/mocks/perfil.mock');
      return mockGetStudentProfile(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        id, belt, started_at, academy_id,
        profiles!students_profile_id_fkey(display_name, avatar),
        academies!students_academy_id_fkey(name)
      `)
      .eq('id', studentId)
      .single();

    if (error || !student) {
      console.warn('[getStudentProfile] Supabase error:', error?.message);
      return { id: studentId, display_name: '', avatar_url: null, belt: 'white' as BeltLevel, academy_id: '', academy_name: '', started_at: new Date().toISOString(), total_classes: 0, months_training: 0, streak: 0, ranking_position: 0, total_students: 0 };
    }

    const profile = student.profiles as Record<string, unknown> | null;
    const academy = student.academies as Record<string, unknown> | null;

    // Count total attendance
    const { count: totalClasses } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    // Count academy students for ranking
    const { count: totalStudents } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', student.academy_id);

    // Ranking position by total attendance
    const { data: rankingData } = await supabase
      .rpc('get_student_ranking', { p_student_id: studentId, p_academy_id: student.academy_id });

    const startedAt = new Date(student.started_at as string);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startedAt.getFullYear()) * 12 + (now.getMonth() - startedAt.getMonth());

    return {
      id: student.id as string,
      display_name: (profile?.display_name ?? 'Aluno') as string,
      avatar_url: (profile?.avatar ?? null) as string | null,
      belt: student.belt as BeltLevel,
      academy_id: student.academy_id as string,
      academy_name: (academy?.name ?? '') as string,
      started_at: student.started_at as string,
      total_classes: totalClasses ?? 0,
      months_training: Math.max(1, monthsDiff),
      streak: 0, // computed separately
      ranking_position: (rankingData as Record<string, unknown>)?.position as number ?? 1,
      total_students: totalStudents ?? 0,
    };
  } catch (error) {
    console.warn('[getStudentProfile] Fallback:', error);
    return { id: studentId, display_name: '', avatar_url: null, belt: 'white' as BeltLevel, academy_id: '', academy_name: '', started_at: new Date().toISOString(), total_classes: 0, months_training: 0, streak: 0, ranking_position: 0, total_students: 0 };
  }
}

export async function getJourneyTimeline(studentId: string): Promise<TimelineEventDTO[]> {
  try {
    if (isMock()) {
      const { mockGetJourneyTimeline } = await import('@/lib/mocks/perfil.mock');
      return mockGetJourneyTimeline(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const [progressionsRes, achievementsRes, evaluationsRes, studentRes] = await Promise.all([
      supabase.from('progressions')
        .select('id, from_belt, to_belt, created_at, profiles!progressions_evaluated_by_fkey(display_name)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
      supabase.from('achievements')
        .select('id, type, granted_at')
        .eq('student_id', studentId)
        .order('granted_at', { ascending: false }),
      supabase.from('evaluations')
        .select('id, criteria, score, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('students')
        .select('started_at')
        .eq('id', studentId)
        .single(),
    ]);

    const events: TimelineEventDTO[] = [];

    // Enrollment event
    if (studentRes.data) {
      events.push({
        id: 'enrollment-0',
        type: 'enrollment',
        title: 'Inicio da jornada',
        description: 'Matriculado na academia',
        date: studentRes.data.started_at as string,
        icon: '\uD83C\uDF1F',
      });
    }

    // Belt promotions
    for (const p of progressionsRes.data ?? []) {
      const evaluator = p.profiles as Record<string, unknown> | null;
      events.push({
        id: p.id as string,
        type: 'belt_promotion',
        title: `Promovido para faixa ${p.to_belt}`,
        description: `Avaliado por ${(evaluator?.display_name ?? 'Professor') as string}`,
        date: p.created_at as string,
        icon: '\uD83E\uDD4B',
        belt: p.to_belt as BeltLevel,
      });
    }

    // Achievements
    const achievementIcons: Record<string, string> = {
      attendance_streak: '\uD83D\uDD25',
      belt_promotion: '\uD83E\uDD4B',
      class_milestone: '\uD83C\uDFC5',
      custom: '\u2B50',
    };
    for (const a of achievementsRes.data ?? []) {
      events.push({
        id: a.id as string,
        type: 'achievement',
        title: `Conquista: ${a.type}`,
        description: 'Nova conquista desbloqueada',
        date: a.granted_at as string,
        icon: achievementIcons[a.type as string] ?? '\u2B50',
      });
    }

    // Evaluations
    for (const e of evaluationsRes.data ?? []) {
      events.push({
        id: e.id as string,
        type: 'evaluation',
        title: `Avaliacao: ${e.criteria}`,
        description: `Score ${e.score}/100`,
        date: e.created_at as string,
        icon: '\uD83D\uDCCB',
      });
    }

    // Sort by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return events;
  } catch (error) {
    console.warn('[getJourneyTimeline] Fallback:', error);
    return [];
  }
}

export async function getEvolutionData(studentId: string): Promise<EvolutionDataDTO> {
  try {
    if (isMock()) {
      const { mockGetEvolutionData } = await import('@/lib/mocks/perfil.mock');
      return mockGetEvolutionData(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('criteria, score, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[getEvolutionData] Supabase error:', error.message);
      return { current_scores: [], history: [] };
    }

    const criteriaLabels: Record<string, string> = {
      technique: 'Tecnica',
      discipline: 'Disciplina',
      attendance: 'Frequencia',
      evolution: 'Evolucao',
    };

    // Group by month for history
    const monthGroups = new Map<string, Array<{ criteria: string; score: number }>>();
    for (const ev of evaluations ?? []) {
      const monthKey = (ev.created_at as string).substring(0, 7);
      if (!monthGroups.has(monthKey)) monthGroups.set(monthKey, []);
      monthGroups.get(monthKey)!.push({ criteria: ev.criteria as string, score: ev.score as number });
    }

    const history: EvolutionSnapshotDTO[] = [];
    for (const [month, evals] of monthGroups) {
      const byCategory = new Map<string, number[]>();
      for (const e of evals) {
        if (!byCategory.has(e.criteria)) byCategory.set(e.criteria, []);
        byCategory.get(e.criteria)!.push(e.score);
      }
      const scores: TechniqueScoreDTO[] = [];
      let totalScore = 0;
      let count = 0;
      for (const [criteria, vals] of byCategory) {
        const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
        scores.push({
          criteria: criteria as EvaluationCriteria,
          label: criteriaLabels[criteria] ?? criteria,
          score: avg,
          max_score: 100,
        });
        totalScore += avg;
        count++;
      }
      history.push({
        date: month,
        label: month,
        scores,
        overall: count > 0 ? Math.round(totalScore / count) : 0,
      });
    }

    // Current scores = latest month
    const current_scores = history.length > 0
      ? history[history.length - 1].scores
      : Object.entries(criteriaLabels).map(([key, label]) => ({
          criteria: key as EvaluationCriteria,
          label,
          score: 0,
          max_score: 100,
        }));

    return { current_scores, history };
  } catch (error) {
    console.warn('[getEvolutionData] Fallback:', error);
    return { current_scores: [], history: [] };
  }
}

export async function getAttendanceHeatmap(studentId: string): Promise<AttendanceHeatmapDTO> {
  try {
    if (isMock()) {
      const { mockGetAttendanceHeatmap } = await import('@/lib/mocks/perfil.mock');
      return mockGetAttendanceHeatmap(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [attendanceRes] = await Promise.all([
      supabase.from('attendance')
        .select('checked_at, class_id, classes(modalities(name))')
        .eq('student_id', studentId)
        .gte('checked_at', oneYearAgo.toISOString())
        .order('checked_at', { ascending: true }),
      supabase.from('class_enrollments')
        .select('class_id, classes(modalities(name))')
        .eq('student_id', studentId)
        .eq('status', 'active'),
    ]);

    const attendance = attendanceRes.data ?? [];

    // Build heatmap days
    const dayCountMap = new Map<string, number>();
    const modalityCounts = new Map<string, number>();

    for (const a of attendance) {
      const dateStr = new Date(a.checked_at as string).toISOString().split('T')[0];
      dayCountMap.set(dateStr, (dayCountMap.get(dateStr) ?? 0) + 1);

      const cls = a.classes as Record<string, unknown> | null;
      const mod = cls?.modalities as Record<string, unknown> | null;
      const modName = (mod?.name ?? 'Outros') as string;
      modalityCounts.set(modName, (modalityCounts.get(modName) ?? 0) + 1);
    }

    // Generate all 365 days
    const days: HeatmapDayDTO[] = [];
    const cursor = new Date(oneYearAgo);
    const today = new Date();
    while (cursor <= today) {
      const dateStr = cursor.toISOString().split('T')[0];
      const count = dayCountMap.get(dateStr) ?? 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count >= 3 ? 3 : 4;
      days.push({ date: dateStr, count, level: level as 0 | 1 | 2 | 3 | 4 });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...dayCountMap.keys()].sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffMs = curr.getTime() - prev.getTime();
        if (diffMs <= 86400000 * 2) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    // Current streak from today backwards
    let checkDate = new Date().toISOString().split('T')[0];
    for (const date of [...sortedDates].reverse()) {
      if (date === checkDate) {
        currentStreak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().split('T')[0];
      } else if (date < checkDate) {
        break;
      }
    }

    const totalYear = attendance.length;
    const weeksInYear = 52;
    const averagePerWeek = Math.round((totalYear / weeksInYear) * 10) / 10;

    // Modality distribution
    const modalityColors = ['#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#EA580C'];
    const distribution: ModalityDistributionDTO[] = [];
    let i = 0;
    for (const [modality, count] of modalityCounts) {
      distribution.push({
        modality,
        count,
        percentage: totalYear > 0 ? Math.round((count / totalYear) * 100) : 0,
        color: modalityColors[i % modalityColors.length],
      });
      i++;
    }

    return {
      days,
      total_year: totalYear,
      longest_streak: longestStreak,
      current_streak: currentStreak,
      average_per_week: averagePerWeek,
      distribution,
    };
  } catch (error) {
    console.warn('[getAttendanceHeatmap] Fallback:', error);
    return { days: [], total_year: 0, longest_streak: 0, current_streak: 0, average_per_week: 0, distribution: [] };
  }
}

export async function getEvaluationHistory(studentId: string): Promise<EvaluationHistoryItemDTO[]> {
  try {
    if (isMock()) {
      const { mockGetEvaluationHistory } = await import('@/lib/mocks/perfil.mock');
      return mockGetEvaluationHistory(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('academy_id')
      .eq('id', studentId)
      .single();

    if (!student) {
      console.warn('[getEvaluationHistory] Student not found');
      return [];
    }

    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select(`
        id, criteria, score, created_at,
        classes(
          professor_id,
          profiles!classes_professor_id_fkey(display_name, avatar)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[getEvaluationHistory] Supabase error:', error.message);
      return [];
    }

    // Get belt at time of each evaluation via progressions
    const { data: progressions } = await supabase
      .from('progressions')
      .select('to_belt, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    const beltTimeline = (progressions ?? []).map((p: Record<string, unknown>) => ({
      belt: p.to_belt as BeltLevel,
      date: p.created_at as string,
    }));

    function getBeltAtDate(date: string): BeltLevel {
      let belt: BeltLevel = 'white' as BeltLevel;
      for (const entry of beltTimeline) {
        if (entry.date <= date) belt = entry.belt;
        else break;
      }
      return belt;
    }

    return (evaluations ?? []).map((ev: Record<string, unknown>) => {
      const cls = ev.classes as Record<string, unknown> | null;
      const prof = cls?.profiles as Record<string, unknown> | null;
      return {
        id: ev.id as string,
        date: ev.created_at as string,
        evaluator_name: (prof?.display_name ?? 'Professor') as string,
        evaluator_avatar: (prof?.avatar ?? null) as string | null,
        criteria: ev.criteria as EvaluationCriteria,
        score: ev.score as number,
        max_score: 100,
        observation: '',
        belt_at_time: getBeltAtDate(ev.created_at as string),
      };
    });
  } catch (error) {
    console.warn('[getEvaluationHistory] Fallback:', error);
    return [];
  }
}

export async function getContentProgress(studentId: string): Promise<ContentProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetContentProgress } = await import('@/lib/mocks/perfil.mock');
      return mockGetContentProgress(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('academy_id')
      .eq('id', studentId)
      .single();

    if (!student) {
      console.warn('[getContentProgress] Student not found');
      return { total_watched_minutes: 0, total_completed: 0, trails: [] };
    }

    const { data: watchHistory, error } = await supabase
      .from('video_watch_history')
      .select('video_id, watched_seconds, completed, completed_at, videos(id, title, duration, academy_id)')
      .eq('student_id', studentId);

    if (error) {
      console.warn('[getContentProgress] Supabase error:', error.message);
      return { total_watched_minutes: 0, total_completed: 0, trails: [] };
    }

    const { data: series } = await supabase
      .from('series')
      .select('id, title, video_ids')
      .eq('academy_id', student.academy_id);

    let totalWatchedMinutes = 0;
    let totalCompleted = 0;
    const videoProgressMap = new Map<string, VideoProgressDTO>();

    for (const wh of watchHistory ?? []) {
      const video = wh.videos as Record<string, unknown> | null;
      const watchedSec = wh.watched_seconds as number;
      totalWatchedMinutes += watchedSec / 60;
      if (wh.completed) totalCompleted++;

      videoProgressMap.set(wh.video_id as string, {
        video_id: wh.video_id as string,
        title: (video?.title ?? '') as string,
        duration: (video?.duration ?? 0) as number,
        watched_seconds: watchedSec,
        progress_pct: (video?.duration as number) > 0
          ? Math.round((watchedSec / ((video?.duration as number) * 60)) * 100)
          : 0,
        completed: wh.completed as boolean,
        completed_at: (wh.completed_at ?? null) as string | null,
      });
    }

    const trails: TrailProgressDTO[] = (series ?? []).map((s: Record<string, unknown>) => {
      const videoIds = (s.video_ids as string[]) ?? [];
      const videos = videoIds.map((vid) => videoProgressMap.get(vid)).filter(Boolean) as VideoProgressDTO[];
      const completedCount = videos.filter((v) => v.completed).length;
      return {
        trail_id: s.id as string,
        trail_name: s.title as string,
        total_videos: videoIds.length,
        completed_videos: completedCount,
        progress_pct: videoIds.length > 0 ? Math.round((completedCount / videoIds.length) * 100) : 0,
        videos,
      };
    });

    return {
      total_watched_minutes: Math.round(totalWatchedMinutes),
      total_completed: totalCompleted,
      trails,
    };
  } catch (error) {
    console.warn('[getContentProgress] Fallback:', error);
    return { total_watched_minutes: 0, total_completed: 0, trails: [] };
  }
}

export async function getFinanceiroPerfil(studentId: string): Promise<FinanceiroPerfilDTO> {
  try {
    if (isMock()) {
      const { mockGetFinanceiroPerfil } = await import('@/lib/mocks/perfil.mock');
      return mockGetFinanceiroPerfil(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, current_period_end, plans(id, name, price, interval)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single();

    let plan: StudentPlanDTO | null = null;
    if (subscription) {
      const planData = subscription.plans as Record<string, unknown> | null;
      plan = {
        plan_id: (planData?.id ?? '') as string,
        plan_name: (planData?.name ?? '') as string,
        price: (planData?.price ?? 0) as number,
        interval: (planData?.interval ?? 'monthly') as PlanInterval,
        status: subscription.status as string,
        current_period_end: subscription.current_period_end as string,
      };
    }

    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, amount, status, due_date')
      .eq('subscription_id', subscription?.id ?? '')
      .order('due_date', { ascending: false })
      .limit(12);

    return {
      plan,
      invoices: (invoices ?? []).map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        amount: inv.amount as number,
        status: inv.status as InvoiceStatus,
        due_date: inv.due_date as string,
        paid_at: null,
        description: `Mensalidade — ${plan?.plan_name ?? 'Plano'}`,
      })),
    };
  } catch (error) {
    console.warn('[getFinanceiroPerfil] Fallback:', error);
    return { plan: null, invoices: [] };
  }
}
