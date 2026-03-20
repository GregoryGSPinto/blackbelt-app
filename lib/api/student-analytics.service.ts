import { isMock } from '@/lib/env';

export interface RadarMetrics {
  technique: number;
  discipline: number;
  attendance: number;
  evolution: number;
}

export interface MonthlyAttendance {
  month: string;
  count: number;
}

export interface StudentPerformanceDTO {
  radar: RadarMetrics;
  class_avg_radar: RadarMetrics;
  monthly_attendance: MonthlyAttendance[];
  max_streak: number;
  total_training_hours: number;
  recommendations: string[];
  video_suggestions: Array<{ id: string; title: string; reason: string }>;
}

export async function getStudentPerformance(studentId: string): Promise<StudentPerformanceDTO> {
  try {
    if (isMock()) {
      const { mockGetStudentPerformance } = await import('@/lib/mocks/student-analytics.mock');
      return mockGetStudentPerformance(studentId);
    }
    try {
      const res = await fetch(`/api/students/${studentId}/performance`);
      if (!res.ok) {
        console.warn('[getStudentPerformance] error:', `HTTP ${res.status}`);
        return { radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, class_avg_radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, monthly_attendance: [], max_streak: 0, total_training_hours: 0, recommendations: [], video_suggestions: [] };
      }
      return res.json();
    } catch {
      console.warn('[student-analytics.getStudentPerformance] API not available, using fallback');
      return { radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, class_avg_radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, monthly_attendance: [], max_streak: 0, total_training_hours: 0, recommendations: [], video_suggestions: [] };
    }
  } catch (error) {
    console.warn('[getStudentPerformance] Fallback:', error);
    return { radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, class_avg_radar: { technique: 0, discipline: 0, attendance: 0, evolution: 0 }, monthly_attendance: [], max_streak: 0, total_training_hours: 0, recommendations: [], video_suggestions: [] };
  }
}
