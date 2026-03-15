import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export type SSOProvider = 'google' | 'azure' | 'saml';

export interface SSOConfig {
  provider: SSOProvider;
  enabled: boolean;
  clientId: string;
  tenantId: string | null;
  samlMetadataUrl: string | null;
  forceSSO: boolean;
  roleMapping: Record<string, string>;
}

export interface SSOCallbackResult {
  user: { id: string; email: string; name: string };
  profile: { externalId: string; provider: SSOProvider };
  tokens: { accessToken: string; refreshToken: string };
}

export async function getSSOConfig(academyId: string): Promise<SSOConfig | null> {
  try {
    if (isMock()) {
      const { mockGetSSOConfig } = await import('@/lib/mocks/sso.mock');
      return mockGetSSOConfig(academyId);
    }
    const res = await fetch(`/api/sso/config?academyId=${academyId}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) { handleServiceError(error, 'sso.getConfig'); }
}

export async function updateSSOConfig(academyId: string, config: Partial<SSOConfig>): Promise<SSOConfig> {
  try {
    if (isMock()) {
      const { mockUpdateSSOConfig } = await import('@/lib/mocks/sso.mock');
      return mockUpdateSSOConfig(academyId, config);
    }
    const res = await fetch('/api/sso/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...config }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'sso.updateConfig'); }
}

export async function initSSOLogin(provider: SSOProvider, academyId: string): Promise<{ redirectUrl: string }> {
  try {
    if (isMock()) {
      const { mockInitSSOLogin } = await import('@/lib/mocks/sso.mock');
      return mockInitSSOLogin(provider, academyId);
    }
    const res = await fetch('/api/sso/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, academyId }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'sso.initLogin'); }
}

export async function handleSSOCallback(provider: SSOProvider, code: string): Promise<SSOCallbackResult> {
  try {
    if (isMock()) {
      const { mockHandleSSOCallback } = await import('@/lib/mocks/sso.mock');
      return mockHandleSSOCallback(provider, code);
    }
    const res = await fetch('/api/sso/callback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, code }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'sso.callback'); }
}

export async function testSSOConnection(academyId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isMock()) {
      const { mockTestSSOConnection } = await import('@/lib/mocks/sso.mock');
      return mockTestSSOConnection(academyId);
    }
    const res = await fetch('/api/sso/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'sso.test'); }
}
