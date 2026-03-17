/**
 * Simple in-memory rate limiter for API routes.
 * Not suitable for distributed deployments — use Redis for production.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Check if a request is allowed under the rate limit.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically
  if (store.size > 10000) {
    for (const [key, val] of store) {
      if (val.resetAt < now) store.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  entry.count++;
  store.set(identifier, entry);

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit config presets.
 */
export const RATE_LIMITS = {
  auth: { maxRequests: 10, windowMs: 60 * 1000 } as RateLimitConfig,
  api: { maxRequests: 100, windowMs: 60 * 1000 } as RateLimitConfig,
  upload: { maxRequests: 20, windowMs: 60 * 1000 } as RateLimitConfig,
} as const;
