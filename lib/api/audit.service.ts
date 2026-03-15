import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
