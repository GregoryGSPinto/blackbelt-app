#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const requiredDirs = [
  'app',
  'components',
  'features',
  'lib',
  'supabase',
  'tests',
  'e2e',
  'scripts',
  'docs',
  'ios',
  'android',
  'scaffolds/blackbelt-site',
  'scaffolds/blackbelt-infra-private',
  'app/(auth)',
  'app/(public-operational)',
  'app/(site-marketing)',
  'app/api',
  'docs/architecture',
  'docs/audits',
  'docs/operations',
  'docs/release',
  'docs/setup',
];

const allowedRootEntries = new Set([
  '.claude',
  '.env.example',
  '.env.local',
  '.env.production',
  '.eslintrc.json',
  '.git',
  '.github',
  '.gitignore',
  '.next',
  '.prettierrc.json',
  '.vercel',
  '.vercelignore',
  'CODEOWNERS',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'android',
  'android-signing.properties.example',
  'app',
  'capacitor.config.ts',
  'components',
  'docs',
  'e2e',
  'features',
  'html2pdf.js.d.ts',
  'i18n',
  'ios',
  'ios-privacy-manifest',
  'lib',
  'messages',
  'middleware.ts',
  'native-patches',
  'next-env.d.ts',
  'next.config.mjs',
  'node_modules',
  'out',
  'package.json',
  'playwright.config.ts',
  'pnpm-lock.yaml',
  'postcss.config.mjs',
  'public',
  'resources',
  'scaffolds',
  'scripts',
  'sentry.client.config.ts',
  'sentry.edge.config.ts',
  'sentry.server.config.ts',
  'styles',
  'supabase',
  'tailwind.config.ts',
  'test-results',
  'tests',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
  'vercel.json',
  'vitest.config.ts',
]);

for (const dir of requiredDirs) {
  if (!existsSync(path.join(root, dir))) {
    failures.push(`Missing required directory: ${dir}`);
  }
}

for (const entry of readdirSync(root)) {
  if (allowedRootEntries.has(entry) || entry.startsWith('.DS_Store')) {
    continue;
  }
  failures.push(`Unexpected root entry: ${entry}`);
}

const strategicRouteChecks = [
  {
    file: 'app/page.tsx',
    mustInclude: ['redirect(', '/login'],
    mustExclude: ["@/features/site/pages/landing-page"],
  },
  {
    file: 'app/(auth)/login/page.tsx',
    mustInclude: ["@/features/auth/pages/login-page"],
    mustExclude: ["@/lib/api/"],
  },
  {
    file: 'app/(public-operational)/cadastrar-academia/page.tsx',
    mustInclude: ["@/features/onboarding/pages/register-academia-page"],
    mustExclude: ["@/lib/api/"],
  },
];

const requiredDocs = [
  'docs/README.md',
  'docs/audits/README.md',
  'docs/release/README.md',
  'docs/setup/README.md',
  'docs/architecture/domain-topology.md',
  'docs/architecture/public-vs-authenticated-surfaces.md',
  'docs/architecture/mobile-companion.md',
];

for (const check of strategicRouteChecks) {
  const file = path.join(root, check.file);
  if (!existsSync(file)) {
    failures.push(`Missing strategic route file: ${check.file}`);
    continue;
  }

  const content = readFileSync(file, 'utf8');
  for (const expected of check.mustInclude) {
    if (!content.includes(expected)) {
      failures.push(`Expected "${expected}" in ${check.file}`);
    }
  }
  for (const forbidden of check.mustExclude) {
    if (content.includes(forbidden)) {
      failures.push(`Forbidden "${forbidden}" in ${check.file}`);
    }
  }
}

for (const doc of requiredDocs) {
  if (!existsSync(path.join(root, doc))) {
    failures.push(`Missing required documentation file: ${doc}`);
  }
}

const marketingRoutes = [
  'app/(site-marketing)/precos/page.tsx',
  'app/(site-marketing)/sobre/page.tsx',
  'app/(site-marketing)/blog/page.tsx',
  'app/(site-marketing)/beta-invite/page.tsx',
  'app/(site-marketing)/aula-experimental/page.tsx',
];

for (const route of marketingRoutes) {
  const file = path.join(root, route);
  if (!existsSync(file)) {
    failures.push(`Missing marketing redirect route: ${route}`);
    continue;
  }
  const content = readFileSync(file, 'utf8');
  if (!content.includes('getMarketingRedirect') || !content.includes('redirect(')) {
    failures.push(`Marketing route is not delegating to blackbeltv2.vercel.app: ${route}`);
  }
}

if (failures.length > 0) {
  console.error('Architecture check failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Architecture check passed.');
