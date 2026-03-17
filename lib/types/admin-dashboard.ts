// ============================================================
// BlackBelt v2 — Admin Dashboard Types
// Cockpit experience: metrics, alerts, achievements
// ============================================================

export interface HeadlineMetric {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface ClassesHeadline {
  value: number;
  total_capacity: number;
  fill_rate: number;
}

export interface AtRiskStudent {
  name: string;
  last_attendance: string;
  belt: string;
}

export interface ScheduleItem {
  id: string;
  class_name: string;
  time: string;
  professor: string;
  modality: string;
  enrolled: number;
  capacity: number;
  confirmed: number;
  status: 'upcoming' | 'in_progress' | 'completed';
}

export interface ActivityFeedItem {
  id: string;
  type: 'check_in' | 'signup' | 'belt_promotion' | 'payment' | 'video_watched' | 'quiz_completed' | 'achievement' | 'absence_alert';
  message: string;
  actor_name: string;
  timestamp: string;
  icon: string;
  accent_color: string;
}

export interface PendingPromotion {
  student_name: string;
  current_belt: string;
  suggested_belt: string;
  attendance_count: number;
  months_at_belt: number;
  quiz_avg: number;
  ready: boolean;
}

export interface OverdueStudent {
  name: string;
  amount: number;
  days_overdue: number;
}

export interface PlanUsageItem {
  current: number;
  limit: number;
}

export interface PlanUsageAlert {
  resource: string;
  percent: number;
  level: 'warning' | 'critical';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  accent?: string;
}

export interface AcademyAchievement {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  date?: string;
}

export interface DashboardData {
  greeting: {
    admin_name: string;
    academy_name: string;
    time_of_day: 'morning' | 'afternoon' | 'evening';
    motivation_quote: string;
  };

  headlines: {
    active_students: HeadlineMetric;
    monthly_revenue: HeadlineMetric;
    retention_rate: HeadlineMetric;
    classes_this_week: ClassesHeadline;
  };

  growth_chart: {
    labels: string[];
    students: number[];
    revenue: number[];
    churn: number[];
  };

  retention: {
    current_month: number;
    previous_month: number;
    at_risk: number;
    at_risk_names: AtRiskStudent[];
  };

  today_schedule: ScheduleItem[];

  activity_feed: ActivityFeedItem[];

  pending_promotions: PendingPromotion[];

  financial_summary: {
    revenue_this_month: number;
    revenue_last_month: number;
    pending_payments: number;
    overdue_count: number;
    overdue_names: OverdueStudent[];
  };

  plan_usage: {
    plan_name: string;
    students: PlanUsageItem;
    professors: PlanUsageItem;
    classes: PlanUsageItem;
    storage_gb: PlanUsageItem;
    alerts: PlanUsageAlert[];
  };

  streaming_summary: {
    total_views_week: number;
    most_watched: { title: string; views: number };
    completion_rate: number;
    new_videos_this_month: number;
  };

  quick_actions: QuickAction[];

  academy_achievements: AcademyAchievement[];
}
