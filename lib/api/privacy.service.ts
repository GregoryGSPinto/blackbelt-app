import { isMock } from '@/lib/env';

export interface ConsentRecord {
  id: string;
  type: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
}

export interface DataExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  requestedAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
}

export interface DeletionRequest {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed';
  requestedAt: string;
  scheduledDeletionAt: string;
}

async function resolveProfileId(explicitProfileId?: string): Promise<string> {
  if (explicitProfileId) return explicitProfileId;

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario nao autenticado');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !profile?.id) {
    throw new Error('Perfil nao encontrado');
  }

  return profile.id;
}

export async function getConsents(userId?: string): Promise<ConsentRecord[]> {
  try {
    const profileId = await resolveProfileId(userId);

    if (isMock()) {
      const { mockGetConsents } = await import('@/lib/mocks/privacy.mock');
      return mockGetConsents(profileId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('consent_records')
        .select('id, type, accepted, version, created_at, updated_at')
        .eq('user_id', profileId)
        .order('updated_at', { ascending: false });
      if (error) {
        console.error('[getConsents] query error:', error.message);
        return [];
      }
      return (data ?? []).map((r: { id: string; type: string; accepted: boolean; version: string | null; updated_at: string | null }) => ({
        id: r.id,
        type: r.type as ConsentRecord['type'],
        accepted: r.accepted,
        acceptedAt: r.accepted ? r.updated_at : null,
        version: r.version ?? '1.0',
      }));
    } catch (err) {
      console.error('[privacy.getConsents] error, using fallback:', err);
      return [];
    }
  } catch (error) {
    console.error('[getConsents] Fallback:', error);
    return [];
  }
}

export async function updateConsent(userId: string | undefined, type: ConsentRecord['type'], accepted: boolean): Promise<ConsentRecord> {
  try {
    const profileId = await resolveProfileId(userId);

    if (isMock()) {
      const { mockUpdateConsent } = await import('@/lib/mocks/privacy.mock');
      return mockUpdateConsent(profileId, type, accepted);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('consent_records')
        .upsert(
          { user_id: profileId, type, accepted, version: '1.0', updated_at: new Date().toISOString() },
          { onConflict: 'user_id,type' }
        )
        .select('id, type, accepted, version, updated_at')
        .single();
      if (error || !data) {
        console.error('[updateConsent] upsert error:', error?.message);
        return { id: '', type, accepted, acceptedAt: null, version: '1.0' };
      }
      return {
        id: data.id,
        type: data.type as ConsentRecord['type'],
        accepted: data.accepted,
        acceptedAt: data.accepted ? data.updated_at : null,
        version: data.version ?? '1.0',
      };
    } catch (err) {
      console.error('[privacy.updateConsent] error, using fallback:', err);
      return { id: '', type, accepted, acceptedAt: null, version: '' };
    }
  } catch (error) {
    console.error('[updateConsent] Fallback:', error);
    return { id: '', type, accepted, acceptedAt: null, version: '' };
  }
}

export async function requestDataExport(userId?: string): Promise<DataExportRequest> {
  try {
    const profileId = await resolveProfileId(userId);

    if (isMock()) {
      const { mockRequestDataExport } = await import('@/lib/mocks/privacy.mock');
      return mockRequestDataExport(profileId);
    }

    const res = await fetch('/api/lgpd/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!res.ok) {
      console.error('[requestDataExport] route error:', res.status);
      return { id: '', status: 'pending' as const, requestedAt: new Date().toISOString(), completedAt: null, downloadUrl: null };
    }

    const data = await res.json();

    return {
      id: data.id ?? '',
      status: (data.status as DataExportRequest['status']) ?? 'pending',
      requestedAt: data.requestedAt ?? new Date().toISOString(),
      completedAt: data.completedAt ?? null,
      downloadUrl: data.downloadUrl ?? null,
    };
  } catch (error) {
    console.error('[requestDataExport] Fallback:', error);
    return { id: '', status: 'pending', requestedAt: new Date().toISOString(), completedAt: null, downloadUrl: null };
  }
}

export async function getDataExportStatus(requestId: string): Promise<DataExportRequest> {
  try {
    if (isMock()) {
      const { mockGetDataExportStatus } = await import('@/lib/mocks/privacy.mock');
      return mockGetDataExportStatus(requestId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('data_export_requests')
        .select('id, status, created_at, completed_at, download_url')
        .eq('id', requestId)
        .single();
      if (error || !data) {
        console.error('[getDataExportStatus] query error:', error?.message);
        return { id: requestId, status: 'pending' as const, requestedAt: '', completedAt: null, downloadUrl: null };
      }
      return {
        id: data.id,
        status: data.status as DataExportRequest['status'],
        requestedAt: data.created_at,
        completedAt: data.completed_at,
        downloadUrl: data.download_url,
      };
    } catch (err) {
      console.error('[privacy.getDataExportStatus] error, using fallback:', err);
      return { id: requestId, status: 'pending' as const, requestedAt: '', completedAt: null, downloadUrl: null };
    }
  } catch (error) {
    console.error('[getDataExportStatus] Fallback:', error);
    return { id: requestId, status: 'pending', requestedAt: '', completedAt: null, downloadUrl: null };
  }
}

export async function requestAccountDeletion(userId?: string): Promise<DeletionRequest> {
  try {
    const profileId = await resolveProfileId(userId);

    if (isMock()) {
      const { mockRequestDeletion } = await import('@/lib/mocks/privacy.mock');
      return mockRequestDeletion(profileId);
    }

    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, confirm: 'EXCLUIR' }),
    });

    if (!res.ok) {
      console.error('[requestAccountDeletion] route error:', res.status);
      return { id: '', status: 'pending' as const, requestedAt: new Date().toISOString(), scheduledDeletionAt: '' };
    }

    const data = await res.json();

    return {
      id: data.id ?? '',
      status: (data.status as DeletionRequest['status']) ?? 'pending',
      requestedAt: data.requestedAt ?? new Date().toISOString(),
      scheduledDeletionAt: data.scheduledDeletionAt ?? '',
    };
  } catch (error) {
    console.error('[requestAccountDeletion] Fallback:', error);
    return { id: '', status: 'pending', requestedAt: new Date().toISOString(), scheduledDeletionAt: '' };
  }
}
