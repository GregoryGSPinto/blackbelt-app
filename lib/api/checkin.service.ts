import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Attendance, AttendanceMethod } from '@/lib/types';

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
  try {
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
    if (error) throw new ServiceError(400, 'checkin.do', error.message);
    return data as Attendance;
  } catch (error) {
    handleServiceError(error, 'checkin.do');
  }
}

export async function getHistory(studentId: string, dateRange?: DateRange): Promise<Attendance[]> {
  try {
    if (isMock()) {
      const { mockGetHistory } = await import('@/lib/mocks/checkin.mock');
      return mockGetHistory(studentId, dateRange);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('checked_at', { ascending: false });

    if (dateRange?.from) query = query.gte('checked_at', dateRange.from);
    if (dateRange?.to) query = query.lte('checked_at', dateRange.to);

    const { data, error } = await query;
    if (error) throw new ServiceError(500, 'checkin.getHistory', error.message);
    return (data ?? []) as Attendance[];
  } catch (error) {
    handleServiceError(error, 'checkin.getHistory');
  }
}

export async function getStats(studentId: string): Promise<AttendanceStats> {
  try {
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
  } catch (error) {
    handleServiceError(error, 'checkin.getStats');
  }
}

export async function getTodayByClass(classId: string): Promise<Attendance[]> {
  try {
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
      .select('*')
      .eq('class_id', classId)
      .gte('checked_at', todayStart.toISOString());
    if (error) throw new ServiceError(500, 'checkin.getTodayByClass', error.message);
    return (data ?? []) as Attendance[];
  } catch (error) {
    handleServiceError(error, 'checkin.getTodayByClass');
  }
}
