import { NextResponse } from 'next/server';

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number; nextCursor: string | null };
  links: { self: string; next: string | null };
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: { message, status } }, { status });
}

export function paginatedResponse<T>(data: T[], total: number, limit: number, path: string, nextCursor: string | null): NextResponse {
  const resp: PaginatedResponse<T> = {
    data,
    meta: { total, limit, nextCursor },
    links: { self: path, next: nextCursor ? `${path}?cursor=${nextCursor}&limit=${limit}` : null },
  };
  return NextResponse.json(resp);
}

/** Simple in-memory rate limiter per API key */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(apiKey: string, limit = 100): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(apiKey);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(apiKey, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
