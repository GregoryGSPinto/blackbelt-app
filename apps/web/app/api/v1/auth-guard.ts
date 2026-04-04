import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse } from './helpers';

export interface AuthContext {
  userId: string;
  academyId: string;
  role: string;
  profileId: string;
}

type AuthResult = { auth: AuthContext } | { error: NextResponse };

/**
 * Authenticates an API request using either:
 * 1. Supabase JWT (via cookies) — for browser/app clients
 * 2. API Key + X-Academy-Id header — for external SDK clients
 *
 * Returns `{ auth }` on success or `{ error }` on failure.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Try Supabase JWT auth first (browser/app clients)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // API routes don't set cookies
        },
        remove() {
          // API routes don't remove cookies
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = getAdminClient();
      const activeAcademyId = request.cookies.get('bb-academy-id')?.value ?? null;
      const activeRole = request.cookies.get('bb-active-role')?.value ?? null;

      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('user_id', user.id);

      const profileIds = (profiles ?? []).map((profile) => profile.id);
      if (profileIds.length === 0) {
        return { error: errorResponse('Authenticated user does not have any profiles.', 403) };
      }

      let membershipQuery = admin
        .from('memberships')
        .select('academy_id, role, profile_id, created_at')
        .eq('status', 'active')
        .in('profile_id', profileIds);

      if (activeAcademyId) {
        membershipQuery = membershipQuery.eq('academy_id', activeAcademyId);
      }

      const { data: memberships } = await membershipQuery
        .order('created_at', { ascending: false })
        .limit(10);

      const membership = (memberships ?? []).find((item) => !activeRole || item.role === activeRole)
        ?? memberships?.[0];

      if (membership) {
        return {
          auth: {
            userId: user.id,
            academyId: membership.academy_id,
            role: membership.role,
            profileId: membership.profile_id,
          },
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .limit(1);

      if (profile?.[0]) {
        return {
          auth: {
            userId: user.id,
            academyId: activeAcademyId ?? '',
            role: 'superadmin',
            profileId: profile[0].id,
          },
        };
      }
    }
  }

  // Fallback: API Key + X-Academy-Id header (SDK clients)
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return { error: errorResponse('Authentication required. Provide Supabase JWT or X-API-Key header.', 401) };
  }

  const academyId = request.headers.get('X-Academy-Id');
  if (!academyId) {
    return { error: errorResponse('X-Academy-Id header is required when using API key authentication.', 400) };
  }

  // Validate API key against stored keys
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: { get() { return undefined; }, set() {}, remove() {} },
  });
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, academy_id, role, profile_id, revoked_at')
    .eq('key_hash', apiKey)
    .eq('academy_id', academyId)
    .is('revoked_at', null)
    .single();

  if (!keyRecord) {
    return { error: errorResponse('Invalid API key or academy mismatch.', 401) };
  }

  return {
    auth: {
      userId: keyRecord.id,
      academyId: keyRecord.academy_id,
      role: keyRecord.role ?? 'viewer',
      profileId: keyRecord.profile_id ?? keyRecord.id,
    },
  };
}
