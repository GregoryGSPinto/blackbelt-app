import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

type IncomingEvent = {
  name: string;
  routePath: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

type IncomingPayload = {
  sessionKey: string;
  userId?: string | null;
  profileId?: string | null;
  academyId?: string | null;
  role?: string | null;
  origin?: 'web' | 'ios' | 'android' | 'api' | 'system' | 'worker' | 'seed';
  appVersion?: string;
  releaseVersion?: string;
  locale?: string;
  timezone?: string;
  startedAt?: string;
  lastActivityAt?: string;
  durationSeconds?: number;
  totalPageViews?: number;
  totalActions?: number;
  currentRoute?: string;
  pagesVisited?: string[];
  device?: {
    deviceType?: 'desktop' | 'tablet' | 'mobile' | 'tv' | 'bot' | 'unknown';
    deviceModel?: string;
    deviceVendor?: string;
    osName?: string;
    osVersion?: string;
    browserName?: string;
    browserVersion?: string;
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    pixelRatio?: number;
    connectionType?: string;
    effectiveType?: string;
  };
  events?: IncomingEvent[];
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 24;
const MAX_PAYLOAD_BYTES = 128 * 1024;
const requestMap = new Map<string, number[]>();

function cleanupRateLimit(ip: string) {
  const now = Date.now();
  const recent = (requestMap.get(ip) ?? []).filter((value) => now - value < RATE_LIMIT_WINDOW_MS);
  requestMap.set(ip, recent);
  return recent;
}

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
}

function layoutRiskScore(device: IncomingPayload['device']): { score: number; reason: string | null } {
  const width = device?.viewportWidth ?? 0;
  const height = device?.viewportHeight ?? 0;
  if (!width || !height) return { score: 0, reason: null };
  if (width >= 1920 && (device?.deviceType === 'tv' || height >= 1080)) {
    return { score: 78, reason: 'Viewport muito amplo; validar layouts de TV e dashboards fullscreen.' };
  }
  if (width >= 1024 && height < 680) {
    return { score: 62, reason: 'Pouca altura útil para desktop/tablet landscape.' };
  }
  if (width < 360) {
    return { score: 72, reason: 'Viewport estreito com alto risco de quebra visual.' };
  }
  return { score: 18, reason: null };
}

function toErrorType(eventName: string, metadata: Record<string, unknown>): string {
  if (eventName === 'auth_failure') return 'auth_failure';
  if (eventName === 'timeout') return 'timeout';
  if (eventName === 'js_error') return 'js_error';
  const status = Number(metadata.status ?? 0);
  if (status >= 500) return 'api_failure';
  if (status >= 400) return 'request_failure';
  return eventName;
}

function performanceRowsFromEvents(payload: IncomingPayload) {
  const grouped = new Map<string, Record<string, unknown>>();

  for (const event of payload.events ?? []) {
    if (event.name !== 'performance_metric') continue;
    const routePath = event.routePath || payload.currentRoute || '/';
    const key = `${routePath}:${payload.releaseVersion ?? 'unknown'}`;
    const current = grouped.get(key) ?? {};
    grouped.set(key, { ...current, ...(event.metadata ?? {}), routePath, timestamp: event.timestamp });
  }

  return Array.from(grouped.values()).map((row) => ({
    session_key: payload.sessionKey,
    academy_id: payload.academyId ?? null,
    user_id: payload.userId ?? null,
    profile_id: payload.profileId ?? null,
    origin: payload.origin ?? 'web',
    route_path: String(row.routePath ?? payload.currentRoute ?? '/'),
    screen_name: String(row.routePath ?? payload.currentRoute ?? '/'),
    device_type: payload.device?.deviceType ?? 'unknown',
    viewport_width: payload.device?.viewportWidth ?? null,
    viewport_height: payload.device?.viewportHeight ?? null,
    app_version: payload.appVersion ?? null,
    release_version: payload.releaseVersion ?? null,
    load_time_ms: Number(row.durationMs ?? row.loadTimeMs ?? 0) || null,
    ttfb_ms: Number(row.ttfb ?? 0) || null,
    fcp_ms: Number(row.fcp ?? 0) || null,
    lcp_ms: Number(row.lcp ?? 0) || null,
    cls: Number(row.cls ?? 0) || null,
    fid_ms: Number(row.fid ?? 0) || null,
    inp_ms: Number(row.inp ?? 0) || null,
    api_latency_ms: Number(row.durationMs ?? row.apiLatencyMs ?? 0) || null,
    render_duration_ms: Number(row.durationMs ?? 0) || null,
    recorded_at: String(row.timestamp ?? new Date().toISOString()),
    metadata: row,
  }));
}

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  const recent = cleanupRateLimit(ip);
  if (recent.length >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: 'Too many telemetry requests' }, { status: 429 });
  }
  requestMap.set(ip, [...recent, Date.now()]);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let payload: IncomingPayload;
  try {
    payload = JSON.parse(rawBody) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.sessionKey || !payload.device || !Array.isArray(payload.events) || payload.events.length === 0) {
    return NextResponse.json({ error: 'Missing required telemetry fields' }, { status: 400 });
  }

  const admin = getAdminClient();
  const nowIso = new Date().toISOString();
  const deviceRisk = layoutRiskScore(payload.device);
  const startedAt = payload.startedAt ?? nowIso;
  const lastActivityAt = payload.lastActivityAt ?? nowIso;

  try {
    await admin
      .from('app_telemetry_sessions')
      .upsert({
        session_key: payload.sessionKey,
        academy_id: payload.academyId ?? null,
        user_id: payload.userId ?? null,
        profile_id: payload.profileId ?? null,
        origin: payload.origin ?? 'web',
        device_type: payload.device.deviceType ?? 'unknown',
        device_model: payload.device.deviceModel ?? null,
        device_vendor: payload.device.deviceVendor ?? null,
        os_name: payload.device.osName ?? null,
        os_version: payload.device.osVersion ?? null,
        browser_name: payload.device.browserName ?? null,
        browser_version: payload.device.browserVersion ?? null,
        screen_width: payload.device.screenWidth ?? null,
        screen_height: payload.device.screenHeight ?? null,
        viewport_width: payload.device.viewportWidth ?? null,
        viewport_height: payload.device.viewportHeight ?? null,
        pixel_ratio: payload.device.pixelRatio ?? null,
        connection_effective_type: payload.device.effectiveType ?? payload.device.connectionType ?? null,
        locale: payload.locale ?? null,
        timezone: payload.timezone ?? null,
        app_version: payload.appVersion ?? null,
        release_version: payload.releaseVersion ?? null,
        current_route: payload.currentRoute ?? null,
        started_at: startedAt,
        last_seen_at: lastActivityAt,
        duration_seconds: payload.durationSeconds ?? 0,
        pages_viewed: payload.totalPageViews ?? payload.pagesVisited?.length ?? 0,
        total_events: payload.events.length,
        is_active: true,
        metadata: {
          role: payload.role ?? null,
          ip,
          pagesVisited: payload.pagesVisited ?? [],
          totalActions: payload.totalActions ?? 0,
        },
        updated_at: nowIso,
      }, { onConflict: 'session_key' });

    const eventRows = payload.events.map((event) => ({
      session_key: payload.sessionKey,
      academy_id: payload.academyId ?? null,
      user_id: payload.userId ?? null,
      profile_id: payload.profileId ?? null,
      origin: payload.origin ?? 'web',
      event_name: event.name,
      route_path: event.routePath ?? payload.currentRoute ?? '/',
      screen_name: event.routePath ?? payload.currentRoute ?? '/',
      device_type: payload.device?.deviceType ?? 'unknown',
      viewport_width: payload.device?.viewportWidth ?? null,
      viewport_height: payload.device?.viewportHeight ?? null,
      app_version: payload.appVersion ?? null,
      release_version: payload.releaseVersion ?? null,
      duration_ms: event.durationMs ?? null,
      metadata: {
        ...(event.metadata ?? {}),
        role: payload.role ?? null,
      },
      happened_at: event.timestamp,
    }));

    const errorRows = payload.events
      .filter((event) => ['js_error', 'api_error', 'auth_failure', 'timeout'].includes(event.name))
      .map((event) => ({
        session_key: payload.sessionKey,
        academy_id: payload.academyId ?? null,
        user_id: payload.userId ?? null,
        profile_id: payload.profileId ?? null,
        origin: payload.origin ?? 'web',
        severity: event.severity === 'info' ? 'medium' : event.severity,
        error_type: toErrorType(event.name, event.metadata ?? {}),
        error_code: event.name,
        message: String(event.metadata?.message ?? event.name),
        route_path: event.routePath ?? payload.currentRoute ?? '/',
        device_type: payload.device?.deviceType ?? 'unknown',
        viewport_width: payload.device?.viewportWidth ?? null,
        viewport_height: payload.device?.viewportHeight ?? null,
        os_name: payload.device?.osName ?? null,
        browser_name: payload.device?.browserName ?? null,
        app_version: payload.appVersion ?? null,
        release_version: payload.releaseVersion ?? null,
        occurred_at: event.timestamp,
        fingerprint: `${event.name}:${event.routePath ?? '/'}:${String(event.metadata?.message ?? '')}`.slice(0, 255),
        metadata: event.metadata ?? {},
      }));

    const performanceRows = performanceRowsFromEvents(payload);
    const shouldInsertDeviceSnapshot = payload.events.some((event) =>
      ['route_visited', 'screen_viewed', 'screen_left', 'performance_metric'].includes(event.name),
    );

    await admin.from('app_telemetry_events').insert(eventRows);
    if (errorRows.length) {
      await admin.from('app_error_events').insert(errorRows);
    }
    if (performanceRows.length) {
      await admin.from('app_performance_metrics').insert(performanceRows);
    }
    if (shouldInsertDeviceSnapshot) {
      await admin.from('app_device_snapshots').insert({
        session_key: payload.sessionKey,
        academy_id: payload.academyId ?? null,
        user_id: payload.userId ?? null,
        profile_id: payload.profileId ?? null,
        origin: payload.origin ?? 'web',
        route_path: payload.currentRoute ?? '/',
        device_type: payload.device.deviceType ?? 'unknown',
        device_model: payload.device.deviceModel ?? null,
        device_vendor: payload.device.deviceVendor ?? null,
        os_name: payload.device.osName ?? null,
        os_version: payload.device.osVersion ?? null,
        browser_name: payload.device.browserName ?? null,
        browser_version: payload.device.browserVersion ?? null,
        screen_width: payload.device.screenWidth ?? null,
        screen_height: payload.device.screenHeight ?? null,
        viewport_width: payload.device.viewportWidth ?? null,
        viewport_height: payload.device.viewportHeight ?? null,
        pixel_ratio: payload.device.pixelRatio ?? null,
        orientation: (payload.device.viewportWidth ?? 0) >= (payload.device.viewportHeight ?? 0) ? 'landscape' : 'portrait',
        layout_risk_score: deviceRisk.score,
        layout_risk_reason: deviceRisk.reason,
        release_version: payload.releaseVersion ?? null,
        captured_at: nowIso,
        metadata: {
          ip,
          connectionType: payload.device.connectionType ?? null,
          effectiveType: payload.device.effectiveType ?? null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      sessionKey: payload.sessionKey,
      eventsStored: eventRows.length,
      errorsStored: errorRows.length,
      performanceStored: performanceRows.length,
    });
  } catch (error) {
    console.error('[telemetry] ingest failed', error);
    return NextResponse.json({ error: 'Failed to ingest telemetry' }, { status: 500 });
  }
}
