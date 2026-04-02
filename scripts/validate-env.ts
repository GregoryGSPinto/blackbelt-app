type EnvGroup = {
  name: string;
  required: string[];
  optional?: string[];
};

const groups: EnvGroup[] = [
  {
    name: 'app',
    required: ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_USE_MOCK'],
    optional: ['NEXT_PUBLIC_APP_VERSION', 'NEXT_PUBLIC_PLATFORM', 'NEXT_PUBLIC_BETA_MODE'],
  },
  {
    name: 'server',
    required: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    optional: ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_PROJECT_REF'],
  },
  {
    name: 'mobile',
    required: [],
    optional: [
      'CAPACITOR_REMOTE_RUNTIME',
      'CAPACITOR_STATIC_EXPORT',
      'IOS_BUNDLE_ID',
      'ANDROID_APPLICATION_ID',
      'APPLE_DEVELOPMENT_TEAM',
    ],
  },
  {
    name: 'billing',
    required: [],
    optional: ['PAYMENT_GATEWAY', 'ASAAS_API_KEY', 'ASAAS_WEBHOOK_TOKEN', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
  },
  {
    name: 'observability',
    required: [],
    optional: ['NEXT_PUBLIC_SENTRY_DSN', 'SENTRY_DSN', 'SENTRY_AUTH_TOKEN', 'NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_GA_ID'],
  },
];

let errors = 0;

console.log('=== BlackBelt environment validation ===\n');

for (const group of groups) {
  console.log(`[${group.name}]`);

  for (const key of group.required) {
    if (process.env[key]) {
      console.log(`  OK   ${key}`);
    } else {
      console.log(`  MISS ${key}`);
      errors++;
    }
  }

  for (const key of group.optional ?? []) {
    console.log(`  ${process.env[key] ? 'OK  ' : 'WARN'} ${key}`);
  }

  console.log('');
}

console.log(errors === 0 ? 'Environment shape is valid.' : `${errors} required variables are missing.`);

process.exit(errors > 0 ? 1 : 0);
