// BlackBelt v2 — Supabase Server Client
// Used in API routes and Server Components when NEXT_PUBLIC_USE_MOCK=false.

import { createServerClient as createServer } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[Supabase Server] Missing SUPABASE_URL or ANON_KEY');
  }

  const cookieStore = await cookies();

  return createServer(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // read-only in some contexts (e.g. Server Components)
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // read-only in some contexts
        }
      },
    },
  });
}

/** Service-role client for admin operations (seed, migrations, etc.) */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('[Supabase Service] Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  }

  // Service-role clients don't need cookies
  return createServer(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}
