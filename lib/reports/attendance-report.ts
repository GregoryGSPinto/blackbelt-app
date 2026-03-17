// ============================================================
// BlackBelt v2 — Attendance Report Generator
// Generates structured attendance report data
// ============================================================

import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { AttendanceReportData } from '@/lib/types/report';

export async function generateAttendanceReport(
  academyId: string,
  period: string,
): Promise<AttendanceReportData> {
  try {
    if (isMock()) {
      return getMockAttendanceReport(academyId, period);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'reports.attendance');
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
