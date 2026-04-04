'use client';

import { useEffect } from 'react';
import { isNative } from '@/lib/platform';

function getRemoteOrigin(): string | null {
  const candidate = process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!candidate) return null;
  return candidate.replace(/\/$/, '');
}

function resolveInput(input: RequestInfo | URL, origin: string): RequestInfo | URL {
  if (typeof input === 'string') {
    return input.startsWith('/api/') ? `${origin}${input}` : input;
  }

  if (input instanceof URL) {
    if (input.pathname.startsWith('/api/')) {
      return new URL(`${origin}${input.pathname}${input.search}${input.hash}`);
    }
    return input;
  }

  if (input instanceof Request && input.url.startsWith('/') && input.url.startsWith('/api/')) {
    return new Request(`${origin}${input.url}`, input);
  }

  if (input instanceof Request) {
    try {
      const requestUrl = new URL(input.url);
      if (requestUrl.pathname.startsWith('/api/')) {
        return new Request(`${origin}${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`, input);
      }
    } catch {
      return input;
    }
  }

  return input;
}

export function NativeApiRuntime() {
  useEffect(() => {
    if (!isNative()) return;

    const origin = getRemoteOrigin();
    if (!origin || typeof window === 'undefined' || (window as Window & { __bbNativeFetchPatched?: boolean }).__bbNativeFetchPatched) {
      return;
    }

    const originalFetch = window.fetch.bind(window);
    const state = window as Window & {
      __bbNativeFetchPatched?: boolean;
      __bbOriginalFetch?: typeof window.fetch;
    };

    state.__bbNativeFetchPatched = true;
    state.__bbOriginalFetch = originalFetch;

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      return originalFetch(resolveInput(input, origin), init);
    }) as typeof window.fetch;

    return () => {
      if (state.__bbOriginalFetch) {
        window.fetch = state.__bbOriginalFetch;
      }
      state.__bbNativeFetchPatched = false;
      delete state.__bbOriginalFetch;
    };
  }, []);

  return null;
}
