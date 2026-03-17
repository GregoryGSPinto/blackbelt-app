// ============================================================
// BlackBelt v2 — Tipos do Sistema de Convites por Link
// ============================================================

import type { Role } from './domain';

export type InviteTokenStatus = 'active' | 'paused' | 'expired' | 'exhausted';

export interface InviteToken {
  readonly id: string;
  academy_id: string;
  created_by: string;
  token: string;
  target_role: Role;
  label: string;
  description: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  academy_name?: string;
  created_by_name?: string;
}

export interface InviteUse {
  readonly id: string;
  token_id: string;
  profile_id: string;
  used_at: string;
  ip_address: string | null;
  user_agent: string | null;
  // Joins
  profile_name?: string;
  profile_email?: string;
  profile_role?: string;
}

export interface CreateInvitePayload {
  target_role: Role;
  label: string;
  description?: string;
  max_uses?: number | null;
  expires_at?: string | null;
}

export interface UpdateInvitePayload {
  label?: string;
  description?: string;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface InviteValidation {
  valid: boolean;
  token?: InviteToken;
  academy_name?: string;
  academy_logo?: string | null;
  error?: 'expired' | 'max_uses' | 'inactive' | 'not_found';
}

export interface InviteStats {
  total: number;
  active: number;
  expired: number;
  total_uses: number;
  uses_this_month: number;
}
