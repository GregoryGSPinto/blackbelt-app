'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

interface UseServiceDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  staleTime?: number; // ms, default 5min
  enabled?: boolean;
}

interface UseServiceDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
  refetch: () => Promise<void>;
}

export function useServiceData<T>({
  key,
  fetcher,
  staleTime = 5 * 60 * 1000,
  enabled = true,
}: UseServiceDataOptions<T>): UseServiceDataResult<T> {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    return cached ? cached.data : null;
  });
  const [isLoading, setIsLoading] = useState(!cache.has(key));
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached) {
      setData(cached.data);
      const age = Date.now() - cached.timestamp;
      if (age > staleTime) {
        setIsStale(true);
        fetchData();
      } else {
        setIsLoading(false);
        setIsStale(false);
      }
    } else {
      fetchData();
    }
  }, [key, staleTime, enabled, fetchData]);

  const mutate = useCallback(
    (newData: T | ((prev: T | null) => T)) => {
      const resolved = typeof newData === 'function'
        ? (newData as (prev: T | null) => T)(data)
        : newData;
      setData(resolved);
      cache.set(key, { data: resolved, timestamp: Date.now() });
    },
    [key, data],
  );

  return { data, isLoading, error, isStale, mutate, refetch: fetchData };
}
