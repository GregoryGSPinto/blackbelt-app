/**
 * BlackBelt v2 — Supabase Production Setup Guide
 *
 * This file documents the programmatic setup steps for Supabase.
 * Run these steps AFTER creating a Supabase project at supabase.com.
 *
 * Prerequisites:
 * - Supabase project created (note PROJECT_REF)
 * - Supabase CLI installed: pnpm add -D supabase
 * - Logged in: npx supabase login
 */

export const SUPABASE_SETUP_STEPS = [
  {
    step: 1,
    title: 'Link project',
    command: 'npx supabase link --project-ref $SUPABASE_PROJECT_REF',
    description: 'Links local project to remote Supabase instance',
  },
  {
    step: 2,
    title: 'Push migrations',
    command: 'npx supabase db push',
    description: 'Applies all migrations from supabase/migrations/ to production database',
  },
  {
    step: 3,
    title: 'Verify migrations',
    command: 'npx supabase db push --dry-run',
    description: 'Should show "No changes to push" if all migrations applied',
  },
  {
    step: 4,
    title: 'Deploy edge functions',
    commands: [
      'npx supabase functions deploy generate-qr',
      'npx supabase functions deploy process-checkin',
      'npx supabase functions deploy promote-belt',
      'npx supabase functions deploy generate-invoices',
      'npx supabase functions deploy send-push',
    ],
    description: 'Deploy all Supabase Edge Functions',
  },
  {
    step: 5,
    title: 'Configure storage buckets',
    buckets: [
      { name: 'avatars', public: true, maxSizeMB: 5 },
      { name: 'training-videos', public: false, maxSizeMB: 50 },
      { name: 'content', public: false, maxSizeMB: 50 },
      { name: 'contracts', public: false, maxSizeMB: 10 },
    ],
    description: 'Create storage buckets via Supabase Dashboard > Storage',
  },
  {
    step: 6,
    title: 'Configure Auth',
    settings: {
      siteUrl: 'https://YOUR_DOMAIN.com',
      redirectUrls: ['https://YOUR_DOMAIN.com/**'],
      disableEmailConfirmation: true, // For MVP, enable later
    },
    description: 'Configure in Supabase Dashboard > Settings > Auth',
  },
] as const;

export const REQUIRED_SUPABASE_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateSupabaseEnv(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_SUPABASE_ENV.filter((key) => !process.env[key]);
  return { valid: missing.length === 0, missing };
}
