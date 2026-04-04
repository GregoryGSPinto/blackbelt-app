import { isMock } from '@/lib/env';
import type { AttendanceRecord, AttendanceSummary, HeatmapDay, AttendanceAnalytics } from '@/lib/types/attendance';
import { logServiceError } from '@/lib/api/errors';

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
    logServiceError(error, 'attendance');
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
    logServiceError(error, 'attendance');
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

  // 1. Get all enrolled students for this class
  const { data: enrollments, error: enrollError } = await supabase
    .from('class_enrollments')
    .select('student_id, students(id, profiles(display_name))')
    .eq('class_id', classId)
    .eq('status', 'active');

  if (enrollError) {
    logServiceError(enrollError, 'attendance');
    return [];
  }

  // 2. Get attendance records for this class on this date
  const { data: attendanceData, error: attError } = await supabase
    .from('attendance')
    .select('id, student_id, class_id, checked_at, method')
    .eq('class_id', classId)
    .gte('checked_at', dayStart.toISOString())
    .lte('checked_at', dayEnd.toISOString());

  if (attError) {
    logServiceError(attError, 'attendance');
  }

  // Build a map of student_id -> attendance record
  const checkedInMap = new Map<string, Record<string, unknown>>();
  for (const a of (attendanceData ?? []) as Array<Record<string, unknown>>) {
    checkedInMap.set(a.student_id as string, a);
  }

  // 3. Merge: all enrolled students, marking present if they have an attendance record
  const records: AttendanceRecord[] = [];
  const seenStudents = new Set<string>();

  for (const row of (enrollments ?? []) as Array<Record<string, unknown>>) {
    const studentId = row.student_id as string;
    if (seenStudents.has(studentId)) continue;
    seenStudents.add(studentId);

    const student = row.students as Record<string, unknown> | null;
    const profile = student?.profiles as Record<string, unknown> | null;
    const studentName = (profile?.display_name ?? '') as string;

    const att = checkedInMap.get(studentId);
    if (att) {
      records.push({
        id: att.id as string,
        student_id: studentId,
        student_name: studentName,
        class_id: classId,
        date: att.checked_at as string,
        status: 'present',
        checked_in_at: att.checked_at as string,
        method: (att.method ?? 'manual') as 'manual' | 'qrcode',
      });
    } else {
      records.push({
        id: '',
        student_id: studentId,
        student_name: studentName,
        class_id: classId,
        date,
        status: 'absent',
        checked_in_at: null,
        method: 'manual',
      });
    }
  }

  // Sort: present first, then alphabetically
  records.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'present' ? -1 : 1;
    return a.student_name.localeCompare(b.student_name);
  });

  return records;
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
    logServiceError(error, 'attendance');
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

  const [presentRes, studentsRes, classesRes] = await Promise.all([
    supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .gte('checked_at', thirtyDaysAgo),
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId),
    supabase
      .from('classes')
      .select('id, schedule')
      .eq('academy_id', academyId),
  ]);

  const totalPresent = presentRes.count ?? 0;
  const totalStudents = studentsRes.count ?? 0;
  const allClasses = classesRes.data ?? [];

  // Count total class slots in the last 30 days (approx: count weekly slots * ~4.3 weeks)
  let weeklySlots = 0;
  for (const cls of allClasses) {
    const schedule = (cls.schedule ?? []) as Array<{ day_of_week: number }>;
    weeklySlots += schedule.length;
  }
  const totalClassSlots30d = Math.round(weeklySlots * 4.3);

  // Expected attendance = students * class sessions they could attend (approx 3/week * 4.3)
  const expectedAttendance = totalStudents * Math.round(3 * 4.3);
  const attendanceRate = expectedAttendance > 0
    ? Math.min(100, Math.round((totalPresent / expectedAttendance) * 100))
    : 0;

  return {
    total_classes: totalClassSlots30d,
    total_present: totalPresent,
    total_absent: Math.max(0, expectedAttendance - totalPresent),
    total_justified: 0,
    attendance_rate: attendanceRate,
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
    logServiceError(error, 'attendance');
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

  // Get students
  const { data: students } = await supabase
    .from('students')
    .select('id, profiles!students_profile_id_fkey(display_name)')
    .eq('academy_id', academyId);

  const allStudents = students ?? [];
  if (allStudents.length === 0) return [];

  // Batch: fetch all attendance ordered by recency
  const studentIds = allStudents.map((s: Record<string, unknown>) => s.id as string);
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('student_id, checked_at')
    .in('student_id', studentIds)
    .order('checked_at', { ascending: false });

  // Build map: student_id -> last checked_at
  const lastAttMap = new Map<string, string>();
  for (const att of (recentAttendance ?? []) as Array<Record<string, unknown>>) {
    const sid = String(att.student_id);
    if (!lastAttMap.has(sid)) {
      lastAttMap.set(sid, att.checked_at as string);
    }
  }

  const alerts: { student_name: string; days_absent: number; last_attendance: string }[] = [];

  for (const student of allStudents) {
    const lastDate = lastAttMap.get(student.id) ?? null;
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

const DAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export async function getAttendanceAnalytics(
  academyId: string,
  period: '30d' | '60d' | '90d' = '30d',
): Promise<AttendanceAnalytics> {
  if (isMock()) {
    const { mockGetAttendanceAnalytics } = await import('@/lib/mocks/attendance.mock');
    return mockGetAttendanceAnalytics(academyId, period);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const days = period === '30d' ? 30 : period === '60d' ? 60 : 90;
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();

  // Fetch classes, enrollments, and attendance in parallel
  const [classesRes, enrollmentsRes, attendanceRes] = await Promise.all([
    supabase.from('classes').select('id, name').eq('academy_id', academyId),
    supabase.from('class_enrollments').select('student_id, class_id').eq('status', 'active'),
    supabase
      .from('attendance')
      .select('student_id, class_id, checked_at, students(profiles(display_name))')
      .gte('checked_at', cutoff)
      .order('checked_at', { ascending: false }),
  ]);

  const classes = (classesRes.data ?? []) as Array<{ id: string; name: string }>;
  const enrollments = (enrollmentsRes.data ?? []) as Array<{ student_id: string; class_id: string }>;
  const attendance = (attendanceRes.data ?? []) as Array<{
    student_id: string;
    class_id: string;
    checked_at: string;
    students: { profiles: { display_name: string } | null } | null;
  }>;

  // Filter attendance to only this academy's classes
  const classIds = new Set(classes.map((c) => c.id));
  const filteredAtt = attendance.filter((a) => classIds.has(a.class_id));

  // ── By class ──
  const classMap = new Map<string, { name: string; checkins: number; enrolled: number }>();
  for (const c of classes) classMap.set(c.id, { name: c.name, checkins: 0, enrolled: 0 });
  for (const e of enrollments) {
    const entry = classMap.get(e.class_id);
    if (entry) entry.enrolled++;
  }
  for (const a of filteredAtt) {
    const entry = classMap.get(a.class_id);
    if (entry) entry.checkins++;
  }
  const byClass = [...classMap.entries()]
    .map(([id, v]) => ({
      classId: id,
      className: v.name,
      totalCheckins: v.checkins,
      enrolledStudents: v.enrolled,
      attendanceRate: v.enrolled > 0 ? Math.round((v.checkins / (v.enrolled * days * 0.2)) * 100) : 0,
    }))
    .sort((a, b) => b.totalCheckins - a.totalCheckins);

  // ── By day of week ──
  const dayBuckets = Array.from({ length: 7 }, () => 0);
  const weekCount = Math.ceil(days / 7);
  for (const a of filteredAtt) {
    const dow = new Date(a.checked_at).getDay();
    dayBuckets[dow]++;
  }
  const byDayOfWeek = dayBuckets.map((count, i) => ({
    day: DAY_NAMES[i],
    dayIndex: i,
    avgCheckins: Math.round((count / weekCount) * 10) / 10,
  }));

  // ── Peak hours ──
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  for (const a of filteredAtt) {
    const h = new Date(a.checked_at).getHours();
    hourBuckets[h]++;
  }
  const peakHours = hourBuckets
    .map((count, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, checkins: count }))
    .filter((h) => h.checkins > 0);

  // ── Student ranking ──
  const studentMap = new Map<string, { name: string; checkins: number }>();
  for (const a of filteredAtt) {
    const existing = studentMap.get(a.student_id);
    if (existing) {
      existing.checkins++;
    } else {
      const name = a.students?.profiles?.display_name ?? '';
      studentMap.set(a.student_id, { name, checkins: 1 });
    }
  }
  const sortedStudents = [...studentMap.entries()]
    .map(([id, v]) => ({
      studentId: id,
      studentName: v.name,
      checkins: v.checkins,
      attendanceRate: 0,
    }))
    .sort((a, b) => b.checkins - a.checkins);

  const topStudents = sortedStudents.slice(0, 10);
  const bottomStudents = sortedStudents.length > 10
    ? sortedStudents.slice(-10).reverse()
    : [];

  return { byClass, byDayOfWeek, peakHours, topStudents, bottomStudents };
}
