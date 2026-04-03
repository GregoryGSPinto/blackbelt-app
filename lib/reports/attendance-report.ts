// ============================================================
// BlackBelt v2 — Attendance Report Generator
// Generates structured attendance report data
// ============================================================

import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import type { AttendanceReportData } from '@/lib/types/report';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export async function generateAttendanceReport(
  academyId: string,
  period: string,
): Promise<AttendanceReportData> {
  try {
    if (isMock()) {
      return getMockAttendanceReport(academyId, period);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const days = period.includes('60') ? 60 : period.includes('90') ? 90 : 30;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();

    // Fetch academy name, classes, and attendance in parallel
    const [academyRes, classesRes, attendanceRes, studentsRes] = await Promise.all([
      supabase.from('academies').select('name').eq('id', academyId).maybeSingle(),
      supabase.from('classes').select('id, name, modality:modalities!classes_modality_id_fkey(name), schedule').eq('academy_id', academyId),
      supabase.from('attendance').select('student_id, class_id, checked_at').gte('checked_at', cutoff),
      supabase.from('students').select('id, profiles!students_profile_id_fkey(display_name)').eq('academy_id', academyId),
    ]);

    const academyName = (academyRes.data as { name: string } | null)?.name ?? 'BlackBelt';
    const classes = (classesRes.data ?? []) as Array<{ id: string; name: string; modality: { name: string } | null; schedule: Array<{ day_of_week: number }> | null }>;
    const classIds = new Set(classes.map((c) => c.id));
    const attendance = ((attendanceRes.data ?? []) as Array<{ student_id: string; class_id: string; checked_at: string }>)
      .filter((a) => classIds.has(a.class_id));
    const totalStudents = (studentsRes.data ?? []).length;

    const totalCheckins = attendance.length;

    // Count class slots in period
    let weeklySlots = 0;
    for (const cls of classes) {
      weeklySlots += (cls.schedule ?? []).length;
    }
    const totalClasses = Math.round(weeklySlots * (days / 7));
    const avgPerClass = totalClasses > 0 ? Math.round((totalCheckins / totalClasses) * 10) / 10 : 0;
    const expectedAttendance = totalStudents * Math.round(3 * (days / 7));
    const attendanceRate = expectedAttendance > 0 ? Math.min(100, Math.round((totalCheckins / expectedAttendance) * 100)) : 0;

    // By day of week
    const dayBuckets = Array.from({ length: 7 }, () => 0);
    const weekCount = Math.ceil(days / 7);
    for (const a of attendance) {
      dayBuckets[new Date(a.checked_at).getDay()]++;
    }
    const byDayOfWeek = dayBuckets.map((count, i) => ({
      day: DAY_NAMES[i],
      avg_attendance: Math.round((count / weekCount) * 10) / 10,
    }));
    const activeDays = byDayOfWeek.filter((d) => d.avg_attendance > 0);
    const bestDay = activeDays.length > 0 ? activeDays.reduce((a, b) => a.avg_attendance > b.avg_attendance ? a : b).day : '';
    const worstDay = activeDays.length > 0 ? activeDays.reduce((a, b) => a.avg_attendance < b.avg_attendance ? a : b).day : '';

    // By modality
    const modalityMap = new Map<string, { classes: number; checkins: number }>();
    for (const cls of classes) {
      const mod = cls.modality?.name ?? 'Outro';
      const entry = modalityMap.get(mod) ?? { classes: 0, checkins: 0 };
      entry.classes += (cls.schedule ?? []).length * Math.ceil(days / 7);
      modalityMap.set(mod, entry);
    }
    const classModalityMap = new Map<string, string>();
    for (const cls of classes) {
      classModalityMap.set(cls.id, cls.modality?.name ?? 'Outro');
    }
    for (const a of attendance) {
      const mod = classModalityMap.get(a.class_id) ?? 'Outro';
      const entry = modalityMap.get(mod);
      if (entry) entry.checkins++;
    }
    const byModality = [...modalityMap.entries()].map(([modality, v]) => ({
      modality,
      classes: v.classes,
      avg_attendance: v.classes > 0 ? Math.round((v.checkins / v.classes) * 10) / 10 : 0,
      rate: v.classes > 0 ? Math.min(100, Math.round((v.checkins / (v.classes * totalStudents * 0.3)) * 100)) : 0,
    }));

    // Absent alerts (students not seen in 7+ days)
    const lastSeen = new Map<string, string>();
    for (const a of attendance) {
      const prev = lastSeen.get(a.student_id);
      if (!prev || a.checked_at > prev) lastSeen.set(a.student_id, a.checked_at);
    }
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const absentAlerts: AttendanceReportData['absent_alerts'] = [];
    for (const s of studentsRes.data ?? []) {
      const student = s as { id: string; profiles: { display_name: string } | null };
      const last = lastSeen.get(student.id);
      if (!last || new Date(last).getTime() < sevenDaysAgo) {
        absentAlerts.push({
          student_name: student.profiles?.display_name ?? '',
          days_absent: last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : days,
          last_attendance: last ?? '',
        });
      }
    }
    absentAlerts.sort((a, b) => b.days_absent - a.days_absent);

    return {
      meta: {
        academy_name: academyName,
        generated_at: new Date().toISOString(),
        period,
        generated_by: 'Sistema BlackBelt',
      },
      summary: { total_classes: totalClasses, total_checkins: totalCheckins, avg_per_class: avgPerClass, attendance_rate: attendanceRate, best_day: bestDay, worst_day: worstDay },
      by_modality: byModality,
      by_day_of_week: byDayOfWeek,
      absent_alerts: absentAlerts.slice(0, 10),
    };
  } catch (error) {
    logServiceError(error, 'reports.attendance');
    return { meta: { academy_name: '', generated_at: '', period, generated_by: '' }, summary: { total_classes: 0, total_checkins: 0, avg_per_class: 0, attendance_rate: 0, best_day: '', worst_day: '' }, by_modality: [], by_day_of_week: [], absent_alerts: [] } as AttendanceReportData;
  }
}

function getMockAttendanceReport(_academyId: string, period: string): AttendanceReportData {
  return {
    meta: {
      academy_name: 'Academia BlackBelt BJJ',
      generated_at: new Date().toISOString(),
      period,
      generated_by: 'Sistema BlackBelt',
    },
    summary: {
      total_classes: 144,
      total_checkins: 2340,
      avg_per_class: 16.3,
      attendance_rate: 78.5,
      best_day: 'Terca-feira',
      worst_day: 'Sabado',
    },
    by_modality: [
      { modality: 'Jiu-Jitsu', classes: 72, avg_attendance: 18.2, rate: 84 },
      { modality: 'Muay Thai', classes: 36, avg_attendance: 15.8, rate: 76 },
      { modality: 'Boxe', classes: 20, avg_attendance: 12.5, rate: 71 },
      { modality: 'Wrestling', classes: 16, avg_attendance: 10.3, rate: 68 },
    ],
    by_day_of_week: [
      { day: 'Segunda', avg_attendance: 22.4 },
      { day: 'Terca', avg_attendance: 24.1 },
      { day: 'Quarta', avg_attendance: 21.8 },
      { day: 'Quinta', avg_attendance: 23.5 },
      { day: 'Sexta', avg_attendance: 19.2 },
      { day: 'Sabado', avg_attendance: 14.7 },
    ],
    absent_alerts: [
      { student_name: 'Bruno Alves', days_absent: 14, last_attendance: '2026-03-03' },
      { student_name: 'Julia Rocha', days_absent: 10, last_attendance: '2026-03-07' },
      { student_name: 'Carlos Mendes', days_absent: 8, last_attendance: '2026-03-09' },
      { student_name: 'Patricia Oliveira', days_absent: 7, last_attendance: '2026-03-10' },
      { student_name: 'Thiago Nascimento', days_absent: 5, last_attendance: '2026-03-12' },
    ],
  };
}
