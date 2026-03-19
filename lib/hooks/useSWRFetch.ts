import useSWR from 'swr';

/**
 * Generic hook replacing useState + useEffect + fetch.
 * Provides automatic caching, deduplication, and retry.
 */
export function useSWRFetch<T>(key: string | null, fetcher: () => Promise<T>) {
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    errorRetryCount: 2,
  });

  return { data: data ?? null, error, loading: isLoading, refresh: mutate };
}
