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
