// ============================================================
// BlackBelt v2 — Guardian Link Types
// ============================================================

export type GuardianRelationshipType = 'parent' | 'legal_guardian' | 'other';

export interface GuardianLink {
  id: string;
  guardian_id: string;
  child_id: string;
  relationship: GuardianRelationshipType;
  can_precheckin: boolean;
  can_view_grades: boolean;
  can_manage_payments: boolean;
  created_at: string;
  // Joined fields
  child_name?: string;
  child_role?: string;
  child_avatar_url?: string;
  guardian_name?: string;
}

export interface GuardianLinkCreateDTO {
  guardian_id: string;
  child_id: string;
  relationship: GuardianRelationshipType;
}

export interface GuardianLinkPermissions {
  can_precheckin?: boolean;
  can_view_grades?: boolean;
  can_manage_payments?: boolean;
}
