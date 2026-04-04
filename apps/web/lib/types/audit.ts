// ============================================================
// BlackBelt v2 — Audit Log Types
// P-049: Audit trail for compliance and security
// ============================================================

export type AuditEntryAction =
  | 'login'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'approve'
  | 'payment';

export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: AuditEntryAction;
  entity_type: string;
  entity_id: string;
  changes_json: Record<string, unknown> | null;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface AuditEntryFilters {
  action?: AuditEntryAction;
  user_id?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
