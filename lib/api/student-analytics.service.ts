import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/students/${studentId}/performance`);
    if (!res.ok) throw new ServiceError(res.status, 'studentAnalytics.performance');
    return res.json();
  } catch (error) { handleServiceError(error, 'studentAnalytics.performance'); }
}
