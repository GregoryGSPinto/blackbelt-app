import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { AttendanceRecord, AttendanceSummary, HeatmapDay } from '@/lib/types/attendance';

export async function checkIn(
  studentId: string,
  classId: string,
  method: 'manual' | 'qrcode',
): Promise<AttendanceRecord> {
  try {
    if (isMock()) {
      const { mockCheckIn } = await import('@/lib/mocks/attendance.mock');
      return mockCheckIn(studentId, classId, method);
    }
    console.warn('[attendance.checkIn] fallback — not yet connected to Supabase');
    return { id: '', student_id: studentId, student_name: '', class_id: classId, date: new Date().toISOString(), status: 'present', checked_in_at: new Date().toISOString(), method } as AttendanceRecord;
  } catch (error) {
    handleServiceError(error, 'attendance.checkIn');
  }
}

export async function markAbsent(studentId: string, classId: string, date: string): Promise<AttendanceRecord> {
  try {
    if (isMock()) {
      const { mockMarkAbsent } = await import('@/lib/mocks/attendance.mock');
      return mockMarkAbsent(studentId, classId, date);
    }
    console.warn('[attendance.markAbsent] fallback — not yet connected to Supabase');
    return { id: '', student_id: studentId, student_name: '', class_id: classId, date, status: 'absent', checked_in_at: null, method: 'manual' } as AttendanceRecord;
  } catch (error) {
    handleServiceError(error, 'attendance.markAbsent');
  }
}

export async function listAttendanceRecord(classId: string, date: string): Promise<AttendanceRecord[]> {
  try {
    if (isMock()) {
      const { mockListAttendanceRecord } = await import('@/lib/mocks/attendance.mock');
      return mockListAttendanceRecord(classId, date);
    }
    console.warn('[attendance.listAttendanceRecord] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'attendance.listAttendanceRecord');
  }
}

export async function getStudentAttendanceRecord(
  studentId: string,
  _period?: string,
): Promise<AttendanceRecord[]> {
  try {
    if (isMock()) {
      const { mockGetStudentAttendanceRecord } = await import('@/lib/mocks/attendance.mock');
      return mockGetStudentAttendanceRecord(studentId);
    }
    console.warn('[attendance.getStudentAttendanceRecord] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'attendance.getStudentAttendanceRecord');
  }
}

export async function getAttendanceSummary(academyId: string): Promise<AttendanceSummary> {
  try {
    if (isMock()) {
      const { mockGetAttendanceSummary } = await import('@/lib/mocks/attendance.mock');
      return mockGetAttendanceSummary(academyId);
    }
    console.warn('[attendance.getSummary] fallback — not yet connected to Supabase');
    return { total_classes: 0, total_present: 0, total_absent: 0, total_justified: 0, attendance_rate: 0, current_streak: 0, best_streak: 0 } as AttendanceSummary;
  } catch (error) {
    handleServiceError(error, 'attendance.getSummary');
  }
}

export async function getHeatmap(studentId: string): Promise<HeatmapDay[]> {
  try {
    if (isMock()) {
      const { mockGetHeatmap } = await import('@/lib/mocks/attendance.mock');
      return mockGetHeatmap(studentId);
    }
    console.warn('[attendance.getHeatmap] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'attendance.getHeatmap');
  }
}

export async function getAbsentAlerts(academyId: string, days: number): Promise<{ student_name: string; days_absent: number; last_attendance: string }[]> {
  try {
    if (isMock()) {
      const { mockGetAbsentAlerts } = await import('@/lib/mocks/attendance.mock');
      return mockGetAbsentAlerts(academyId, days);
    }
    console.warn('[attendance.getAbsentAlerts] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'attendance.getAbsentAlerts');
  }
}
