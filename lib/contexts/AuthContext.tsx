'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Profile } from '@/lib/types';
import { Role, ROLE_DASHBOARD } from '@/lib/types';
import { isMock } from '@/lib/env';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  decodeJWT,
} from '@/lib/security';
import * as authService from '@/lib/api/auth.service';
import { useRouter } from 'next/navigation';
import { identifyUser, resetAnalytics, trackEvent, AnalyticsEvents } from '@/lib/analytics/posthog';

interface AuthState {
  profile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<Profile[]>;
  logout: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  getDashboardUrl: (role: Role) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    profile: null,
    profiles: [],
    isLoading: true,
    isAuthenticated: false,
  });

  // Bootstrap: check existing session on mount
  useEffect(() => {
    async function bootstrap() {
      if (isMock()) {
        // Mock mode: use custom token store
        const token = getAccessToken();
        if (token && !isTokenExpired(token)) {
          const payload = decodeJWT(token);
          if (payload) {
            setState({
              profile: {
                id: payload.profile_id,
                user_id: payload.sub,
                role: payload.role as Role,
                display_name: payload.display_name,
                avatar: null,
                created_at: '',
                updated_at: '',
              },
              profiles: [],
              isLoading: false,
              isAuthenticated: true,
            });
            return;
          }
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Real Supabase mode
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id);

          const profileList = (profiles ?? []) as Profile[];

          // Check for stored active profile
          const activeRole = document.cookie
            .split('; ')
            .find((c) => c.startsWith('bb-active-role='))
            ?.split('=')[1];

          const activeProfile = activeRole
            ? profileList.find((p) => p.role === activeRole) ?? profileList[0] ?? null
            : profileList[0] ?? null;

          if (activeProfile) {
            identifyUser(activeProfile.id, {
              role: activeProfile.role,
              display_name: activeProfile.display_name,
            });
          }

          setState({
            profile: activeProfile,
            profiles: profileList,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      } catch {
        // Session expired or invalid
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    }

    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<Profile[]> => {
    const response = await authService.login({ email, password });

    if (isMock()) {
      setTokens(response.accessToken, response.refreshToken);
    }

    setState({
      profile: null,
      profiles: response.profiles,
      isLoading: false,
      isAuthenticated: true,
    });
    trackEvent(AnalyticsEvents.USER_LOGGED_IN, { email });

    return response.profiles;
  }, []);

  const selectProfile = useCallback(
    async (profileId: string) => {
      const response = await authService.selectProfile(profileId);

      if (isMock()) {
        const refreshTok = getRefreshToken();
        setTokens(response.accessToken, refreshTok ?? '');
      }

      setState((prev) => ({
        ...prev,
        profile: response.profile,
        isAuthenticated: true,
      }));
      identifyUser(response.profile.id, {
        role: response.profile.role,
        display_name: response.profile.display_name,
      });

      const dashboard = ROLE_DASHBOARD[response.profile.role] ?? '/dashboard';
      router.push(dashboard);
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    resetAnalytics();

    if (isMock()) {
      clearTokens();
    }

    setState({
      profile: null,
      profiles: [],
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/login');
  }, [router]);

  const refreshSession = useCallback(async () => {
    if (isMock()) {
      const refresh = getRefreshToken();
      if (!refresh) return;

      try {
        const response = await authService.refreshToken(refresh);
        setTokens(response.accessToken, refresh);
      } catch {
        await logout();
      }
      return;
    }

    // Real mode: Supabase handles token refresh automatically
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.refreshSession();
      if (error) await logout();
    } catch {
      await logout();
    }
  }, [logout]);

  const getDashboardUrl = useCallback((role: Role): string => {
    return ROLE_DASHBOARD[role] ?? '/dashboard';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        selectProfile,
        refreshSession,
        getDashboardUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
