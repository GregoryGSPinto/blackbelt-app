import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { AuditEntry, AuditEntryFilters } from '@/lib/types/audit';

export type AuditAction =
  | 'login' | 'logout' | 'password_change' | 'mfa_enable'
  | 'create' | 'update' | 'delete'
  | 'payment' | 'refund' | 'plan_change'
  | 'role_change' | 'invite' | 'deactivate' | 'config_change'
  | 'content_view' | 'report_export' | 'data_export';

export interface AuditLog {
  id: string;
  academyId: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditFilters {
  action?: AuditAction;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}

export async function logAudit(
  action: AuditAction,
  entityType: string,
  entityId: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null,
): Promise<void> {
  try {
    if (isMock()) return;
    fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, entityType, entityId, oldData, newData }),
    }).catch(() => { /* fire-and-forget */ });
  } catch { /* fire-and-forget */ }
}

export async function searchAuditLogs(academyId: string, filters: AuditFilters = {}): Promise<{ logs: AuditLog[]; nextCursor: string | null }> {
  try {
    if (isMock()) {
      const { mockSearchAuditLogs } = await import('@/lib/mocks/audit.mock');
      return mockSearchAuditLogs(academyId, filters);
    }
    const params = new URLSearchParams({ academyId });
    if (filters.action) params.set('action', filters.action);
    if (filters.actorId) params.set('actorId', filters.actorId);
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.cursor) params.set('cursor', filters.cursor);
    const res = await fetch(`/api/audit/search?${params}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'audit.search'); }
}

export async function getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
  try {
    if (isMock()) {
      const { mockGetEntityHistory } = await import('@/lib/mocks/audit.mock');
      return mockGetEntityHistory(entityType, entityId);
    }
    const res = await fetch(`/api/audit/entity/${entityType}/${entityId}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'audit.entityHistory'); }
}

export async function exportAuditLogs(academyId: string, filters: AuditFilters = {}): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockExportAuditLogs } = await import('@/lib/mocks/audit.mock');
      return mockExportAuditLogs(academyId, filters);
    }
    const params = new URLSearchParams({ academyId, format: 'csv' });
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    const res = await fetch(`/api/audit/export?${params}`);
    return res.blob();
  } catch (error) { handleServiceError(error, 'audit.export'); }
}

// ── P-049: AuditEntry CRUD ─────────────────────────────────────────

export async function listAuditEntries(
  academyId: string,
  filters: AuditEntryFilters = {},
): Promise<AuditEntry[]> {
  try {
    if (isMock()) {
      const { mockListAuditEntries } = await import('@/lib/mocks/audit.mock');
      return mockListAuditEntries(academyId, filters);
    }
    const params = new URLSearchParams({ academyId });
    if (filters.action) params.set('action', filters.action);
    if (filters.user_id) params.set('user_id', filters.user_id);
    if (filters.entity_type) params.set('entity_type', filters.entity_type);
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));
    const res = await fetch(`/api/audit/entries?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'audit.listEntries');
  }
}

export async function createAuditEntry(
  entry: Omit<AuditEntry, 'id' | 'created_at'>,
): Promise<AuditEntry> {
  try {
    if (isMock()) {
      const { mockCreateAuditEntry } = await import('@/lib/mocks/audit.mock');
      return mockCreateAuditEntry(entry);
    }
    const res = await fetch('/api/audit/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'audit.createEntry');
  }
}
