// ═══════════════════════════════════════════════════════
// Fetch Interceptor — Captures API calls + timing
// ═══════════════════════════════════════════════════════

export interface APICallRecord {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  page: string;
  isError: boolean;
  message?: string;
}

type APICallCallback = (record: APICallRecord) => void;

const IGNORED_PATTERNS = [
  '/api/telemetry',
  '/_next/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.svg',
  '.woff',
  '.ico',
  'fonts.googleapis',
  'cdn.',
];

function shouldIntercept(url: string): boolean {
  return !IGNORED_PATTERNS.some((p) => url.includes(p));
}

export function installFetchInterceptor(onCall: APICallCallback): () => void {
  if (typeof window === 'undefined') return () => {};

  const originalFetch = window.fetch;

  window.fetch = async function interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';

    if (!shouldIntercept(url)) {
      return originalFetch.call(window, input, init);
    }

    const start = performance.now();
    const page = window.location.pathname;

    try {
      const response = await originalFetch.call(window, input, init);
      const duration = Math.round(performance.now() - start);
      const isError = response.status >= 400 || duration > 3000;

      if (isError) {
        onCall({
          url,
          method: method.toUpperCase(),
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
          page,
          isError: true,
          message: response.status >= 400 ? `HTTP ${response.status}` : `Slow (${duration}ms)`,
        });
      }

      return response;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      onCall({
        url,
        method: method.toUpperCase(),
        status: 0,
        duration,
        timestamp: new Date().toISOString(),
        page,
        isError: true,
        message: err instanceof Error ? err.message : 'Network error',
      });
      throw err;
    }
  };

  return () => {
    window.fetch = originalFetch;
  };
}
