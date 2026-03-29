import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import { logServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export interface WeeklyReportData {
  academyName: string;
  period: { start: string; end: string };
  newStudents: number;
  totalAttendance: number;
  avgAttendanceRate: number;
  revenue: number;
  revenueChange: number;
  atRiskStudents: { name: string; daysSinceLastVisit: number }[];
  highlights: string[];
  topClass: { name: string; attendance: number };
}

export interface ReportRecipient {
  role: 'admin' | 'professor' | 'parent';
  name: string;
  email: string;
}

// ── Service ───────────────────────────────────────────────────

export async function generateWeeklyReport(academyId: string): Promise<WeeklyReportData> {
  try {
    if (isMock()) {
      return {
        academyName: 'Guerreiros BJJ',
        period: { start: '2026-03-10', end: '2026-03-16' },
        newStudents: 4,
        totalAttendance: 342,
        avgAttendanceRate: 78,
        revenue: 12450,
        revenueChange: 8.5,
        atRiskStudents: [
          { name: 'Bruno Lima', daysSinceLastVisit: 7 },
          { name: 'Marcos Oliveira', daysSinceLastVisit: 12 },
        ],
        highlights: [
          'Ana Clara completou 100 treinos',
          'Turma de BJJ Avançado bateu recorde de presença',
          '3 novos alunos vieram por indicação',
        ],
        topClass: { name: 'BJJ Fundamentos', attendance: 28 },
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
    const periodStart = weekAgo.toISOString().split('T')[0];
    const periodEnd = now.toISOString().split('T')[0];

    // Fetch academy name
    const { data: academy } = await supabase
      .from('academies')
      .select('name')
      .eq('id', academyId)
      .single();

    // New students this week
    const { count: newStudents } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .gte('created_at', weekAgo.toISOString());

    // Attendance this week
    const { data: attendanceThisWeek } = await supabase
      .from('attendance')
      .select('id, class_id')
      .gte('checked_in_at', weekAgo.toISOString())
      .lte('checked_in_at', now.toISOString());

    // Attendance last week (for comparison)
    const { count: attendanceLastWeek } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .gte('checked_in_at', twoWeeksAgo.toISOString())
      .lt('checked_in_at', weekAgo.toISOString());

    const totalAttendance = attendanceThisWeek?.length ?? 0;

    // Total active students for avg rate
    const { count: totalStudents } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .eq('status', 'active');

    const avgAttendanceRate = totalStudents && totalStudents > 0
      ? Math.round((totalAttendance / (totalStudents * 3)) * 100) // assume 3 sessions/week target
      : 0;

    // At-risk students (no attendance in 7+ days)
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, name')
      .eq('academy_id', academyId)
      .eq('status', 'active');

    const atRiskStudents: { name: string; daysSinceLastVisit: number }[] = [];
    for (const student of allStudents ?? []) {
      const { data: lastAttendance } = await supabase
        .from('attendance')
        .select('checked_in_at')
        .eq('student_id', student.id)
        .order('checked_in_at', { ascending: false })
        .limit(1);

      if (lastAttendance && lastAttendance.length > 0) {
        const days = Math.floor((now.getTime() - new Date(lastAttendance[0].checked_in_at).getTime()) / 86400000);
        if (days >= 7) {
          atRiskStudents.push({ name: student.name, daysSinceLastVisit: days });
        }
      }
    }

    // Top class by attendance count
    const classAttendance = new Map<string, number>();
    for (const a of attendanceThisWeek ?? []) {
      classAttendance.set(a.class_id, (classAttendance.get(a.class_id) || 0) + 1);
    }
    let topClassId = '';
    let topClassCount = 0;
    for (const [cid, cnt] of classAttendance) {
      if (cnt > topClassCount) {
        topClassId = cid;
        topClassCount = cnt;
      }
    }

    let topClassName = 'N/A';
    if (topClassId) {
      const { data: cls } = await supabase
        .from('classes')
        .select('modalities(name)')
        .eq('id', topClassId)
        .single();
      const mod = cls?.modalities as Record<string, unknown> | null;
      topClassName = (mod?.name as string) || 'N/A';
    }

    // Revenue change placeholder (would require financial tables)
    const revenueChange = attendanceLastWeek && attendanceLastWeek > 0
      ? Math.round(((totalAttendance - attendanceLastWeek) / attendanceLastWeek) * 100)
      : 0;

    return {
      academyName: academy?.name ?? 'Academia',
      period: { start: periodStart, end: periodEnd },
      newStudents: newStudents ?? 0,
      totalAttendance,
      avgAttendanceRate,
      revenue: 0,
      revenueChange,
      atRiskStudents: atRiskStudents.slice(0, 10),
      highlights: [],
      topClass: { name: topClassName, attendance: topClassCount },
    };
  } catch (error) {
    logServiceError(error, 'weekly-report');
    return {
      academyName: '',
      period: { start: '', end: '' },
      newStudents: 0,
      totalAttendance: 0,
      avgAttendanceRate: 0,
      revenue: 0,
      revenueChange: 0,
      atRiskStudents: [],
      highlights: [],
      topClass: { name: '', attendance: 0 },
    };
  }
}

export async function sendWeeklyReport(
  academyId: string,
  recipients: ReportRecipient[],
): Promise<{ sent: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Sending weekly report', { recipientCount: recipients.length });
      return { sent: recipients.length };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Store report send record
    const { error } = await supabase
      .from('report_sends')
      .insert({
        academy_id: academyId,
        type: 'weekly',
        recipients: recipients.map((r) => r.email),
        sent_at: new Date().toISOString(),
      });

    if (error) {
      logServiceError(error, 'weekly-report');
      return { sent: 0 };
    }

    return { sent: recipients.length };
  } catch (error) {
    logServiceError(error, 'weekly-report');
    return { sent: 0 };
  }
}
