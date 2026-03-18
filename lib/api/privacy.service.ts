import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface ConsentRecord {
  id: string;
  type: 'terms' | 'privacy' | 'marketing' | 'cookies';
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

export async function getConsents(userId: string): Promise<ConsentRecord[]> {
  try {
    if (isMock()) {
      const { mockGetConsents } = await import('@/lib/mocks/privacy.mock');
      return mockGetConsents(userId);
    }
    try {
      const res = await fetch(`/api/privacy/consents?userId=${userId}`);
      return res.json();
    } catch {
      console.warn('[privacy.getConsents] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'privacy.getConsents'); }
}

export async function updateConsent(userId: string, type: ConsentRecord['type'], accepted: boolean): Promise<ConsentRecord> {
  try {
    if (isMock()) {
      const { mockUpdateConsent } = await import('@/lib/mocks/privacy.mock');
      return mockUpdateConsent(userId, type, accepted);
    }
    try {
      const res = await fetch('/api/privacy/consents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, type, accepted }) });
      return res.json();
    } catch {
      console.warn('[privacy.updateConsent] API not available, using fallback');
      return { id: "", user_id: "", consent_type: "", granted: false, granted_at: "", ip: "" } as unknown as ConsentRecord;
    }
  } catch (error) { handleServiceError(error, 'privacy.updateConsent'); }
}

export async function requestDataExport(userId: string): Promise<DataExportRequest> {
  try {
    if (isMock()) {
      const { mockRequestDataExport } = await import('@/lib/mocks/privacy.mock');
      return mockRequestDataExport(userId);
    }
    try {
      const res = await fetch('/api/privacy/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      return res.json();
    } catch {
      console.warn('[privacy.requestDataExport] API not available, using fallback');
      return { id: "", user_id: "", status: "pending", requested_at: "", completed_at: null, download_url: null } as unknown as DataExportRequest;
    }
  } catch (error) { handleServiceError(error, 'privacy.requestExport'); }
}

export async function getDataExportStatus(requestId: string): Promise<DataExportRequest> {
  try {
    if (isMock()) {
      const { mockGetDataExportStatus } = await import('@/lib/mocks/privacy.mock');
      return mockGetDataExportStatus(requestId);
    }
    try {
      const res = await fetch(`/api/privacy/export/${requestId}`);
      return res.json();
    } catch {
      console.warn('[privacy.getDataExportStatus] API not available, using fallback');
      return { id: "", user_id: "", status: "pending", requested_at: "", completed_at: null, download_url: null } as unknown as DataExportRequest;
    }
  } catch (error) { handleServiceError(error, 'privacy.exportStatus'); }
}

export async function requestAccountDeletion(userId: string): Promise<DeletionRequest> {
  try {
    if (isMock()) {
      const { mockRequestDeletion } = await import('@/lib/mocks/privacy.mock');
      return mockRequestDeletion(userId);
    }
    try {
      const res = await fetch('/api/privacy/delete-account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      return res.json();
    } catch {
      console.warn('[privacy.requestAccountDeletion] API not available, using fallback');
      return { id: "", user_id: "", status: "pending", requested_at: "", completed_at: null, reason: "" } as unknown as DeletionRequest;
    }
  } catch (error) { handleServiceError(error, 'privacy.deleteAccount'); }
}
