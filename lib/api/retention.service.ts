import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────────

export interface RetentionSummary {
  currentRetention: number;
  retentionGoal: number;
  churnRate: number;
  avgTimeBeforeCancel: number; // months
  totalActive: number;
  totalChurned: number;
  classWithMostChurn: string;
}

export interface RetentionMonthData {
  month: string;
  retention: number;
  churned: number;
  newStudents: number;
}

export type ChurnReason = 'financial' | 'schedule' | 'moved' | 'injury' | 'motivation' | 'unknown';

export interface ChurnReasonData {
  reason: ChurnReason;
  label: string;
  count: number;
  percentage: number;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  avatar: string | null;
  belt: string;
  className: string;
  modality: string;
  daysWithoutTraining: number;
  trend: 'declining' | 'stable' | 'improving';
  lastCheckin: string | null;
  contacted: boolean;
}

export interface RetentionFilters {
  period?: '3m' | '6m' | '12m';
  className?: string;
  modality?: string;
}

export interface RetentionData {
  summary: RetentionSummary;
  monthlyData: RetentionMonthData[];
  churnReasons: ChurnReasonData[];
  atRiskStudents: AtRiskStudent[];
}

// ── Service functions ──────────────────────────────────────────────────

export async function getRetentionData(
  academyId: string,
  filters?: RetentionFilters,
): Promise<RetentionData> {
  try {
    if (isMock()) {
      const { mockGetRetentionData } = await import('@/lib/mocks/retention.mock');
      return mockGetRetentionData(academyId, filters);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const emptyResult: RetentionData = {
        summary: { currentRetention: 0, retentionGoal: 85, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' },
        monthlyData: [],
        churnReasons: [],
        atRiskStudents: [],
      };

      // Determine period range
      const monthsBack = filters?.period === '3m' ? 3 : filters?.period === '6m' ? 6 : 12;
      const periodStart = new Date();
      periodStart.setMonth(periodStart.getMonth() - monthsBack);
      const periodStartISO = periodStart.toISOString();

      // Get all students for this academy
      const { data: students, error: stuErr } = await supabase
        .from('students')
        .select('id, belt, started_at, profile:profiles!students_profile_id_fkey(display_name, avatar)')
        .eq('academy_id', academyId);
      if (stuErr || !students) {
        console.warn('[getRetentionData] students query error:', stuErr?.message);
        return emptyResult;
      }

      const studentIds = students.map((s: { id: string }) => s.id);
      if (studentIds.length === 0) return emptyResult;

      // Get attendance for these students within the period
      const { data: attendance, error: attErr } = await supabase
        .from('attendance')
        .select('student_id, checked_at, class:classes!attendance_class_id_fkey(name)')
        .in('student_id', studentIds)
        .gte('checked_at', periodStartISO)
        .order('checked_at', { ascending: false });
      if (attErr) {
        console.warn('[getRetentionData] attendance query error:', attErr.message);
        return emptyResult;
      }

      // Get class enrollments for modality/className filtering
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('student_id, class:classes!class_enrollments_class_id_fkey(name, modality:modalities!classes_modality_id_fkey(name))')
        .in('student_id', studentIds)
        .eq('status', 'active');

      // Compute at-risk students (no attendance in last 14 days)
      const now = Date.now();
      const atRiskStudents: AtRiskStudent[] = [];
      const attByStudent: Record<string, Array<{ checked_at: string; class: { name: string } | null }>> = {};
      for (const a of (attendance ?? []) as Array<{ student_id: string; checked_at: string; class: { name: string } | null }>) {
        if (!attByStudent[a.student_id]) attByStudent[a.student_id] = [];
        attByStudent[a.student_id].push(a);
      }

      // Build enrollment map
      const enrollMap: Record<string, { className: string; modality: string }> = {};
      for (const e of (enrollments ?? []) as Array<{ student_id: string; class: { name: string; modality: { name: string } | null } | null }>) {
        enrollMap[e.student_id] = {
          className: e.class?.name ?? '',
          modality: e.class?.modality?.name ?? '',
        };
      }

      let activeCount = 0;

      for (const s of students as Array<{ id: string; belt: string; profile: { display_name: string; avatar: string | null } | null }>) {
        const sAtt = attByStudent[s.id] ?? [];
        const lastCheckin = sAtt.length > 0 ? sAtt[0].checked_at : null;
        const daysSince = lastCheckin ? Math.floor((now - new Date(lastCheckin).getTime()) / (24 * 60 * 60 * 1000)) : 999;
        const enroll = enrollMap[s.id] ?? { className: '', modality: '' };

        // Apply filters
        if (filters?.className && enroll.className !== filters.className) continue;
        if (filters?.modality && enroll.modality !== filters.modality) continue;

        // Active = attended in last 30 days
        if (daysSince <= 30) activeCount++;

        if (daysSince >= 14) {
          atRiskStudents.push({
            id: s.id,
            name: s.profile?.display_name ?? 'N/A',
            avatar: s.profile?.avatar ?? null,
            belt: s.belt,
            className: enroll.className,
            modality: enroll.modality,
            daysWithoutTraining: daysSince,
            trend: daysSince > 30 ? 'declining' : 'stable',
            lastCheckin,
            contacted: false,
          });
        }
      }

      const totalStudents = students.length;
      const churned = totalStudents - activeCount;
      const currentRetention = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;
      const churnRate = totalStudents > 0 ? Math.round((churned / totalStudents) * 100) : 0;

      // Monthly data
      const monthlyData: RetentionMonthData[] = [];
      for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
        const activeInMonth = new Set<string>();
        for (const a of (attendance ?? []) as Array<{ student_id: string; checked_at: string }>) {
          const t = new Date(a.checked_at).getTime();
          if (t >= monthStart && t <= monthEnd) activeInMonth.add(a.student_id);
        }
        const newInMonth = students.filter((s: { started_at: string }) => {
          const t = new Date(s.started_at).getTime();
          return t >= monthStart && t <= monthEnd;
        }).length;
        const retMonth = totalStudents > 0 ? Math.round((activeInMonth.size / totalStudents) * 100) : 0;
        monthlyData.push({
          month: monthKey,
          retention: retMonth,
          churned: totalStudents - activeInMonth.size,
          newStudents: newInMonth,
        });
      }

      return {
        summary: {
          currentRetention,
          retentionGoal: 85,
          churnRate,
          avgTimeBeforeCancel: 0,
          totalActive: activeCount,
          totalChurned: churned,
          classWithMostChurn: atRiskStudents.length > 0 ? atRiskStudents[0].className : '',
        },
        monthlyData,
        churnReasons: [],
        atRiskStudents: atRiskStudents.sort((a, b) => b.daysWithoutTraining - a.daysWithoutTraining),
      };
    } catch (err) {
      console.warn('[retention.getRetentionData] error, using fallback:', err);
      return { summary: { currentRetention: 0, retentionGoal: 0, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' }, monthlyData: [], churnReasons: [], atRiskStudents: [] } as RetentionData;
    }
  } catch (error) {
    console.warn('[getRetentionData] Fallback:', error);
    return { summary: { currentRetention: 0, retentionGoal: 0, churnRate: 0, avgTimeBeforeCancel: 0, totalActive: 0, totalChurned: 0, classWithMostChurn: '' }, monthlyData: [], churnReasons: [], atRiskStudents: [] } as RetentionData;
  }
}

export async function markStudentContacted(
  studentId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkContacted } = await import('@/lib/mocks/retention.mock');
      return mockMarkContacted(studentId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Look up the student's user_id via profile
      const { data: student } = await supabase
        .from('students')
        .select('profile:profiles!students_profile_id_fkey(user_id)')
        .eq('id', studentId)
        .single();

      const userId = (student?.profile as { user_id: string } | null)?.user_id;
      if (!userId) {
        console.warn('[markStudentContacted] could not resolve user_id for student', studentId);
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'retention_contact',
          title: 'Contato de retenção realizado',
          body: 'Aluno contatado pela equipe de retenção.',
          read: false,
        });
      if (error) {
        console.warn('[markStudentContacted] insert error:', error.message);
      }
    } catch (err) {
      console.warn('[retention.markStudentContacted] error, using fallback:', err);
    }
  } catch (error) {
    console.warn('[markStudentContacted] Fallback:', error);
  }
}
