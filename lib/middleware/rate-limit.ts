// BlackBelt v2 — In-memory rate limiting middleware
// Uses a sliding-window counter per IP address.
// Designed for Next.js API routes and server actions.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** In-memory store keyed by `bucket:ip` */
const store = new Map<string, RateLimitEntry>();

/** Evict expired entries every 60 seconds to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks whether a request from the given IP is allowed under the specified
 * rate limit configuration.
 *
 * @param ip - Client IP address (use request headers / forwarded-for)
 * @param bucket - Logical bucket name to isolate limits (e.g. "login", "register", "public")
 * @param config - Rate limit configuration
 * @returns Result indicating whether the request is allowed
 */
export function checkRateLimit(
  ip: string,
  bucket: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanup();

  const windowMs = config.windowMs ?? 60_000;
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  // No existing entry or window expired — allow and start fresh
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Within window
  entry.count += 1;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return { allowed, remaining, resetAt: entry.resetAt };
}

// ── Pre-configured limiters ──────────────────────────────────────────

/** Public API routes: 100 requests per minute per IP */
export const PUBLIC_API_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60_000,
};

/** Login endpoint: 10 requests per minute per IP (anti-brute-force) */
export const LOGIN_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
};

/** Registration endpoint: 5 requests per minute per IP */
export const REGISTER_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000,
};

/**
 * Extracts the client IP from a Next.js Request.
 * Falls back to '127.0.0.1' when running locally.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain a comma-separated list; take the first
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

/**
 * Helper that checks rate limit and returns a 429 Response if exceeded.
 * Returns `null` if the request is allowed.
 *
 * Usage in a Next.js API route:
 * ```ts
 * const blocked = applyRateLimit(request, 'login', LOGIN_LIMIT);
 * if (blocked) return blocked;
 * ```
 */
export function applyRateLimit(
  request: Request,
  bucket: string,
  config: RateLimitConfig,
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, bucket, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      },
    );
  }

  return null;
}
