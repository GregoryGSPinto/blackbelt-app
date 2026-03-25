import { isMock } from '@/lib/env';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    supabase
      .from('audit_logs')
      .insert({ action, entity_type: entityType, entity_id: entityId, old_data: oldData ?? null, new_data: newData ?? null })
      .then(({ error: err }: { error: { message: string } | null }) => {
        if (err) console.error('[logAudit] Supabase error:', err.message);
      });
  } catch { /* fire-and-forget */ }
}

export async function searchAuditLogs(academyId: string, filters: AuditFilters = {}): Promise<{ logs: AuditLog[]; nextCursor: string | null }> {
  try {
    if (isMock()) {
      const { mockSearchAuditLogs } = await import('@/lib/mocks/audit.mock');
      return mockSearchAuditLogs(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 50);

    if (filters.action) query = query.eq('action', filters.action);
    if (filters.actorId) query = query.eq('actor_id', filters.actorId);
    if (filters.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);
    if (filters.cursor) query = query.lt('created_at', filters.cursor);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[searchAuditLogs] Supabase error:', error?.message);
      return { logs: [], nextCursor: null };
    }

    const logs: AuditLog[] = (data as Record<string, unknown>[]).map((d) => ({
      id: (d.id as string) ?? '',
      academyId: (d.academy_id as string) ?? academyId,
      actorId: (d.actor_id as string) ?? '',
      actorName: (d.actor_name as string) ?? '',
      action: (d.action as AuditAction) ?? 'create',
      entityType: (d.entity_type as string) ?? '',
      entityId: (d.entity_id as string) ?? '',
      oldData: (d.old_data as Record<string, unknown> | null) ?? null,
      newData: (d.new_data as Record<string, unknown> | null) ?? null,
      ipAddress: (d.ip_address as string) ?? '',
      userAgent: (d.user_agent as string) ?? '',
      createdAt: (d.created_at as string) ?? '',
    }));

    const nextCursor = logs.length > 0 ? logs[logs.length - 1].createdAt : null;
    return { logs, nextCursor };
  } catch (error) {
    console.error('[searchAuditLogs] Fallback:', error);
    return { logs: [], nextCursor: null };
  }
}

export async function getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
  try {
    if (isMock()) {
      const { mockGetEntityHistory } = await import('@/lib/mocks/audit.mock');
      return mockGetEntityHistory(entityType, entityId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[getEntityHistory] Supabase error:', error?.message);
      return [];
    }

    return (data as Record<string, unknown>[]).map((d) => ({
      id: (d.id as string) ?? '',
      academyId: (d.academy_id as string) ?? '',
      actorId: (d.actor_id as string) ?? '',
      actorName: (d.actor_name as string) ?? '',
      action: (d.action as AuditAction) ?? 'create',
      entityType: (d.entity_type as string) ?? '',
      entityId: (d.entity_id as string) ?? '',
      oldData: (d.old_data as Record<string, unknown> | null) ?? null,
      newData: (d.new_data as Record<string, unknown> | null) ?? null,
      ipAddress: (d.ip_address as string) ?? '',
      userAgent: (d.user_agent as string) ?? '',
      createdAt: (d.created_at as string) ?? '',
    }));
  } catch (error) {
    console.error('[getEntityHistory] Fallback:', error);
    return [];
  }
}

export async function exportAuditLogs(academyId: string, filters: AuditFilters = {}): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockExportAuditLogs } = await import('@/lib/mocks/audit.mock');
      return mockExportAuditLogs(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[exportAuditLogs] Supabase error:', error?.message);
      return new Blob();
    }

    const csv = [
      'id,academy_id,actor_id,actor_name,action,entity_type,entity_id,created_at',
      ...(data as Record<string, unknown>[]).map((d) =>
        `${d.id},${d.academy_id},${d.actor_id},${d.actor_name},${d.action},${d.entity_type},${d.entity_id},${d.created_at}`
      ),
    ].join('\n');

    return new Blob([csv], { type: 'text/csv' });
  } catch (error) {
    console.error('[exportAuditLogs] Fallback:', error);
    return new Blob();
  }
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('audit_entries')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters.action) query = query.eq('action', filters.action);
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
    if (filters.start_date) query = query.gte('created_at', filters.start_date);
    if (filters.end_date) query = query.lte('created_at', filters.end_date);
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[listAuditEntries] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as AuditEntry[];
  } catch (error) {
    console.error('[listAuditEntries] Fallback:', error);
    return [];
  }
}

export async function createAuditEntry(
  entry: Omit<AuditEntry, 'id' | 'created_at'>,
): Promise<AuditEntry> {
  const fallback = { id: '', user_id: '', user_name: '', action: 'create', entity_type: '', entity_id: '', changes_json: null, ip: '', user_agent: '', created_at: '' } as AuditEntry;

  try {
    if (isMock()) {
      const { mockCreateAuditEntry } = await import('@/lib/mocks/audit.mock');
      return mockCreateAuditEntry(entry);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('audit_entries')
      .insert(entry)
      .select()
      .single();

    if (error || !data) {
      console.error('[createAuditEntry] Supabase error:', error?.message);
      return fallback;
    }

    return data as unknown as AuditEntry;
  } catch (error) {
    console.error('[createAuditEntry] Fallback:', error);
    return fallback;
  }
}
