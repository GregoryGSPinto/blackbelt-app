import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Profile } from '@/lib/types';

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

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
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
    if (error) throw new ServiceError(401, 'auth.login', error.message);

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id);
    if (profileError) throw new ServiceError(500, 'auth.login', profileError.message);

    return {
      accessToken: authData.session?.access_token ?? '',
      refreshToken: authData.session?.refresh_token ?? '',
      profiles: (profiles ?? []) as Profile[],
    };
  } catch (error) {
    handleServiceError(error, 'auth.login');
  }
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
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
    if (error) throw new ServiceError(400, 'auth.register', error.message);
    if (!authData.user) throw new ServiceError(500, 'auth.register', 'User not created');

    // The DB trigger auto-creates a profile; fetch it
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .limit(1);
    if (profileError) throw new ServiceError(500, 'auth.register', profileError.message);

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
  } catch (error) {
    handleServiceError(error, 'auth.register');
  }
}

export async function loginWithOAuth(
  provider: OAuthProvider,
  options?: { inviteToken?: string },
): Promise<LoginResponse | void> {
  try {
    if (isMock()) {
      const { mockLoginWithOAuth } = await import('@/lib/mocks/auth.mock');
      return mockLoginWithOAuth(provider);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let redirectTo = `${window.location.origin}/auth/callback`;
    if (options?.inviteToken) {
      redirectTo += `?invite_token=${encodeURIComponent(options.inviteToken)}`;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) throw new ServiceError(400, 'auth.oauth', error.message);
    // In real mode, browser redirects away — no return value
  } catch (error) {
    handleServiceError(error, 'auth.oauth');
  }
}

export async function refreshToken(_token: string): Promise<RefreshResponse> {
  try {
    if (isMock()) {
      const { mockRefreshToken } = await import('@/lib/mocks/auth.mock');
      return mockRefreshToken(_token);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new ServiceError(401, 'auth.refresh', error.message);

    return { accessToken: data.session?.access_token ?? '' };
  } catch (error) {
    handleServiceError(error, 'auth.refresh');
  }
}

export async function selectProfile(profileId: string): Promise<SelectProfileResponse> {
  try {
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
    if (error) throw new ServiceError(404, 'auth.selectProfile', error.message);

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
  } catch (error) {
    handleServiceError(error, 'auth.selectProfile');
  }
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

    // Clear ALL cookies — custom + supabase session cookies
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
  } catch (error) {
    handleServiceError(error, 'auth.logout');
  }
}

export async function getMyProfiles(userId: string): Promise<Profile[]> {
  try {
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
    if (error) throw new ServiceError(500, 'auth.getMyProfiles', error.message);

    return (profiles ?? []) as Profile[];
  } catch (error) {
    handleServiceError(error, 'auth.getMyProfiles');
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockForgotPassword } = await import('@/lib/mocks/auth.mock');
      return mockForgotPassword(email);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new ServiceError(400, 'auth.forgotPassword', error.message);
  } catch (error) {
    handleServiceError(error, 'auth.forgotPassword');
  }
}

export async function resetPassword(_token: string, newPassword: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResetPassword } = await import('@/lib/mocks/auth.mock');
      return mockResetPassword(_token, newPassword);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new ServiceError(400, 'auth.resetPassword', error.message);
  } catch (error) {
    handleServiceError(error, 'auth.resetPassword');
  }
}
