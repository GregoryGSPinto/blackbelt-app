import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import { logServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export interface ConsentRecord {
  userId: string;
  type: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  accepted: boolean;
  version: string;
  timestamp: string;
  ipAddress: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  format: 'json' | 'pdf';
  downloadUrl: string | null;
  requestedAt: string;
  completedAt: string | null;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed';
  requestedAt: string;
  scheduledAt: string;
  completedAt: string | null;
}

// ── Service ───────────────────────────────────────────────────

export async function recordConsent(
  userId: string,
  type: ConsentRecord['type'],
  accepted: boolean,
  version: string,
): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Consent recorded: ${type} = ${accepted} for user ${userId}`);
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('consent_records')
      .insert({
        user_id: userId,
        type,
        accepted,
        version,
      });

    if (error) {
      logServiceError(error, 'lgpd');
    }
  } catch (error) {
    logServiceError(error, 'lgpd');
  }
}

export async function getConsentHistory(userId: string): Promise<ConsentRecord[]> {
  try {
    if (isMock()) {
      return [
        { userId, type: 'terms', accepted: true, version: '1.0', timestamp: '2026-01-15T10:00:00Z', ipAddress: '189.0.1.1' },
        { userId, type: 'privacy', accepted: true, version: '1.0', timestamp: '2026-01-15T10:00:00Z', ipAddress: '189.0.1.1' },
        { userId, type: 'marketing', accepted: false, version: '1.0', timestamp: '2026-01-15T10:00:00Z', ipAddress: '189.0.1.1' },
        { userId, type: 'data_processing', accepted: true, version: '1.0', timestamp: '2026-01-15T10:00:00Z', ipAddress: '189.0.1.1' },
      ];
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'lgpd');
      return [];
    }

    return (data as Record<string, unknown>[]).map((d) => ({
      userId: (d.user_id as string) ?? userId,
      type: (d.type as ConsentRecord['type']) ?? 'terms',
      accepted: (d.accepted as boolean) ?? false,
      version: (d.version as string) ?? '',
      timestamp: (d.created_at as string) ?? '',
      ipAddress: (d.ip_address as string) ?? '',
    }));
  } catch (error) {
    logServiceError(error, 'lgpd');
    return [];
  }
}

export async function requestDataExport(userId: string, format: 'json' | 'pdf' = 'json'): Promise<DataExportRequest> {
  const fallback: DataExportRequest = {
    id: '',
    userId,
    status: 'pending',
    format,
    downloadUrl: null,
    requestedAt: new Date().toISOString(),
    completedAt: null,
  };

  try {
    if (isMock()) {
      logger.debug(`[MOCK] Data export requested for user ${userId} in ${format}`);
      return {
        id: `export-${Date.now()}`,
        userId,
        status: 'processing',
        format,
        downloadUrl: null,
        requestedAt: new Date().toISOString(),
        completedAt: null,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({ user_id: userId, format, status: 'pending' })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'lgpd');
      return fallback;
    }

    return {
      id: data.id ?? '',
      userId: data.user_id ?? userId,
      status: data.status ?? 'pending',
      format: data.format ?? format,
      downloadUrl: data.download_url ?? null,
      requestedAt: data.created_at ?? new Date().toISOString(),
      completedAt: data.completed_at ?? null,
    };
  } catch (error) {
    logServiceError(error, 'lgpd');
    return fallback;
  }
}

export async function requestDataDeletion(userId: string): Promise<DataDeletionRequest> {
  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 30);
  const fallback: DataDeletionRequest = {
    id: '',
    userId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    scheduledAt: scheduled.toISOString(),
    completedAt: null,
  };

  try {
    if (isMock()) {
      logger.debug(`[MOCK] Data deletion requested for user ${userId}`);
      return {
        id: `delete-${Date.now()}`,
        userId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        scheduledAt: scheduled.toISOString(),
        completedAt: null,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .insert({ user_id: userId, status: 'pending', scheduled_at: scheduled.toISOString() })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'lgpd');
      return fallback;
    }

    return {
      id: data.id ?? '',
      userId: data.user_id ?? userId,
      status: data.status ?? 'pending',
      requestedAt: data.created_at ?? new Date().toISOString(),
      scheduledAt: data.scheduled_at ?? scheduled.toISOString(),
      completedAt: data.completed_at ?? null,
    };
  } catch (error) {
    logServiceError(error, 'lgpd');
    return fallback;
  }
}
