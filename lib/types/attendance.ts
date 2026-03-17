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
