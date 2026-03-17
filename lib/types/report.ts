// ============================================================
// BlackBelt v2 — Report Types
// Structured data for monthly, attendance, and financial reports
// ============================================================

export interface ReportMeta {
  academy_name: string;
  generated_at: string;
  period: string;
  generated_by: string;
}

export interface MonthlyReportData {
  meta: ReportMeta;
  summary: {
    total_students: number;
    new_students: number;
    churned_students: number;
    active_classes: number;
    total_attendance: number;
    attendance_rate: number;
    revenue: number;
    revenue_prev: number;
    overdue_amount: number;
    overdue_count: number;
  };
  top_classes: Array<{
    class_name: string;
    modality: string;
    attendance_rate: number;
    students: number;
  }>;
  belt_distribution: Array<{
    belt: string;
    count: number;
  }>;
  retention: {
    rate: number;
    at_risk_count: number;
  };
}

export interface AttendanceReportData {
  meta: ReportMeta;
  summary: {
    total_classes: number;
    total_checkins: number;
    avg_per_class: number;
    attendance_rate: number;
    best_day: string;
    worst_day: string;
  };
  by_modality: Array<{
    modality: string;
    classes: number;
    avg_attendance: number;
    rate: number;
  }>;
  by_day_of_week: Array<{
    day: string;
    avg_attendance: number;
  }>;
  absent_alerts: Array<{
    student_name: string;
    days_absent: number;
    last_attendance: string;
  }>;
}

export interface FinancialReportData {
  meta: ReportMeta;
  summary: {
    revenue: number;
    revenue_prev: number;
    revenue_change_pct: number;
    pending: number;
    overdue: number;
    overdue_count: number;
    paid_count: number;
    total_count: number;
    ticket_medio: number;
  };
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    pending: number;
  }>;
  by_payment_method: Array<{
    method: string;
    count: number;
    total: number;
  }>;
  overdue_list: Array<{
    student_name: string;
    amount: number;
    due_date: string;
    days_overdue: number;
  }>;
}

export type ReportType = 'monthly' | 'attendance' | 'financial';
export type ReportData = MonthlyReportData | AttendanceReportData | FinancialReportData;
