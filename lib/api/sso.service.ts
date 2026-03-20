import { isMock } from '@/lib/env';

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
      console.warn('[getSSOConfig] error:', error?.message ?? 'not found');
      return null;
    }
    return data.value as unknown as SSOConfig;
  } catch (error) {
    console.warn('[getSSOConfig] Fallback:', error);
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
      console.warn('[updateSSOConfig] error:', error?.message);
      return config as SSOConfig;
    }
    return data.value as unknown as SSOConfig;
  } catch (error) {
    console.warn('[updateSSOConfig] Fallback:', error);
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
    console.warn('[initSSOLogin] SSO not configured for provider:', provider);
    return { redirectUrl: '' };
  } catch (error) {
    console.warn('[initSSOLogin] Fallback:', error);
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
    console.warn('[handleSSOCallback] SSO not configured for provider:', provider);
    return { user: { id: '', email: '', name: '' }, profile: { externalId: '', provider }, tokens: { accessToken: '', refreshToken: '' } };
  } catch (error) {
    console.warn('[handleSSOCallback] Fallback:', error);
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
    console.warn('[testSSOConnection] Fallback:', error);
    return { success: false, error: 'Erro ao testar conexão SSO' };
  }
}
