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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Generate random key and secret
    const randomHex = (len: number) => Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => b.toString(16).padStart(2, '0')).join('');
    const keyValue = `bb_${randomHex(16)}`;
    const secretValue = `bbs_${randomHex(32)}`;
    const now = new Date().toISOString();
    const keyId = crypto.randomUUID();

    const newApiKey: ApiKey = {
      id: keyId,
      academyId,
      name,
      keyPrefix: keyValue.slice(0, 10),
      permissions: ['read', 'write'],
      createdAt: now,
      lastUsedAt: null,
      revokedAt: null,
    };

    // Read current settings
    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', academyId)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;
    const keys = (settings.api_keys ?? []) as ApiKey[];
    keys.push(newApiKey);

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: academyId, settings: { ...settings, api_keys: keys }, updated_at: now },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[generateApiKey] Supabase error:', error.message);
      return { key: '', secret: '', apiKey: { ...newApiKey, id: '' } };
    }

    return { key: keyValue, secret: secretValue, apiKey: newApiKey };
  } catch (error) {
    console.error('[generateApiKey] Fallback:', error);
    return { key: '', secret: '', apiKey: { id: '', academyId, name, keyPrefix: '', permissions: [], createdAt: '', lastUsedAt: null, revokedAt: null } };
  }
}

export async function listApiKeys(academyId: string): Promise<ApiKey[]> {
  try {
    if (isMock()) {
      const { mockListApiKeys } = await import('@/lib/mocks/api-keys.mock');
      return mockListApiKeys(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', academyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[listApiKeys] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    const keys = (settings.api_keys ?? []) as ApiKey[];
    // Only return non-revoked keys
    return keys.filter((k) => !k.revokedAt);
  } catch (error) {
    console.error('[listApiKeys] Fallback:', error);
    return [];
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRevokeApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockRevokeApiKey(keyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Search across all academy_settings for this key
    const { data: rows } = await supabase
      .from('academy_settings')
      .select('academy_id, settings');

    for (const row of rows ?? []) {
      const settings = (row.settings ?? {}) as Record<string, unknown>;
      const keys = (settings.api_keys ?? []) as ApiKey[];
      const idx = keys.findIndex((k) => k.id === keyId);
      if (idx >= 0) {
        keys[idx] = { ...keys[idx], revokedAt: new Date().toISOString() };
        const { error } = await supabase.from('academy_settings').update(
          { settings: { ...settings, api_keys: keys }, updated_at: new Date().toISOString() },
        ).eq('academy_id', row.academy_id);
        if (error) console.error('[revokeApiKey] Supabase error:', error.message);
        return;
      }
    }
  } catch (error) {
    console.error('[revokeApiKey] Fallback:', error);
  }
}

export async function validateApiKey(key: string): Promise<{ academyId: string; permissions: string[] } | null> {
  try {
    if (isMock()) {
      const { mockValidateApiKey } = await import('@/lib/mocks/api-keys.mock');
      return mockValidateApiKey(key);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const prefix = key.slice(0, 10);

    const { data: rows } = await supabase
      .from('academy_settings')
      .select('academy_id, settings');

    for (const row of rows ?? []) {
      const settings = (row.settings ?? {}) as Record<string, unknown>;
      const keys = (settings.api_keys ?? []) as ApiKey[];
      const found = keys.find((k) => k.keyPrefix === prefix && !k.revokedAt);
      if (found) {
        return { academyId: found.academyId, permissions: found.permissions };
      }
    }

    return null;
  } catch (error) {
    console.error('[validateApiKey] Fallback:', error);
    return null;
  }
}
