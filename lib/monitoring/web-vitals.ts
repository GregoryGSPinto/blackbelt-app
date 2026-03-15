export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export function reportWebVitals(metric: WebVitalMetric): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Web Vital] ${metric.name}: ${metric.value}`);
    return;
  }

  // TODO: Enviar para analytics em produção (Sentry, Vercel Analytics)
}
