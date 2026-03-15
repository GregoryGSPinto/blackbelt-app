import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface ApiKey {
  id: string;
  academyId: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ApiKeyCreateResult {
  key: string;
  secret: string;
  apiKey: ApiKey;
}

export async function generateApiKey(academyId: string, name: string): Promise<ApiKeyCreateResult> {
  try {
    if (isMock()) {
      const { mockGenerateApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockGenerateApiKey(academyId, name);
    }
    const res = await fetch('/api/v1/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, name }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'apiKeys.generate'); }
}

export async function listApiKeys(academyId: string): Promise<ApiKey[]> {
  try {
    if (isMock()) {
      const { mockListApiKeys } = await import('@/lib/mocks/api-keys.mock');
      return mockListApiKeys(academyId);
    }
    const res = await fetch(`/api/v1/api-keys?academyId=${academyId}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'apiKeys.list'); }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRevokeApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockRevokeApiKey(keyId);
    }
    await fetch(`/api/v1/api-keys/${keyId}`, { method: 'DELETE' });
  } catch (error) { handleServiceError(error, 'apiKeys.revoke'); }
}

export async function validateApiKey(key: string): Promise<{ academyId: string; permissions: string[] } | null> {
  try {
    if (isMock()) {
      const { mockValidateApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockValidateApiKey(key);
    }
    const res = await fetch('/api/v1/api-keys/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { handleServiceError(error, 'apiKeys.validate'); }
}
