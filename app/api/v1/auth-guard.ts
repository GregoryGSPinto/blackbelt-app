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

  // In production, validate the API key against a stored keys table.
  // For now, accept any API key but require academy context.
  return {
    auth: {
      userId: 'api-key-user',
      academyId,
      role: 'admin',
      profileId: 'api-key-profile',
    },
  };
}
