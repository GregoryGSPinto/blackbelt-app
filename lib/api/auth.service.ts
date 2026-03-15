import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Profile, User } from '@/lib/types';

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
  user: User;
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.login');
    return res.json();
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
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.register');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'auth.register');
  }
}

export async function refreshToken(token: string): Promise<RefreshResponse> {
  try {
    if (isMock()) {
      const { mockRefreshToken } = await import('@/lib/mocks/auth.mock');
      return mockRefreshToken(token);
    }
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.refresh');
    return res.json();
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
    const res = await fetch('/api/auth/select-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.selectProfile');
    return res.json();
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
    await fetch('/api/auth/logout', { method: 'POST' });
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
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.forgotPassword');
  } catch (error) {
    handleServiceError(error, 'auth.forgotPassword');
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResetPassword } = await import('@/lib/mocks/auth.mock');
      return mockResetPassword(token, newPassword);
    }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'auth.resetPassword');
  } catch (error) {
    handleServiceError(error, 'auth.resetPassword');
  }
}
