// ── Performance Utilities (P-090) ─────────────────────────────

import { logger } from '@/lib/monitoring/logger';

/**
 * Parallel data fetcher — wraps Promise.all with error isolation.
 * Each promise resolves independently; failures don't block others.
 */
export async function parallelFetch<T extends Record<string, Promise<unknown>>>(
  fetchers: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> | null }> {
  const keys = Object.keys(fetchers) as (keyof T)[];
  const promises = keys.map((k) =>
    fetchers[k].catch((err) => {
      logger.warn(`[parallelFetch] Failed: ${String(k)}`, err);
      return null;
    }),
  );

  const results = await Promise.all(promises);
  const out = {} as { [K in keyof T]: Awaited<T[K]> | null };
  keys.forEach((k, i) => {
    out[k] = results[i] as Awaited<T[typeof k]> | null;
  });
  return out;
}

/**
 * Debounce function for search inputs, filters, etc.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle function — limits execution rate.
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= ms) {
      lastRun = now;
      fn(...args);
    }
  };
}

/**
 * Preload a route — triggers Next.js prefetch.
 */
export function preloadRoute(path: string): void {
  if (typeof window === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

/**
 * Measure render time for a component or operation.
 */
export function measurePerformance(label: string): { end: () => number } {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`[Perf] ${label}: ${duration.toFixed(1)}ms`);
      }
      return duration;
    },
  };
}
