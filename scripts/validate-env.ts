const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ASAAS_API_KEY',
  'ASAAS_ENVIRONMENT',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_USE_MOCK',
  'NEXT_PUBLIC_BETA_MODE',
];

let errors = 0;
console.log('=== Validating environment ===\n');

for (const key of REQUIRED) {
  if (process.env[key]) {
    console.log(`✅ ${key}`);
  } else {
    console.log(`❌ ${key} — REQUIRED`);
    errors++;
  }
}

console.log('');

for (const key of OPTIONAL) {
  if (process.env[key]) {
    console.log(`✅ ${key}`);
  } else {
    console.log(`⚠️  ${key} — optional (not set)`);
  }
}

console.log(
  `\n${errors === 0 ? '✅ All required vars set' : `❌ ${errors} required vars missing`}`,
);

process.exit(errors > 0 ? 1 : 0);
