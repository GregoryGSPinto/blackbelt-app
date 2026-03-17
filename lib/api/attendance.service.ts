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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'attendance.getAbsentAlerts');
  }
}
