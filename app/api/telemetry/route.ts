import { NextRequest, NextResponse } from 'next/server';

// ── Types ─────────────────────────────────────────────────────────────────

interface TelemetryEvent {
  name: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean | null>;
}

interface TelemetryPayload {
  session_id: string;
  user_id?: string;
  profile_id?: string;
  academy_id?: string;
  role?: string;
  device: {
    platform: string;
    os: string;
    browser: string;
    screen_width: number;
    screen_height: number;
    language: string;
    timezone: string;
  };
  events: TelemetryEvent[];
  page_url: string;
  referrer?: string;
  sdk_version: string;
}

// ── Simple in-memory rate limiter ─────────────────────────────────────────

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_PAYLOAD_BYTES = 50 * 1024; // 50KB

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateLimitMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// Periodic cleanup to prevent memory leaks (every 5 minutes)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60_000;

function cleanupRateLimitMap(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recent);
    }
  }
}

// ── POST handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Periodic cleanup
  cleanupRateLimitMap();

  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? '127.0.0.1';

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfterMs: RATE_WINDOW_MS },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) } },
    );
  }

  // Payload size check via Content-Length header
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large', maxBytes: MAX_PAYLOAD_BYTES },
      { status: 413 },
    );
  }

  // Read body and check actual size
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (new TextEncoder().encode(rawBody).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large', maxBytes: MAX_PAYLOAD_BYTES },
      { status: 413 },
    );
  }

  // Parse JSON
  let payload: TelemetryPayload;
  try {
    payload = JSON.parse(rawBody) as TelemetryPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Basic validation
  if (!payload.session_id || !payload.device || !Array.isArray(payload.events)) {
    return NextResponse.json(
      { error: 'Missing required fields: session_id, device, events' },
      { status: 400 },
    );
  }

  if (payload.events.length === 0) {
    return NextResponse.json(
      { error: 'Events array must not be empty' },
      { status: 400 },
    );
  }

  // Mock mode — skip processing
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  if (isMock) {
    return NextResponse.json({ ok: true, mock: true, eventsReceived: payload.events.length });
  }

  // Real mode — insert into Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Telemetry service not configured' },
      { status: 503 },
    );
  }

  try {
    // Upsert session
    const sessionRow = {
      id: payload.session_id,
      user_id: payload.user_id ?? null,
      profile_id: payload.profile_id ?? null,
      academy_id: payload.academy_id ?? null,
      role: payload.role ?? null,
      platform: payload.device.platform,
      os: payload.device.os,
      browser: payload.device.browser,
      screen_width: payload.device.screen_width,
      screen_height: payload.device.screen_height,
      language: payload.device.language,
      timezone: payload.device.timezone,
      page_url: payload.page_url,
      referrer: payload.referrer ?? null,
      sdk_version: payload.sdk_version,
      ip_address: ip,
      last_seen_at: new Date().toISOString(),
    };

    const sessionRes = await fetch(
      `${supabaseUrl}/rest/v1/telemetry_sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(sessionRow),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error('[telemetry] Session upsert failed:', sessionRes.status, errText);
      return NextResponse.json(
        { error: 'Failed to store session' },
        { status: 502 },
      );
    }

    // Insert events
    const eventRows = payload.events.map((event) => ({
      session_id: payload.session_id,
      user_id: payload.user_id ?? null,
      profile_id: payload.profile_id ?? null,
      academy_id: payload.academy_id ?? null,
      event_name: event.name,
      event_timestamp: event.timestamp,
      properties: event.properties ?? {},
      page_url: payload.page_url,
      ip_address: ip,
    }));

    const eventsRes = await fetch(
      `${supabaseUrl}/rest/v1/telemetry_events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(eventRows),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!eventsRes.ok) {
      const errText = await eventsRes.text();
      console.error('[telemetry] Events insert failed:', eventsRes.status, errText);
      return NextResponse.json(
        { error: 'Failed to store events' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      eventsReceived: payload.events.length,
    });
  } catch (err) {
    console.error('[telemetry] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
