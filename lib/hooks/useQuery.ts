import { useState, useEffect, useCallback, useRef } from 'react';
import { translateError } from '@/lib/utils/error-translator';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isRetrying: boolean;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { retryCount?: number; retryDelay?: number } = {}
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const maxRetries = options.retryCount ?? 1;
  const retryDelay = options.retryDelay ?? 2000;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (isRetry = false) => {
    if (!mountedRef.current) return;
    if (isRetry) setIsRetrying(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mountedRef.current) return;
      setData(result);
      retryCountRef.current = 0;
    } catch (err: unknown) {
      if (!mountedRef.current) return;

      // Auto-retry on network error
      if (retryCountRef.current < maxRetries && isNetworkError(err)) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) execute(true);
        }, retryDelay);
        return;
      }

      // Token expired -> try refresh via dynamic import
      if (isAuthError(err)) {
        try {
          const { createBrowserClient } = await import('@/lib/supabase/client');
          const supabase = createBrowserClient();
          await supabase.auth.refreshSession();
          // Retry after refresh
          const result = await fetcher();
          if (!mountedRef.current) return;
          setData(result);
          setError(null);
          return;
        } catch {
          if (!mountedRef.current) return;
          setError('Sua sessao expirou. Faca login novamente.');
          return;
        }
      }

      setError(translateError(err));
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    retryCountRef.current = 0;
    execute(true);
  }, [execute]);

  return { data, isLoading, error, retry, isRetrying };
}

function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true;
  if (err instanceof Error && err.message.includes('NetworkError')) return true;
  return false;
}

function isAuthError(err: unknown): boolean {
  if (err instanceof Error && (err.message.includes('401') || err.message.includes('JWT'))) return true;
  return false;
}
