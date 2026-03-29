import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
      const { data: membership } = await supabase
        .from('memberships')
        .select('academy_id, role, profile_id')
        .eq('status', 'active')
        .limit(1)
        .single();

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
