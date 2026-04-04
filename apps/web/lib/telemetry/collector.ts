import { parseDevice, type DeviceInfo } from './device-parser';
import { observeWebVitals } from './performance-observer';
import { installFetchInterceptor, type APICallRecord } from './fetch-interceptor';

type TelemetrySeverity = 'info' | 'warning' | 'error' | 'critical';

interface TelemetryEvent {
  name: string;
  routePath: string;
  severity: TelemetrySeverity;
  timestamp: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

interface BufferedPerformance {
  routePath: string;
  metrics: {
    ttfb?: number;
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    inp?: number;
  };
}

let sessionKey: string | null = null;
let userId: string | null = null;
let profileId: string | null = null;
let academyId: string | null = null;
let role: string | null = null;
let device: DeviceInfo | null = null;
let eventBuffer: TelemetryEvent[] = [];
let pagesVisited: string[] = [];
let totalActions = 0;
let lastActivityAt = Date.now();
let startedAt = Date.now();
let currentRouteStartedAt = Date.now();
let currentRoute = '/';
let performanceBuffer: Map<string, BufferedPerformance['metrics']> = new Map();
let flushInterval: ReturnType<typeof setInterval> | null = null;
let cleanupFns: Array<() => void> = [];
let isInitialized = false;

function generateKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getAppVersion(): string | undefined {
  return process.env.NEXT_PUBLIC_APP_VERSION;
}

function pushEvent(
  name: string,
  metadata: Record<string, unknown> = {},
  severity: TelemetrySeverity = 'info',
  durationMs?: number,
) {
  if (typeof window === 'undefined') return;

  eventBuffer.push({
    name,
    routePath: window.location.pathname,
    severity,
    timestamp: new Date().toISOString(),
    durationMs,
    metadata,
  });

  if (eventBuffer.length > 150) {
    eventBuffer = eventBuffer.slice(-100);
  }
}

function trackActivity() {
  lastActivityAt = Date.now();
  totalActions += 1;
}

function flushCurrentRoute() {
  if (typeof window === 'undefined') return;
  const durationMs = Math.max(0, Date.now() - currentRouteStartedAt);
  pushEvent(
    'screen_left',
    {
      pageCount: pagesVisited.length,
      totalActions,
    },
    'info',
    durationMs,
  );
}

async function flushEvents() {
  if (!sessionKey || !device || eventBuffer.length === 0 || typeof window === 'undefined') return;

  const batch = eventBuffer.splice(0, 80);
  const payload = {
    sessionKey,
    userId,
    profileId,
    academyId,
    role,
    origin: device.isCapacitor ? 'android' : 'web',
    appVersion: getAppVersion(),
    releaseVersion: getAppVersion(),
    locale: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startedAt: new Date(startedAt).toISOString(),
    lastActivityAt: new Date(lastActivityAt).toISOString(),
    durationSeconds: Math.round((Date.now() - startedAt) / 1000),
    totalPageViews: pagesVisited.length,
    totalActions,
    currentRoute: window.location.pathname,
    pagesVisited,
    device: {
      deviceType: device.type,
      deviceModel: device.deviceModel,
      deviceVendor: device.deviceVendor,
      osName: device.os,
      osVersion: device.osVersion,
      browserName: device.browser,
      browserVersion: device.browserVersion,
      screenWidth: device.screenWidth,
      screenHeight: device.screenHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: device.pixelRatio,
      connectionType: device.connectionType,
      effectiveType: device.effectiveType,
    },
    events: batch.map((event) => ({
      ...event,
      metadata: {
        ...event.metadata,
        appVersion: getAppVersion(),
        releaseVersion: getAppVersion(),
      },
    })),
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', JSON.stringify(payload));
      return;
    }
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-critical; telemetry must not break the UX.
  }
}

function registerPerformanceMetric(routePath: string, name: string, value: number) {
  const current = performanceBuffer.get(routePath) ?? {};
  current[name as keyof BufferedPerformance['metrics']] = value;
  performanceBuffer.set(routePath, current);

  if (name === 'lcp' || name === 'ttfb') {
    pushEvent(
      'performance_metric',
      {
        metric: name,
        value,
        ...current,
      },
      'info',
    );
  }
}

function handleApiSignal(record: APICallRecord) {
  const baseMetadata = {
    url: record.url,
    method: record.method,
    status: record.status,
    durationMs: record.duration,
    message: record.message,
  };

  if (record.status === 401 || record.status === 403) {
    pushEvent('auth_failure', baseMetadata, 'warning');
    return;
  }
  if (record.duration >= 8000 || /timeout/i.test(record.message ?? '')) {
    pushEvent('timeout', baseMetadata, 'warning');
    return;
  }

  pushEvent('api_error', baseMetadata, record.status >= 500 ? 'error' : 'warning');
}

function recordRouteVisit(routePath: string) {
  currentRoute = routePath;
  currentRouteStartedAt = Date.now();
  pagesVisited.push(routePath);
  pushEvent('route_visited', {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });
  pushEvent('screen_viewed', {
    title: document.title,
  });
}

function handleNavigation(nextRoute: string) {
  if (nextRoute === currentRoute) return;
  flushCurrentRoute();
  recordRouteVisit(nextRoute);
  lastActivityAt = Date.now();
}

export function initTelemetry(uid: string, pid: string, userRole: string, userAcademyId: string) {
  if (typeof window === 'undefined' || isInitialized) return;

  sessionKey = generateKey();
  userId = uid;
  profileId = pid;
  academyId = userAcademyId || null;
  role = userRole;
  device = parseDevice();
  startedAt = Date.now();
  lastActivityAt = Date.now();
  totalActions = 0;
  eventBuffer = [];
  pagesVisited = [];
  performanceBuffer = new Map();
  isInitialized = true;

  currentRoute = window.location.pathname;
  currentRouteStartedAt = Date.now();
  recordRouteVisit(window.location.pathname);

  const originalOnError = window.onerror;
  window.onerror = function (message, source, line, column, error) {
    pushEvent(
      'js_error',
      {
        message: String(message),
        source: source ?? '',
        line: line ?? 0,
        column: column ?? 0,
        stack: error?.stack?.slice(0, 1000),
      },
      'error',
    );
    if (originalOnError) {
      return originalOnError.call(window, message, source, line, column, error);
    }
    return false;
  };
  cleanupFns.push(() => {
    window.onerror = originalOnError;
  });

  const onRejection = (event: PromiseRejectionEvent) => {
    pushEvent(
      'js_error',
      {
        message: event.reason?.message ?? String(event.reason),
        stack: event.reason?.stack?.slice(0, 1000),
      },
      'error',
    );
  };
  window.addEventListener('unhandledrejection', onRejection);
  cleanupFns.push(() => window.removeEventListener('unhandledrejection', onRejection));

  const stopVitals = observeWebVitals((metric) => {
    registerPerformanceMetric(metric.page, metric.name, metric.value);
  });
  cleanupFns.push(stopVitals);

  const stopFetch = installFetchInterceptor(handleApiSignal);
  cleanupFns.push(stopFetch);

  const activityEvents = ['click', 'keydown', 'scroll', 'touchstart'] as const;
  for (const eventName of activityEvents) {
    document.addEventListener(eventName, trackActivity, { passive: true });
    cleanupFns.push(() => document.removeEventListener(eventName, trackActivity));
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushCurrentRoute();
      void flushEvents();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  cleanupFns.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

  const onPopState = () => handleNavigation(window.location.pathname);
  window.addEventListener('popstate', onPopState);
  cleanupFns.push(() => window.removeEventListener('popstate', onPopState));

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleNavigation(window.location.pathname);
  };
  cleanupFns.push(() => {
    history.pushState = originalPushState;
  });

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleNavigation(window.location.pathname);
  };
  cleanupFns.push(() => {
    history.replaceState = originalReplaceState;
  });

  const onBeforeUnload = () => {
    flushCurrentRoute();
    void flushEvents();
  };
  window.addEventListener('beforeunload', onBeforeUnload);
  cleanupFns.push(() => window.removeEventListener('beforeunload', onBeforeUnload));

  flushInterval = setInterval(() => {
    void flushEvents();
  }, 30000);
}

export function stopTelemetry() {
  if (!isInitialized) return;

  flushCurrentRoute();
  void flushEvents();

  if (flushInterval) clearInterval(flushInterval);
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  flushInterval = null;
  isInitialized = false;
  sessionKey = null;
}

export function getSessionId(): string | null {
  return sessionKey;
}

export function getCurrentDevice(): DeviceInfo | null {
  return device;
}

export function getRecentEvents(): TelemetryEvent[] {
  return [...eventBuffer];
}

export function trackPageView(page: string) {
  if (!isInitialized || typeof window === 'undefined') return;
  handleNavigation(page);
}
