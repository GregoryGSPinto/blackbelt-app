import { isMock } from '@/lib/env';

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
    try {
      const res = await fetch('/api/v1/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, name }) });
      return res.json();
    } catch {
      console.warn('[api-keys.generateApiKey] API not available, using mock fallback');
      const { mockGenerateApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockGenerateApiKey(academyId, name);
    }
  } catch (error) {
    console.warn('[generateApiKey] Fallback:', error);
    return { key: '', secret: '', apiKey: { id: '', academyId, name, keyPrefix: '', permissions: [], createdAt: '', lastUsedAt: null, revokedAt: null } };
  }
}

export async function listApiKeys(academyId: string): Promise<ApiKey[]> {
  try {
    if (isMock()) {
      const { mockListApiKeys } = await import('@/lib/mocks/api-keys.mock');
      return mockListApiKeys(academyId);
    }
    try {
      const res = await fetch(`/api/v1/api-keys?academyId=${academyId}`);
      return res.json();
    } catch {
      console.warn('[api-keys.listApiKeys] API not available, using mock fallback');
      const { mockListApiKeys } = await import('@/lib/mocks/api-keys.mock');
      return mockListApiKeys(academyId);
    }
  } catch (error) {
    console.warn('[listApiKeys] Fallback:', error);
    return [];
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRevokeApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockRevokeApiKey(keyId);
    }
    try {
      await fetch(`/api/v1/api-keys/${keyId}`, { method: 'DELETE' });
    } catch {
      console.warn('[api-keys.revokeApiKey] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[revokeApiKey] Fallback:', error);
  }
}

export async function validateApiKey(key: string): Promise<{ academyId: string; permissions: string[] } | null> {
  try {
    if (isMock()) {
      const { mockValidateApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockValidateApiKey(key);
    }
    try {
      const res = await fetch('/api/v1/api-keys/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
      if (!res.ok) return null;
      return res.json();
    } catch {
      console.warn('[api-keys.validateApiKey] API not available, using fallback');
      return null;
    }
  } catch (error) {
    console.warn('[validateApiKey] Fallback:', error);
    return null;
  }
}
