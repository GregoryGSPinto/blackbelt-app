import posthog from 'posthog-js';

let initialized = false;

export function initAnalytics(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || typeof window === 'undefined') return;
  if (initialized) return;

  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
    loaded: () => {
      initialized = true;
    },
  });
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!initialized && typeof window !== 'undefined') {
    initAnalytics();
  }
  if (typeof window !== 'undefined') {
    posthog.capture(name, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!initialized && typeof window !== 'undefined') {
    initAnalytics();
  }
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}

export function resetAnalytics(): void {
  if (typeof window !== 'undefined') {
    posthog.reset();
    initialized = false;
  }
}

// Predefined events
export const AnalyticsEvents = {
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  CHECKIN_COMPLETED: 'checkin_completed',
  CLASS_STARTED: 'class_started',
  CLASS_ENDED: 'class_ended',
  VIDEO_WATCHED: 'video_watched',
  PLAN_UPGRADED: 'plan_upgraded',
  PAYMENT_COMPLETED: 'payment_completed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FEATURE_USED: 'feature_used',
} as const;
