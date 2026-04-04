import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import type { Attendance, AttendanceMethod } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

export interface AttendanceStats {
  total: number;
  this_month: number;
  this_week: number;
  streak: number;
  weekly_average: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export async function doCheckin(studentId: string, classId: string, method: AttendanceMethod): Promise<Attendance> {
  if (isMock()) {
    const { mockDoCheckin } = await import('@/lib/mocks/checkin.mock');
    return mockDoCheckin(studentId, classId, method);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('attendance')
    .insert({
      student_id: studentId,
      class_id: classId,
      method,
      checked_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) {
    logServiceError(error, 'checkin');
    throw new Error(`[doCheckin] Failed: ${error.message}`);
  }
  trackFeatureUsage('checkin', 'create', { method });
  return data as Attendance;
}

export async function getHistory(studentId: string, dateRange?: DateRange): Promise<Attendance[]> {
  if (isMock()) {
    const { mockGetHistory } = await import('@/lib/mocks/checkin.mock');
    return mockGetHistory(studentId, dateRange);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  let query = supabase
    .from('attendance')
    .select('id, student_id, class_id, checked_at, method, created_at, updated_at')
    .eq('student_id', studentId)
    .order('checked_at', { ascending: false });

  if (dateRange?.from) query = query.gte('checked_at', dateRange.from);
  if (dateRange?.to) query = query.lte('checked_at', dateRange.to);

  const { data, error } = await query;
  if (error) {
    logServiceError(error, 'checkin');
    return [];
  }
  return (data ?? []) as Attendance[];
}

export async function getStats(studentId: string): Promise<AttendanceStats> {
  if (isMock()) {
    const { mockGetStats } = await import('@/lib/mocks/checkin.mock');
    return mockGetStats(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfWeek = new Date(now.getTime() - now.getDay() * 86400000).toISOString();

  const [totalRes, monthRes, weekRes] = await Promise.all([
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', studentId).gte('checked_at', startOfMonth),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', studentId).gte('checked_at', startOfWeek),
  ]);

  const total = totalRes.count ?? 0;
  const thisMonth = monthRes.count ?? 0;
  const thisWeek = weekRes.count ?? 0;

  // Calculate streak (consecutive days with attendance)
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('checked_at')
    .eq('student_id', studentId)
    .order('checked_at', { ascending: false })
    .limit(90);

  let streak = 0;
  if (recentAttendance && recentAttendance.length > 0) {
    const dates: string[] = [...new Set<string>(
      recentAttendance.map((a: { checked_at: string }) =>
        new Date(a.checked_at).toISOString().split('T')[0]
      )
    )].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (const date of dates) {
      if (date === checkDate) {
        streak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().split('T')[0];
      } else if (date < checkDate) {
        break;
      }
    }
  }

  // Weekly average (last 4 weeks)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000).toISOString();
  const { count: fourWeekCount } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .gte('checked_at', fourWeeksAgo);

  return {
    total,
    this_month: thisMonth,
    this_week: thisWeek,
    streak,
    weekly_average: Math.round((fourWeekCount ?? 0) / 4),
  };
}

export async function getTodayByClass(classId: string): Promise<Attendance[]> {
  if (isMock()) {
    const { mockGetTodayByClass } = await import('@/lib/mocks/checkin.mock');
    return mockGetTodayByClass(classId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('attendance')
    .select('id, student_id, class_id, checked_at, method, created_at, updated_at')
    .eq('class_id', classId)
    .gte('checked_at', todayStart.toISOString());
  if (error) {
    logServiceError(error, 'checkin');
    return [];
  }
  return (data ?? []) as Attendance[];
}
