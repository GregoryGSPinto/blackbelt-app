import type { SSOConfig, SSOCallbackResult, SSOProvider } from '@/lib/api/sso.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetSSOConfig(_academyId: string): Promise<SSOConfig | null> {
  await delay();
  return {
    provider: 'google',
    enabled: false,
    clientId: '',
    tenantId: null,
    samlMetadataUrl: null,
    forceSSO: false,
    roleMapping: { 'admin@academia.com': 'admin', 'professor@academia.com': 'professor' },
  };
}

export async function mockUpdateSSOConfig(_academyId: string, config: Partial<SSOConfig>): Promise<SSOConfig> {
  await delay();
  return {
    provider: config.provider ?? 'google',
    enabled: config.enabled ?? false,
    clientId: config.clientId ?? '',
    tenantId: config.tenantId ?? null,
    samlMetadataUrl: config.samlMetadataUrl ?? null,
    forceSSO: config.forceSSO ?? false,
    roleMapping: config.roleMapping ?? {},
  };
}

export async function mockInitSSOLogin(_provider: SSOProvider, _academyId: string): Promise<{ redirectUrl: string }> {
  await delay();
  return { redirectUrl: '#sso-mock-redirect' };
}

export async function mockHandleSSOCallback(_provider: SSOProvider, _code: string): Promise<SSOCallbackResult> {
  await delay();
  return {
    user: { id: 'sso-user-1', email: 'admin@academia.com', name: 'Admin SSO' },
    profile: { externalId: 'ext-123', provider: 'google' },
    tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
  };
}

export async function mockTestSSOConnection(_academyId: string): Promise<{ success: boolean; error: string | null }> {
  await delay();
  return { success: true, error: null };
}
