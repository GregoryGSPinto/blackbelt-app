import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',
    // COPPA/LGPD: suppress Sentry events for aluno_kids profiles.
    // The global flag is set by disableAnalyticsForKids() in posthog.ts
    // which is called from AuthContext when a kids profile is active.
    beforeSend(event) {
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__bb_analytics_disabled === true) {
        return null;
      }
      return event;
    },
  });
}
