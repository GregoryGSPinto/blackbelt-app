import type { ConsentRecord, DataExportRequest, DeletionRequest } from '@/lib/api/privacy.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetConsents(_userId: string): Promise<ConsentRecord[]> {
  await delay();
  return [
    { id: 'c1', type: 'terms', accepted: true, acceptedAt: '2025-01-15T10:00:00Z', version: '2.0' },
    { id: 'c2', type: 'privacy', accepted: true, acceptedAt: '2025-01-15T10:00:00Z', version: '2.0' },
    { id: 'c3', type: 'marketing', accepted: false, acceptedAt: null, version: '1.0' },
    { id: 'c4', type: 'data_processing', accepted: true, acceptedAt: '2025-01-15T10:00:00Z', version: '1.0' },
  ];
}

export async function mockUpdateConsent(_userId: string, type: ConsentRecord['type'], accepted: boolean): Promise<ConsentRecord> {
  await delay();
  return { id: `c-${type}`, type, accepted, acceptedAt: accepted ? new Date().toISOString() : null, version: '2.0' };
}

export async function mockRequestDataExport(_userId: string): Promise<DataExportRequest> {
  await delay();
  return {
    id: 'exp-1',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    completedAt: null,
    downloadUrl: null,
  };
}

export async function mockGetDataExportStatus(_requestId: string): Promise<DataExportRequest> {
  await delay();
  return {
    id: 'exp-1',
    status: 'ready',
    requestedAt: '2025-03-10T10:00:00Z',
    completedAt: '2025-03-10T10:05:00Z',
    downloadUrl: '/api/privacy/export/exp-1/download',
  };
}

export async function mockRequestDeletion(_userId: string): Promise<DeletionRequest> {
  await delay();
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setDate(scheduled.getDate() + 30);
  return {
    id: 'del-1',
    status: 'pending',
    requestedAt: now.toISOString(),
    scheduledDeletionAt: scheduled.toISOString(),
  };
}
