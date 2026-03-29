import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'sso_config')
      .single();

    if (error || !data) {
      logServiceError(error, 'sso');
      return null;
    }
    return data.value as unknown as SSOConfig;
  } catch (error) {
    logServiceError(error, 'sso');
    return null;
  }
}

export async function updateSSOConfig(academyId: string, config: Partial<SSOConfig>): Promise<SSOConfig> {
  try {
    if (isMock()) {
      const { mockUpdateSSOConfig } = await import('@/lib/mocks/sso.mock');
      return mockUpdateSSOConfig(academyId, config);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .upsert({ academy_id: academyId, key: 'sso_config', value: config }, { onConflict: 'academy_id,key' })
      .select('value')
      .single();

    if (error || !data) {
      logServiceError(error, 'sso');
      return config as SSOConfig;
    }
    return data.value as unknown as SSOConfig;
  } catch (error) {
    logServiceError(error, 'sso');
    return config as SSOConfig;
  }
}

export async function initSSOLogin(provider: SSOProvider, _academyId: string): Promise<{ redirectUrl: string }> {
  try {
    if (isMock()) {
      const { mockInitSSOLogin } = await import('@/lib/mocks/sso.mock');
      return mockInitSSOLogin(provider, _academyId);
    }
    // SSO login requires external provider configuration
    logServiceError(new Error('SSO not configured for provider'), 'sso');
    return { redirectUrl: '' };
  } catch (error) {
    logServiceError(error, 'sso');
    return { redirectUrl: '' };
  }
}

export async function handleSSOCallback(provider: SSOProvider, _code: string): Promise<SSOCallbackResult> {
  try {
    if (isMock()) {
      const { mockHandleSSOCallback } = await import('@/lib/mocks/sso.mock');
      return mockHandleSSOCallback(provider, _code);
    }
    // SSO callback requires external provider configuration
    logServiceError(new Error('SSO not configured for provider'), 'sso');
    return { user: { id: '', email: '', name: '' }, profile: { externalId: '', provider }, tokens: { accessToken: '', refreshToken: '' } };
  } catch (error) {
    logServiceError(error, 'sso');
    return { user: { id: '', email: '', name: '' }, profile: { externalId: '', provider }, tokens: { accessToken: '', refreshToken: '' } };
  }
}

export async function testSSOConnection(academyId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isMock()) {
      const { mockTestSSOConnection } = await import('@/lib/mocks/sso.mock');
      return mockTestSSOConnection(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'sso_config')
      .single();

    if (error || !data) {
      return { success: false, error: 'SSO não configurado' };
    }

    const cfg = data.value as Record<string, unknown>;
    if (!cfg.clientId) {
      return { success: false, error: 'Client ID não configurado' };
    }

    return { success: true, error: null };
  } catch (error) {
    logServiceError(error, 'sso');
    return { success: false, error: 'Erro ao testar conexão SSO' };
  }
}
