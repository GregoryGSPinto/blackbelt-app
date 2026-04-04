import type { ApiKey, ApiKeyCreateResult } from '@/lib/api/api-keys.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const MOCK_KEYS: ApiKey[] = [
  { id: 'ak-1', academyId: 'academy-1', name: 'Integração ERP', keyPrefix: 'bb_live_abc1', permissions: ['students:read', 'invoices:read'], createdAt: '2025-06-01T10:00:00Z', lastUsedAt: '2025-07-10T14:30:00Z', revokedAt: null },
  { id: 'ak-2', academyId: 'academy-1', name: 'Website Widget', keyPrefix: 'bb_live_def2', permissions: ['classes:read', 'events:read'], createdAt: '2025-05-15T08:00:00Z', lastUsedAt: '2025-07-09T11:00:00Z', revokedAt: null },
  { id: 'ak-3', academyId: 'academy-1', name: 'Teste (revogada)', keyPrefix: 'bb_test_xyz3', permissions: ['students:read'], createdAt: '2025-03-01T10:00:00Z', lastUsedAt: null, revokedAt: '2025-04-01T10:00:00Z' },
];

export async function mockGenerateApiKey(academyId: string, name: string): Promise<ApiKeyCreateResult> {
  await delay();
  const id = `ak-${Date.now()}`;
  const key = `bb_live_${Math.random().toString(36).slice(2, 14)}`;
  const secret = `bb_secret_${Math.random().toString(36).slice(2, 26)}`;
  const apiKey: ApiKey = { id, academyId, name, keyPrefix: key.slice(0, 14), permissions: ['students:read', 'classes:read', 'attendance:read', 'invoices:read', 'plans:read', 'events:read'], createdAt: new Date().toISOString(), lastUsedAt: null, revokedAt: null };
  return { key, secret, apiKey };
}

export async function mockListApiKeys(_academyId: string): Promise<ApiKey[]> {
  await delay();
  return MOCK_KEYS;
}

export async function mockRevokeApiKey(_keyId: string): Promise<void> {
  await delay();
}

export async function mockValidateApiKey(_key: string): Promise<{ academyId: string; permissions: string[] } | null> {
  await delay();
  return { academyId: 'academy-1', permissions: ['students:read', 'classes:read', 'attendance:read'] };
}
