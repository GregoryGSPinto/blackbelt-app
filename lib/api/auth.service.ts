import { isMock } from '@/lib/env';
import type { Profile } from '@/lib/types';
import { translateError } from '@/lib/utils/error-translator';
import { getAuthRedirectUrl } from '@/lib/auth/redirects';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  profiles: Profile[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: { id: string; email: string };
  profile: Profile;
}

export type OAuthProvider = 'google' | 'apple';

export interface RefreshResponse {
  accessToken: string;
}

export interface SelectProfileResponse {
  accessToken: string;
  profile: Profile;
}

function getAuthErrorMessage(message: string, fallbackPrefix?: string): string {
  const translated = translateError(new Error(message));
  if (translated !== 'Algo deu errado. Tente novamente.') {
    return translated;
  }

  return fallbackPrefix ? `${fallbackPrefix}: ${message}` : message;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  if (isMock()) {
    const { mockLogin } = await import('@/lib/mocks/auth.mock');
    return mockLogin(data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    console.error('[auth] signInWithPassword failed:', error.message);
    throw new Error(getAuthErrorMessage(error.message, 'Nao foi possivel entrar'));
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authData.user.id);
  if (profileError) {
    console.error('[auth] profiles query failed:', profileError.message);
    throw new Error(`Erro ao carregar perfis: ${profileError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    console.error('[auth] No profiles found for user:', authData.user.id);
    throw new Error('Nenhum perfil encontrado. Contate o administrador.');
  }

  return {
    accessToken: authData.session?.access_token ?? '',
    refreshToken: authData.session?.refresh_token ?? '',
    profiles: profiles as Profile[],
  };
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  if (isMock()) {
    const { mockRegister } = await import('@/lib/mocks/auth.mock');
    return mockRegister(data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name } },
  });
  if (error) {
    console.error('[auth] signUp failed:', error.message);
    throw new Error(getAuthErrorMessage(error.message, 'Nao foi possivel criar sua conta'));
  }
  if (!authData.user) {
    console.error('[auth] signUp returned no user');
    throw new Error('Erro ao criar conta. Tente novamente.');
  }

  // The DB trigger auto-creates a profile; fetch it
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authData.user.id)
    .limit(1);
  if (profileError) {
    console.error('[auth] register profiles fetch error:', profileError.message);
  }

  const profile = (profiles?.[0] ?? {
    id: authData.user.id,
    user_id: authData.user.id,
    role: 'admin',
    display_name: data.name,
    avatar: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }) as Profile;

  return {
    user: { id: authData.user.id, email: authData.user.email ?? data.email },
    profile,
  };
}

export async function loginWithOAuth(
  provider: OAuthProvider,
  options?: { inviteToken?: string },
): Promise<LoginResponse | void> {
  if (isMock()) {
    const { mockLoginWithOAuth } = await import('@/lib/mocks/auth.mock');
    return mockLoginWithOAuth(provider);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  let redirectTo = getAuthRedirectUrl('/auth/callback');
  if (options?.inviteToken) {
    redirectTo += `?invite_token=${encodeURIComponent(options.inviteToken)}`;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) {
    console.error('[auth] signInWithOAuth failed:', error.message);
    throw new Error(getAuthErrorMessage(error.message, `Nao foi possivel entrar com ${provider}`));
  }
  // In real mode, browser redirects away — no return value
}

export async function resendEmailConfirmation(email: string): Promise<void> {
  if (isMock()) return;

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
    },
  });

  if (error) {
    console.error('[auth] resend confirmation failed:', error.message);
    throw new Error(getAuthErrorMessage(error.message, 'Nao foi possivel reenviar a confirmacao'));
  }
}

export async function refreshToken(_token: string): Promise<RefreshResponse> {
  if (isMock()) {
    const { mockRefreshToken } = await import('@/lib/mocks/auth.mock');
    return mockRefreshToken(_token);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('[auth] refreshSession failed:', error.message);
    throw new Error(`Sessão expirada: ${error.message}`);
  }

  return { accessToken: data.session?.access_token ?? '' };
}

export async function selectProfile(profileId: string): Promise<SelectProfileResponse> {
  if (isMock()) {
    const { mockSelectProfile } = await import('@/lib/mocks/auth.mock');
    const result = await mockSelectProfile(profileId);
    // Set cookies so middleware can validate role on next navigation
    const cookieOpts = ';path=/;max-age=' + (60 * 60 * 24 * 30) + ';samesite=lax';
    document.cookie = `bb-active-role=${result.profile.role}${cookieOpts}`;
    document.cookie = `bb-academy-id=academy-1${cookieOpts}`;
    return result;
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  if (error || !profile) {
    console.error('[auth] selectProfile failed:', error?.message);
    throw new Error(`Erro ao selecionar perfil: ${error?.message ?? 'Perfil não encontrado'}`);
  }

  // Get academy_id from membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('academy_id')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  // Store selected role and academy in cookies for middleware/services
  const cookieOpts = ';path=/;max-age=' + (60 * 60 * 24 * 30) + ';samesite=lax';
  document.cookie = `bb-active-role=${profile.role}${cookieOpts}`;
  if (membership?.academy_id) {
    document.cookie = `bb-academy-id=${membership.academy_id}${cookieOpts}`;
  }

  const { data: sessionData } = await supabase.auth.getSession();

  return {
    accessToken: sessionData.session?.access_token ?? '',
    profile: profile as Profile,
  };
}

export async function logout(): Promise<void> {
  try {
    if (isMock()) {
      const { mockLogout } = await import('@/lib/mocks/auth.mock');
      await mockLogout();
    } else {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('[auth] logout error:', error);
  }

  if (typeof document === 'undefined') return;

  // Clear ALL cookies — custom + supabase session cookies (always, even on error)
  document.cookie = 'bb-active-role=;path=/;max-age=0';
  document.cookie = 'bb-academy-id=;path=/;max-age=0';
  document.cookie = 'bb-token=;path=/;max-age=0';
  // Force-clear any Supabase auth cookies that might persist
  document.cookie.split(';').forEach((c) => {
    const name = c.trim().split('=')[0];
    if (name.startsWith('sb-') || name.startsWith('supabase-')) {
      document.cookie = `${name}=;path=/;max-age=0`;
    }
  });
}

export async function getMyProfiles(userId: string): Promise<Profile[]> {
  if (isMock()) {
    const { mockGetMyProfiles } = await import('@/lib/mocks/auth.mock');
    return mockGetMyProfiles(userId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('[auth] getMyProfiles failed:', error.message);
    return [];
  }

  return (profiles ?? []) as Profile[];
}

export async function forgotPassword(email: string): Promise<void> {
  if (isMock()) {
    const { mockForgotPassword } = await import('@/lib/mocks/auth.mock');
    return mockForgotPassword(email);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl('/redefinir-senha'),
  });
  if (error) {
    console.error('[auth] resetPasswordForEmail failed:', error.message);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
}

export async function resetPassword(_token: string, newPassword: string): Promise<void> {
  if (isMock()) {
    const { mockResetPassword } = await import('@/lib/mocks/auth.mock');
    return mockResetPassword(_token, newPassword);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error('[auth] updateUser password failed:', error.message);
    throw new Error(`Erro ao redefinir senha: ${error.message}`);
  }
}
