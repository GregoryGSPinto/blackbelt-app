// BlackBelt v2 — Supabase Client
// These functions are only called when NEXT_PUBLIC_USE_MOCK=false.

import { createBrowserClient as createBrowser, createServerClient as createServer } from '@supabase/ssr';

type SupabaseClient = ReturnType<typeof createBrowser>;

let browserClient: SupabaseClient | null = null;

function validateSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[Supabase] Missing URL or ANON_KEY — running in degraded mode');
    return false;
  }

  if (key.startsWith('sb_')) {
    console.info('[Supabase] Using new API key format');
  } else if (key.startsWith('eyJ')) {
    console.info('[Supabase] Using legacy JWT key format');
  } else {
    console.warn('[Supabase] Unknown key format — may cause issues');
  }

  return true;
}

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  validateSupabaseConfig();

  browserClient = createBrowser(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}

export function createServerClient(cookieStore: {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options: Record<string, unknown>) => void;
  remove: (name: string, options: Record<string, unknown>) => void;
}) {
  return createServer(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.remove(name, options);
        },
      },
    }
  );
}
