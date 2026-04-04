/* eslint-disable no-console */
/**
 * BlackBelt v2 — Production Environment Validation
 *
 * Validates all required environment variables before starting the app in production.
 * Call validateProductionEnv() during server startup.
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  group: 'app' | 'supabase' | 'payment' | 'email' | 'monitoring' | 'push' | 'analytics';
}

const ENV_VARS: EnvVar[] = [
  // App
  { key: 'NEXT_PUBLIC_APP_URL', required: true, description: 'Public app URL (e.g. https://blackbelts.com.br)', group: 'app' },
  { key: 'NEXT_PUBLIC_USE_MOCK', required: false, description: 'Set to "false" for production', group: 'app' },

  // Supabase
  { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL', group: 'supabase' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key', group: 'supabase' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key (server-only)', group: 'supabase' },

  // Payment
  { key: 'PAYMENT_GATEWAY', required: true, description: 'Payment gateway: asaas | stripe | mock', group: 'payment' },
  { key: 'ASAAS_API_KEY', required: false, description: 'Asaas API key (required if gateway=asaas)', group: 'payment' },
  { key: 'ASAAS_WEBHOOK_TOKEN', required: false, description: 'Asaas webhook verification token', group: 'payment' },
  { key: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key (required if gateway=stripe)', group: 'payment' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret', group: 'payment' },

  // Email
  { key: 'RESEND_API_KEY', required: false, description: 'Resend API key for transactional emails', group: 'email' },

  // Monitoring
  { key: 'NEXT_PUBLIC_SENTRY_DSN', required: false, description: 'Sentry DSN for client-side error tracking', group: 'monitoring' },
  { key: 'SENTRY_DSN', required: false, description: 'Sentry DSN for server-side error tracking', group: 'monitoring' },
  { key: 'SENTRY_AUTH_TOKEN', required: false, description: 'Sentry auth token for source maps', group: 'monitoring' },

  // Push
  { key: 'APNS_KEY_ID', required: false, description: 'Apple Push Notification Key ID', group: 'push' },
  { key: 'APNS_TEAM_ID', required: false, description: 'Apple Developer Team ID', group: 'push' },
  { key: 'FCM_SERVER_KEY', required: false, description: 'Firebase Cloud Messaging server key', group: 'push' },
  { key: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', required: false, description: 'VAPID public key for web push', group: 'push' },
  { key: 'VAPID_PRIVATE_KEY', required: false, description: 'VAPID private key for web push', group: 'push' },

  // Analytics
  { key: 'NEXT_PUBLIC_POSTHOG_KEY', required: false, description: 'PostHog project API key', group: 'analytics' },
  { key: 'NEXT_PUBLIC_POSTHOG_HOST', required: false, description: 'PostHog host URL', group: 'analytics' },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  groups: Record<string, { configured: boolean; vars: { key: string; set: boolean }[] }>;
}

export function validateProductionEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const groups: Record<string, { configured: boolean; vars: { key: string; set: boolean }[] }> = {};

  for (const v of ENV_VARS) {
    const isSet = !!process.env[v.key];

    if (!groups[v.group]) {
      groups[v.group] = { configured: true, vars: [] };
    }
    groups[v.group].vars.push({ key: v.key, set: isSet });

    if (v.required && !isSet) {
      missing.push(v.key);
      groups[v.group].configured = false;
    }

    if (!v.required && !isSet) {
      warnings.push(`${v.key} not set — ${v.description}`);
    }
  }

  // Conditional validation
  const gateway = process.env.PAYMENT_GATEWAY;
  if (gateway === 'asaas' && !process.env.ASAAS_API_KEY) {
    missing.push('ASAAS_API_KEY (required for gateway=asaas)');
  }
  if (gateway === 'stripe' && !process.env.STRIPE_SECRET_KEY) {
    missing.push('STRIPE_SECRET_KEY (required for gateway=stripe)');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    groups,
  };
}

export function printEnvReport(): void {
  const result = validateProductionEnv();

  console.log('\n=== BlackBelt v2 — Environment Report ===\n');

  for (const [group, info] of Object.entries(result.groups)) {
    const status = info.configured ? '✓' : '✗';
    console.log(`${status} ${group.toUpperCase()}`);
    for (const v of info.vars) {
      console.log(`  ${v.set ? '✓' : '○'} ${v.key}`);
    }
    console.log('');
  }

  if (result.missing.length > 0) {
    console.log(`MISSING (${result.missing.length}): ${result.missing.join(', ')}`);
  }

  console.log(`\nStatus: ${result.valid ? 'READY FOR PRODUCTION' : 'NOT READY — fix missing vars'}\n`);
}
