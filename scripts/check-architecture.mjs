#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

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
];

const requiredFeatureDirs = [
  'features/auth',
  'features/billing',
  'features/finance',
  'features/onboarding',
  'features/platform-center',
  'features/site',
];

const appGroups = [
  '(public)',
  '(auth)',
  '(admin)',
  '(professor)',
  '(main)',
  '(teen)',
  '(kids)',
  '(recepcao)',
  '(franqueador)',
  '(network)',
  '(superadmin)',
];

const failures = [];

for (const dir of [...requiredDirs, ...requiredFeatureDirs]) {
  if (!existsSync(path.join(root, dir))) {
    failures.push(`Missing required directory: ${dir}`);
  }
}

for (const group of appGroups) {
  if (!existsSync(path.join(root, 'app', group))) {
    failures.push(`Missing route group in app/: ${group}`);
  }
}

const strategicRouteFiles = [
  'app/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(public)/cadastrar-academia/page.tsx',
];

for (const relative of strategicRouteFiles) {
  const file = path.join(root, relative);
  const content = readFileSync(file, 'utf8');
  if (content.includes("from '@/lib/api/")) {
    failures.push(`Route imports service layer directly: ${relative}`);
  }
  if (!content.includes("from '@/features/")) {
    failures.push(`Strategic route is not delegating to features/: ${relative}`);
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
