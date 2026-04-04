import { createBrowserClient } from '@/lib/supabase/client';
import { getAppUrl } from '@/lib/config/domains';
import { isMock } from '@/lib/env';

export type OAuthProvider = 'google' | 'apple';

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  if (isMock()) {
    throw new Error('OAuth disponível apenas em produção. Use email/senha para testar.');
  }

  const supabase = createBrowserClient();

  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
      : `${getAppUrl()}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined,
    },
  });

  if (error) {
    throw new Error(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Apple'}: ${error.message}`);
  }
}
