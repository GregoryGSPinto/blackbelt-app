// ============================================================
// BlackBelt v2 — Student Management Types (Admin)
// ============================================================

import type { BeltLevel } from './domain';

export type StudentManagementStatus = 'active' | 'inactive' | 'pending';

export type MensalidadeStatusBadge = 'em_dia' | 'pendente' | 'atrasado';

export interface AdminStudentItem {
  id: string;
  profile_id: string;
  display_name: string;
  email: string;
  phone: string;
  belt: BeltLevel;
  turmas: string[];
  attendance_rate: number;
  mensalidade_status: MensalidadeStatusBadge;
  billing_type: string;
  monthly_amount: number; // centavos
  payment_method_default: string;
  recurrence: string;
  next_due_date: string | null;
  checkin_goal_status: 'ok' | 'attention' | 'risk';
  current_month_checkins: number;
  monthly_checkin_minimum: number;
  alert_sent_today: boolean;
  status: StudentManagementStatus;
  started_at: string;
  avatar_url: string | null;
}

export interface StudentManagementStats {
  total_active: number;
  new_this_month: number;
  inactive: number;
  by_belt: Record<string, number>;
}
