'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Profile } from '@/lib/types';
import { Role, ROLE_DASHBOARD } from '@/lib/types';
import type { OAuthProvider } from '@/lib/api/auth.service';
import { isMock } from '@/lib/env';
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  decodeJWT,
} from '@/lib/security';
import * as authService from '@/lib/api/auth.service';
import { useRouter } from 'next/navigation';
import { identifyUser, trackEvent, AnalyticsEvents, disableAnalyticsForKids, enableAnalytics } from '@/lib/analytics/posthog';

interface AuthState {
  profile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<Profile[]>;
  loginWithOAuth: (provider: OAuthProvider, inviteToken?: string) => Promise<Profile[]>;
  logout: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  getDashboardUrl: (role: Role) => string;
  /** True when the profile changed via selectProfile (user switch), not initial login */
  isProfileSwitch: boolean;
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
  const profileSwitchRef = useRef(false);

  // On mount, check if we're returning from profile selection (survives full page reload)
  useEffect(() => {
    if (sessionStorage.getItem('bb_profile_switch') === '1') {
      profileSwitchRef.current = true;
      sessionStorage.removeItem('bb_profile_switch');
    }
  }, []);

  // Timeout safety — never stay loading for more than 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState((prev) => {
        if (prev.isLoading) {
          console.warn('[Auth] Timeout 5s — forçando isLoading=false');
          return { ...prev, isLoading: false };
        }
        return prev;
      });
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Bootstrap: check existing session on mount
  useEffect(() => {
    async function bootstrap() {
      if (isMock()) {
        // Mock mode: use custom token store
        const token = getAccessToken();
        if (token && !isTokenExpired(token)) {
          const payload = decodeJWT(token);
          if (payload) {
            const currentProfile: Profile = {
              id: payload.profile_id,
              user_id: payload.sub,
              role: payload.role as Role,
              display_name: payload.display_name,
              avatar: null,
              created_at: '',
              updated_at: '',
            };

            // Load all profiles for profile switcher
            let allProfiles: Profile[] = [currentProfile];
            try {
              const loaded = await authService.getMyProfiles(payload.sub);
              if (loaded.length > 0) allProfiles = loaded;
            } catch (err) {
              console.error('[AuthContext] bootstrap getMyProfiles error:', err);
            }

            setState({
              profile: currentProfile,
              profiles: allProfiles,
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

          // COPPA/LGPD: disable analytics for kids profiles
          if (activeProfile?.role === Role.AlunoKids) {
            disableAnalyticsForKids();
          } else {
            enableAnalytics();
            if (activeProfile) {
              identifyUser(activeProfile.id, {
                role: activeProfile.role,
                display_name: activeProfile.display_name,
              });
            }
          }

          setState({
            profile: activeProfile,
            profiles: profileList,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      } catch (err) {
        console.error('[AuthContext] bootstrap session error:', err);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    }

    bootstrap();
  }, []);

  // Listen for Supabase auth state changes (e.g. OAuth redirect back)
  useEffect(() => {
    if (isMock()) return;

    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data } = supabase.auth.onAuthStateChange(async (event: string, session: { user: { id: string } } | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id);

          const profileList = (profiles ?? []) as Profile[];

          if (profileList.length > 0) {
            const activeProfile = profileList[0];

            // COPPA/LGPD: disable analytics for kids profiles
            if (activeProfile.role === Role.AlunoKids) {
              disableAnalyticsForKids();
            } else {
              enableAnalytics();
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
          }
        }

        if (event === 'SIGNED_OUT') {
          setState({
            profile: null,
            profiles: [],
            isLoading: false,
            isAuthenticated: false,
          });
        }
      });

      subscription = data.subscription;
    })();

    return () => {
      subscription?.unsubscribe();
    };
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

  const loginWithOAuth = useCallback(async (provider: OAuthProvider, inviteToken?: string): Promise<Profile[]> => {
    const response = await authService.loginWithOAuth(provider, { inviteToken });

    // In real mode, browser redirects to OAuth provider — we never reach here.
    // In mock mode, we get a response back.
    if (response) {
      if (isMock()) {
        setTokens(response.accessToken, response.refreshToken);
      }

      setState({
        profile: null,
        profiles: response.profiles,
        isLoading: false,
        isAuthenticated: true,
      });
      trackEvent(AnalyticsEvents.USER_LOGGED_IN, { provider });

      return response.profiles;
    }

    return [];
  }, []);

  const selectProfile = useCallback(
    async (profileId: string) => {
      profileSwitchRef.current = true;
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

      // COPPA/LGPD: disable analytics for kids profiles
      if (response.profile.role === Role.AlunoKids) {
        disableAnalyticsForKids();
      } else {
        enableAnalytics();
        identifyUser(response.profile.id, {
          role: response.profile.role,
          display_name: response.profile.display_name,
        });
      }

      const dashboard = ROLE_DASHBOARD[response.profile.role] ?? '/dashboard';
      router.push(dashboard);
    },
    [router],
  );

  const logout = useCallback(async () => {
    // Use performLogout for nuclear cleanup (cookies, storage, state, hard redirect)
    const { performLogout } = await import('@/lib/auth/logout');
    await performLogout();
    // performLogout does window.location.href = '/login' — code below won't execute
  }, []);

  const refreshSession = useCallback(async () => {
    if (isMock()) {
      const refresh = getRefreshToken();
      if (!refresh) return;

      try {
        const response = await authService.refreshToken(refresh);
        setTokens(response.accessToken, refresh);
      } catch (err) {
        console.error('[AuthContext] mock refreshSession error:', err);
        await logout();
      }
      return;
    }

    // Real mode: Supabase handles token refresh automatically
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[AuthContext] refreshSession failed:', error.message);
        await logout();
      }
    } catch (err) {
      console.error('[AuthContext] refreshSession error:', err);
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
        loginWithOAuth,
        logout,
        selectProfile,
        refreshSession,
        getDashboardUrl,
        isProfileSwitch: profileSwitchRef.current,
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
