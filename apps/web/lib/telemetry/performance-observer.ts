// ═══════════════════════════════════════════════════════
// Performance Observer — Web Vitals collection
// ═══════════════════════════════════════════════════════

export interface WebVitals {
  lcp: number;
  fcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  inp: number;
}

export interface PageLoadMetric {
  page: string;
  loadTimeMs: number;
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  timestamp: string;
}

// Thresholds from Google Web Vitals
export const VITALS_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fcp: { good: 1800, poor: 3000 },
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 },
} as const;

export function classifyVital(name: keyof typeof VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = VITALS_THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

type VitalCallback = (metric: { name: string; value: number; page: string }) => void;

export function observeWebVitals(onMetric: VitalCallback): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observers: PerformanceObserver[] = [];
  const page = window.location.pathname;

  // LCP
  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) onMetric({ name: 'lcp', value: last.startTime, page });
    });
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObs);
  } catch { /* not supported */ }

  // FCP
  try {
    const fcpObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          onMetric({ name: 'fcp', value: entry.startTime, page });
        }
      }
    });
    fcpObs.observe({ type: 'paint', buffered: true });
    observers.push(fcpObs);
  } catch { /* not supported */ }

  // CLS
  try {
    let clsValue = 0;
    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const le = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!le.hadRecentInput) {
          clsValue += le.value ?? 0;
          onMetric({ name: 'cls', value: clsValue, page });
        }
      }
    });
    clsObs.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObs);
  } catch { /* not supported */ }

  // FID
  try {
    const fidObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const pe = entry as PerformanceEventTiming;
        onMetric({ name: 'fid', value: pe.processingStart - pe.startTime, page });
      }
    });
    fidObs.observe({ type: 'first-input', buffered: true });
    observers.push(fidObs);
  } catch { /* not supported */ }

  // TTFB
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      onMetric({ name: 'ttfb', value: nav.responseStart - nav.requestStart, page });
    }
  } catch { /* not supported */ }

  return () => {
    observers.forEach((o) => o.disconnect());
  };
}
