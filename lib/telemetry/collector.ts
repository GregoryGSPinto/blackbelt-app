// ═══════════════════════════════════════════════════════
// Telemetry Collector — Lightweight client-side SDK
// ═══════════════════════════════════════════════════════

import { parseDevice, type DeviceInfo } from './device-parser';
import { observeWebVitals } from './performance-observer';
import { installFetchInterceptor, type APICallRecord } from './fetch-interceptor';

// ── Types ──

interface JSError {
  message: string;
  stack: string;
  source: string;
  line: number;
  column: number;
  timestamp: string;
  page: string;
  count: number;
}

interface TelemetryEvent {
  type: string;
  page: string;
  data: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
}

// ── State ──

let sessionId: string | null = null;
let userId: string | null = null;
let profileId: string | null = null;
let role: string | null = null;
let academyId: string | null = null;
let device: DeviceInfo | null = null;
let startedAt: string | null = null;
let pagesVisited: string[] = [];
let totalActions = 0;
let eventBuffer: TelemetryEvent[] = [];
const jsErrors: Map<string, JSError> = new Map();
let flushInterval: ReturnType<typeof setInterval> | null = null;
let cleanupFns: Array<() => void> = [];
let isInitialized = false;
let lastActivityAt = Date.now();

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function pushEvent(type: string, data: Record<string, unknown>, severity: TelemetryEvent['severity'] = 'info') {
  eventBuffer.push({
    type,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    data,
    severity,
    timestamp: new Date().toISOString(),
  });

  // Cap at 100 events in buffer
  if (eventBuffer.length > 100) {
    eventBuffer = eventBuffer.slice(-50);
  }
}

async function flushEvents() {
  if (!sessionId || eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, 50);
  const payload = {
    sessionId,
    userId,
    profileId,
    role,
    academyId,
    device,
    locale: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startedAt,
    lastActivityAt: new Date(lastActivityAt).toISOString(),
    duration: Math.round((Date.now() - new Date(startedAt!).getTime()) / 1000),
    isActive: Date.now() - lastActivityAt < 5 * 60 * 1000,
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '',
    pagesVisited,
    totalPageViews: pagesVisited.length,
    totalActions,
    events: batch,
  };

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', JSON.stringify(payload));
    } else {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // silently fail — non-critical
      });
    }
  } catch {
    // silently fail
  }
}

function onJSError(message: string, source: string, line: number, column: number, stack: string) {
  const key = `${message}:${source}:${line}`;
  const existing = jsErrors.get(key);
  if (existing) {
    existing.count++;
    existing.timestamp = new Date().toISOString();
  } else {
    jsErrors.set(key, {
      message, stack, source, line, column,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      count: 1,
    });
  }

  pushEvent('js_error', { message, stack: stack.slice(0, 500), source, line, column }, 'error');
}

function onAPIError(record: APICallRecord) {
  pushEvent('api_error', {
    url: record.url,
    method: record.method,
    status: record.status,
    message: record.message,
    duration: record.duration,
  }, record.status >= 500 ? 'error' : 'warning');
}

function trackActivity() {
  lastActivityAt = Date.now();
  totalActions++;
}

// ── Public API ──

export function initTelemetry(
  uid: string,
  pid: string,
  userRole: string,
  userAcademyId: string,
) {
  if (typeof window === 'undefined' || isInitialized) return;

  sessionId = generateId();
  userId = uid;
  profileId = pid;
  role = userRole;
  academyId = userAcademyId;
  device = parseDevice();
  startedAt = new Date().toISOString();
  pagesVisited = [window.location.pathname];
  totalActions = 0;
  eventBuffer = [];
  jsErrors.clear();
  isInitialized = true;

  // JS Errors
  const origOnError = window.onerror;
  window.onerror = function (msg, source, line, col, err) {
    onJSError(
      String(msg),
      source ?? '',
      line ?? 0,
      col ?? 0,
      err?.stack ?? '',
    );
    if (origOnError) origOnError.call(window, msg, source, line, col, err);
  };
  cleanupFns.push(() => { window.onerror = origOnError; });

  // Unhandled promise rejections
  const onRejection = (e: PromiseRejectionEvent) => {
    onJSError(
      e.reason?.message ?? String(e.reason),
      '',
      0,
      0,
      e.reason?.stack ?? '',
    );
  };
  window.addEventListener('unhandledrejection', onRejection);
  cleanupFns.push(() => window.removeEventListener('unhandledrejection', onRejection));

  // Performance observer
  const stopVitals = observeWebVitals((metric) => {
    pushEvent('page_load', { [metric.name]: metric.value }, 'info');
  });
  cleanupFns.push(stopVitals);

  // Fetch interceptor
  const stopFetch = installFetchInterceptor(onAPIError);
  cleanupFns.push(stopFetch);

  // Visibility
  const onVisChange = () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  };
  document.addEventListener('visibilitychange', onVisChange);
  cleanupFns.push(() => document.removeEventListener('visibilitychange', onVisChange));

  // Activity tracking
  const events = ['click', 'keydown', 'scroll', 'touchstart'] as const;
  events.forEach((evt) => {
    document.addEventListener(evt, trackActivity, { passive: true });
    cleanupFns.push(() => document.removeEventListener(evt, trackActivity));
  });

  // Page navigation tracking (popstate + pushState)
  const onNav = () => {
    const page = window.location.pathname;
    if (pagesVisited[pagesVisited.length - 1] !== page) {
      pagesVisited.push(page);
      pushEvent('navigation', { page }, 'info');
    }
    lastActivityAt = Date.now();
  };
  window.addEventListener('popstate', onNav);
  cleanupFns.push(() => window.removeEventListener('popstate', onNav));

  // Monkey-patch pushState for SPA navigation
  const origPushState = history.pushState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    onNav();
  };
  cleanupFns.push(() => { history.pushState = origPushState; });

  // Flush every 30s
  flushInterval = setInterval(flushEvents, 30_000);

  // Flush on unload
  const onBeforeUnload = () => {
    flushEvents();
  };
  window.addEventListener('beforeunload', onBeforeUnload);
  cleanupFns.push(() => window.removeEventListener('beforeunload', onBeforeUnload));

  // Initial page load event
  pushEvent('navigation', { page: window.location.pathname }, 'info');
}

export function stopTelemetry() {
  if (!isInitialized) return;
  flushEvents();
  if (flushInterval) clearInterval(flushInterval);
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  isInitialized = false;
  sessionId = null;
}

export function getSessionId(): string | null {
  return sessionId;
}

export function getCurrentDevice(): DeviceInfo | null {
  return device;
}

export function getRecentEvents(): TelemetryEvent[] {
  return [...eventBuffer];
}

export function trackPageView(page: string) {
  if (!isInitialized) return;
  if (pagesVisited[pagesVisited.length - 1] !== page) {
    pagesVisited.push(page);
    pushEvent('navigation', { page }, 'info');
  }
}
