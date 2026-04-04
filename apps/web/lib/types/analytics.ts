// ── Analytics types ───────────────────────────────────────────

export interface MonthlyMetric {
  month: string; // YYYY-MM
  label: string; // "Jan/26"
  value: number;
}

export interface AnalyticsOverview {
  studentsTimeline: MonthlyMetric[];
  revenueTimeline: MonthlyMetric[];
  retentionTimeline: MonthlyMetric[];
  attendanceByClass: { className: string; avgAttendance: number; capacity: number }[];
  popularHours: { hour: string; count: number }[];
  topModalities: { name: string; students: number }[];
  comparison: {
    currentMonth: { students: number; revenue: number; retention: number; attendance: number };
    previousMonth: { students: number; revenue: number; retention: number; attendance: number };
    sameMonthLastYear: { students: number; revenue: number; retention: number; attendance: number } | null;
  };
}

export interface ProfessorAnalytics {
  id: string;
  name: string;
  retentionRate: number;
  avgAttendance: number;
  avgRating: number;
  contentPublished: number;
  totalClasses: number;
  totalStudents: number;
}

export interface StudentAnalytics {
  studentId: string;
  attendanceHistory: MonthlyMetric[];
  quizScores: { quizName: string; score: number; date: string }[];
  videoHoursPerWeek: MonthlyMetric[];
  comparisonWithAvg: {
    attendance: { student: number; classAvg: number };
    quizAvg: { student: number; classAvg: number };
    videoHours: { student: number; classAvg: number };
  };
}

export interface ChurnPrediction {
  studentId: string;
  studentName: string;
  score: number; // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    frequencyScore: number;
    trendScore: number;
    delinquencyScore: number;
    engagementScore: number;
  };
  lastAttendance: string;
  daysSinceLastVisit: number;
  paymentStatus: 'ok' | 'late' | 'overdue';
}
