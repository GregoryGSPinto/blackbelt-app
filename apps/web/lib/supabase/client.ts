// BlackBelt v2 — Supabase Client
// These functions are only called when NEXT_PUBLIC_USE_MOCK=false.

import { createBrowserClient as createBrowser } from '@supabase/ssr';

type SupabaseClient = ReturnType<typeof createBrowser>;

let browserClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createBrowser(url, key);

  return browserClient;
}
