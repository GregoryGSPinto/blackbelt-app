import { isMock } from '@/lib/env';
import type { AttendanceRecord, AttendanceSummary, HeatmapDay } from '@/lib/types/attendance';

export async function checkIn(
  studentId: string,
  classId: string,
  method: 'manual' | 'qrcode',
): Promise<AttendanceRecord> {
  if (isMock()) {
    const { mockCheckIn } = await import('@/lib/mocks/attendance.mock');
    return mockCheckIn(studentId, classId, method);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('attendance')
    .insert({ student_id: studentId, class_id: classId, method, checked_at: new Date().toISOString() })
    .select('id, student_id, class_id, checked_at, method, students(profiles(display_name))')
    .single();

  if (error) {
    console.error('[checkIn] Supabase error:', error.message);
    throw new Error(`[checkIn] ${error.message}`);
  }

  const students = data.students as Record<string, unknown> | null;
  const profiles = students?.profiles as Record<string, unknown> | null;
  return { ...data, student_name: (profiles?.display_name ?? '') as string, date: data.checked_at, status: 'present', checked_in_at: data.checked_at } as AttendanceRecord;
}

export async function markAbsent(studentId: string, classId: string, date: string): Promise<AttendanceRecord> {
  if (isMock()) {
    const { mockMarkAbsent } = await import('@/lib/mocks/attendance.mock');
    return mockMarkAbsent(studentId, classId, date);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Absent = delete attendance record for that day (no record = absent)
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .gte('checked_at', dayStart.toISOString())
    .lte('checked_at', dayEnd.toISOString());

  if (error) {
    console.error('[markAbsent] Supabase error:', error.message);
  }
  return { id: '', student_id: studentId, student_name: '', class_id: classId, date, status: 'absent', checked_in_at: null, method: 'manual' } as AttendanceRecord;
}

export async function listAttendanceRecord(classId: string, date: string): Promise<AttendanceRecord[]> {
  if (isMock()) {
    const { mockListAttendanceRecord } = await import('@/lib/mocks/attendance.mock');
    return mockListAttendanceRecord(classId, date);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('attendance')
    .select('id, student_id, class_id, checked_at, method, students(profiles(display_name))')
    .eq('class_id', classId)
    .gte('checked_at', dayStart.toISOString())
    .lte('checked_at', dayEnd.toISOString());

  if (error) {
    console.error('[listAttendanceRecord] Supabase error:', error.message);
    return [];
  }

  return (data ?? []).map((a: Record<string, unknown>) => {
    const students = a.students as Record<string, unknown> | null;
    const profiles = students?.profiles as Record<string, unknown> | null;
    return { ...a, student_name: (profiles?.display_name ?? '') as string, date: a.checked_at, status: 'present', checked_in_at: a.checked_at } as AttendanceRecord;
  });
}

export async function getStudentAttendanceRecord(
  studentId: string,
  _period?: string,
): Promise<AttendanceRecord[]> {
  if (isMock()) {
    const { mockGetStudentAttendanceRecord } = await import('@/lib/mocks/attendance.mock');
    return mockGetStudentAttendanceRecord(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('attendance')
    .select('id, student_id, class_id, checked_at, method, classes(modalities(name))')
    .eq('student_id', studentId)
    .order('checked_at', { ascending: false });

  if (error) {
    console.error('[getStudentAttendanceRecord] Supabase error:', error.message);
    return [];
  }

  return (data ?? []).map((a: Record<string, unknown>) => ({
    ...a, student_name: '', date: a.checked_at, status: 'present', checked_in_at: a.checked_at,
  })) as AttendanceRecord[];
}

export async function getAttendanceSummary(academyId: string): Promise<AttendanceSummary> {
  if (isMock()) {
    const { mockGetAttendanceSummary } = await import('@/lib/mocks/attendance.mock');
    return mockGetAttendanceSummary(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const { count: totalPresent } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .gte('checked_at', thirtyDaysAgo);

  return {
    total_classes: 0,
    total_present: totalPresent ?? 0,
    total_absent: 0,
    total_justified: 0,
    attendance_rate: 0,
    current_streak: 0,
    best_streak: 0,
  } as AttendanceSummary;
}

export async function getHeatmap(studentId: string): Promise<HeatmapDay[]> {
  if (isMock()) {
    const { mockGetHeatmap } = await import('@/lib/mocks/attendance.mock');
    return mockGetHeatmap(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString();
  const { data, error } = await supabase
    .from('attendance')
    .select('checked_at')
    .eq('student_id', studentId)
    .gte('checked_at', oneYearAgo);

  if (error) {
    console.error('[getHeatmap] Supabase error:', error.message);
    return [];
  }

  const dayMap = new Map<string, number>();
  for (const a of data ?? []) {
    const day = new Date(a.checked_at).toISOString().split('T')[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  return [...dayMap.entries()].map(([date, _count]) => ({ date, status: 'present' as const }));
}

export async function getAbsentAlerts(academyId: string, days: number): Promise<{ student_name: string; days_absent: number; last_attendance: string }[]> {
  if (isMock()) {
    const { mockGetAbsentAlerts } = await import('@/lib/mocks/attendance.mock');
    return mockGetAbsentAlerts(academyId, days);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const cutoff = new Date(Date.now() - days * 86400000).toISOString();

  // Get students with no attendance in the last N days
  const { data: students } = await supabase
    .from('students')
    .select('id, profiles!students_profile_id_fkey(display_name)')
    .eq('academy_id', academyId);

  const alerts: { student_name: string; days_absent: number; last_attendance: string }[] = [];

  for (const student of students ?? []) {
    const { data: lastAtt } = await supabase
      .from('attendance')
      .select('checked_at')
      .eq('student_id', student.id)
      .order('checked_at', { ascending: false })
      .limit(1);

    const lastDate = lastAtt?.[0]?.checked_at ?? null;
    if (!lastDate || lastDate < cutoff) {
      const profile = student.profiles as Record<string, unknown> | null;
      const daysAbsent = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
        : days;
      alerts.push({
        student_name: (profile?.display_name ?? '') as string,
        days_absent: daysAbsent,
        last_attendance: lastDate ?? '',
      });
    }
  }

  return alerts;
}
