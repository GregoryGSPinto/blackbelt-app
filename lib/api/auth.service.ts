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
      return mockSelectProfile(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    if (error) throw new ServiceError(404, 'auth.selectProfile', error.message);

    // Store selected role in cookie for middleware
    document.cookie = `bb-active-role=${profile.role};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;

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
      return mockLogout();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase.auth.signOut();

    // Clear role cookie
    document.cookie = 'bb-active-role=;path=/;max-age=0';
  } catch (error) {
    handleServiceError(error, 'auth.logout');
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
