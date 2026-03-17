import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      console.log(`[MOCK] Consent recorded: ${type} = ${accepted} for user ${userId}`);
      return;
    }
    const res = await fetch('/api/lgpd/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, accepted, version }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'lgpd.recordConsent');
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
    const res = await fetch(`/api/lgpd/consent/history?userId=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'lgpd.consentHistory');
  }
}

export async function requestDataExport(userId: string, format: 'json' | 'pdf' = 'json'): Promise<DataExportRequest> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Data export requested for user ${userId} in ${format}`);
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
    const res = await fetch('/api/lgpd/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, format }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'lgpd.requestExport');
  }
}

export async function requestDataDeletion(userId: string): Promise<DataDeletionRequest> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Data deletion requested for user ${userId}`);
      const scheduled = new Date();
      scheduled.setDate(scheduled.getDate() + 30);
      return {
        id: `delete-${Date.now()}`,
        userId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        scheduledAt: scheduled.toISOString(),
        completedAt: null,
      };
    }
    const res = await fetch('/api/lgpd/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'lgpd.requestDeletion');
  }
}
