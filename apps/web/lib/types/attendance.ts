// ============================================================
// BlackBelt v2 — Attendance / Check-in Types
// ============================================================

export type AttendanceStatus = 'present' | 'absent' | 'justified';
export type CheckInMethod = 'manual' | 'qrcode';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  checked_in_at: string | null;
  method: CheckInMethod;
}

export interface AttendanceSummary {
  total_classes: number;
  total_present: number;
  total_absent: number;
  total_justified: number;
  attendance_rate: number;
  current_streak: number;
  best_streak: number;
}

export interface HeatmapDay {
  date: string;
  status: 'present' | 'absent' | 'no_class';
}

// ── Analytics (enhanced report) ──────────────────────────────

export interface ClassAttendanceStats {
  classId: string;
  className: string;
  totalCheckins: number;
  enrolledStudents: number;
  attendanceRate: number;
}

export interface DayOfWeekStats {
  day: string;
  dayIndex: number;
  avgCheckins: number;
}

export interface PeakHourStats {
  hour: string;
  checkins: number;
}

export interface StudentRanking {
  studentId: string;
  studentName: string;
  checkins: number;
  attendanceRate: number;
}

export interface AttendanceAnalytics {
  byClass: ClassAttendanceStats[];
  byDayOfWeek: DayOfWeekStats[];
  peakHours: PeakHourStats[];
  topStudents: StudentRanking[];
  bottomStudents: StudentRanking[];
}
