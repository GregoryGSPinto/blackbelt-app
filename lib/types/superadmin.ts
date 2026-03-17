// ============================================================
// BlackBelt v2 — Tipos do Super Admin (Gestao da Plataforma)
// ============================================================

export interface PlatformPlan {
  readonly id: string;
  name: string;
  slug: string;
  max_students: number;
  max_professors: number;
  max_classes: number;
  has_streaming: boolean;
  has_store: boolean;
  has_events: boolean;
  has_financeiro: boolean;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  created_at: string;
}

export type AcademyStatus = 'active' | 'suspended' | 'trial' | 'cancelled' | 'pending';

export interface AcademyFull {
  readonly id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  plan_id: string | null;
  plan?: PlatformPlan;
  status: AcademyStatus;
  trial_ends_at: string | null;
  onboarded_at: string | null;
  owner_profile_id: string | null;
  owner_name?: string;
  owner_email?: string;
  max_students: number;
  max_professors: number;
  total_students?: number;
  total_professors?: number;
  total_classes?: number;
  monthly_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardToken {
  readonly id: string;
  token: string;
  academy_name: string;
  plan_id: string | null;
  plan_name?: string;
  trial_days: number;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface PlatformStats {
  total_academies: number;
  active_academies: number;
  trial_academies: number;
  suspended_academies: number;
  total_students: number;
  total_professors: number;
  total_revenue_monthly: number;
  new_academies_this_month: number;
  new_students_this_month: number;
}

export interface CreateAcademyPayload {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  plan_id: string;
  trial_days?: number;
  notes?: string;
}

export interface UpdateAcademyPayload {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  plan_id?: string;
  status?: AcademyStatus;
  max_students?: number;
  max_professors?: number;
}

export interface OnboardValidation {
  valid: boolean;
  token?: OnboardToken;
  error?: 'expired' | 'max_uses' | 'inactive' | 'not_found';
}
