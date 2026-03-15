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
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, classId, method }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'checkin.do');
    return res.json();
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
    const params = new URLSearchParams({ studentId });
    if (dateRange) {
      params.set('from', dateRange.from);
      params.set('to', dateRange.to);
    }
    const res = await fetch(`/api/checkin/history?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'checkin.getHistory');
    return res.json();
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
    const res = await fetch(`/api/checkin/stats?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'checkin.getStats');
    return res.json();
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
    const res = await fetch(`/api/checkin/today?classId=${classId}`);
    if (!res.ok) throw new ServiceError(res.status, 'checkin.getTodayByClass');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'checkin.getTodayByClass');
  }
}
