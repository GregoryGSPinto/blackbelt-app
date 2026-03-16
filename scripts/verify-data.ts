/**
 * verify-data.ts
 *
 * Checks the Supabase database for seeded data.
 * Run with: npx tsx scripts/verify-data.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log('=== BLACKBELT DATA VERIFICATION ===\n');

  // 1. Auth users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (usersError) {
    console.error('Auth users: ERROR -', usersError.message);
  } else {
    console.log(`Auth users: ${usersData.users.length}`);
  }

  // 2. Tables
  const tables = [
    'academies', 'units', 'modalities', 'profiles', 'memberships',
    'students', 'classes', 'class_enrollments', 'attendance',
    'invoices', 'subscriptions', 'plans', 'messages', 'achievements',
    'leads', 'events', 'nps_responses', 'videos', 'series',
    'feed_posts', 'notifications', 'evaluations', 'progressions',
    'guardians', 'student_xp', 'challenges', 'push_tokens',
  ];

  let hasAlerts = false;

  console.log('\n--- Table Counts ---');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`${table}: TABLE NOT FOUND`);
        hasAlerts = true;
      } else {
        console.log(`${table}: ERROR - ${error.message}`);
        hasAlerts = true;
      }
    } else {
      const alert = count === 0 ? ' ⚠ EMPTY' : '';
      if (count === 0) hasAlerts = true;
      console.log(`${table}: ${count}${alert}`);
    }
  }

  // 3. Test login
  console.log('\n--- Auth Test ---');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'roberto@guerreiros.com',
    password: 'BlackBelt@2026',
  });
  if (loginError) {
    console.log(`Login roberto@guerreiros.com: FAILED - ${loginError.message}`);
  } else {
    console.log(`Login roberto@guerreiros.com: OK (uid: ${loginData.user?.id})`);
    await supabase.auth.signOut();
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  const userCount = usersData?.users?.length ?? 0;
  if (userCount >= 30) {
    console.log(`✅ Seed appears complete (${userCount} users)`);
  } else if (userCount > 0) {
    console.log(`⚠ Partial seed detected (${userCount} users, expected 30+)`);
  } else {
    console.log('❌ Seed has NOT run (0 users)');
  }
  if (hasAlerts) {
    console.log('⚠ Some tables are empty or missing - review above');
  }
}

verify().catch(console.error);
