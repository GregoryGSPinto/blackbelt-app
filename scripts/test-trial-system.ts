/**
 * test-trial-system.ts
 *
 * Comprehensive test of all trial features.
 * Tests: migration tables, service exports, mock functions, pages,
 * API routes, dashboard integration, and build.
 *
 * Run with:  npx tsx scripts/test-trial-system.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let pass = 0;
let fail = 0;
const results: { name: string; status: 'PASS' | 'FAIL'; detail?: string }[] = [];

function PASS(name: string, detail?: string) {
  pass++;
  results.push({ name, status: 'PASS', detail });
  console.log(`  ✅ PASS: ${name}${detail ? ` — ${detail}` : ''}`);
}

function FAIL(name: string, detail?: string) {
  fail++;
  results.push({ name, status: 'FAIL', detail });
  console.log(`  ❌ FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    PASS(name);
  } catch (err: any) {
    FAIL(name, err.message ?? String(err));
  }
}

// Force mock mode
process.env.NEXT_PUBLIC_USE_MOCK = 'true';

async function run() {
  console.log('\n🥋 TRIAL SYSTEM TEST SUITE\n');
  console.log('═'.repeat(60));

  // ── 1. Service Exports ──────────────────────────────────────────

  console.log('\n📦 1. Service Exports\n');

  await test('trial.service exports TrialStudent type', async () => {
    const mod = await import('../lib/api/trial.service');
    if (!mod.registerTrialStudent) throw new Error('registerTrialStudent not exported');
    if (!mod.listTrialStudents) throw new Error('listTrialStudents not exported');
    if (!mod.getTrialStudent) throw new Error('getTrialStudent not exported');
    if (!mod.getTrialMetrics) throw new Error('getTrialMetrics not exported');
    if (!mod.getExpiringTrials) throw new Error('getExpiringTrials not exported');
    if (!mod.updateTrialStudent) throw new Error('updateTrialStudent not exported');
    if (!mod.assignProfessor) throw new Error('assignProfessor not exported');
    if (!mod.scheduleFollowUp) throw new Error('scheduleFollowUp not exported');
    if (!mod.markFollowUpDone) throw new Error('markFollowUpDone not exported');
    if (!mod.extendTrial) throw new Error('extendTrial not exported');
    if (!mod.cancelTrial) throw new Error('cancelTrial not exported');
    if (!mod.recordClassAttendance) throw new Error('recordClassAttendance not exported');
    if (!mod.startConversion) throw new Error('startConversion not exported');
    if (!mod.convertTrial) throw new Error('convertTrial not exported');
    if (!mod.getConversionOffer) throw new Error('getConversionOffer not exported');
    if (!mod.submitTrialFeedback) throw new Error('submitTrialFeedback not exported');
    if (!mod.getTrialFeedbacks) throw new Error('getTrialFeedbacks not exported');
    if (!mod.getTrialConfig) throw new Error('getTrialConfig not exported');
    if (!mod.updateTrialConfig) throw new Error('updateTrialConfig not exported');
    if (!mod.seedDefaultConfig) throw new Error('seedDefaultConfig not exported');
    if (!mod.getMyTrialInfo) throw new Error('getMyTrialInfo not exported');
    if (!mod.generateWelcomeWhatsAppLink) throw new Error('generateWelcomeWhatsAppLink not exported');
    if (!mod.generateFollowUpWhatsAppLink) throw new Error('generateFollowUpWhatsAppLink not exported');
    if (!mod.registerTrialFromWebsite) throw new Error('registerTrialFromWebsite not exported');
  });

  await test('trial-notifications.service exports', async () => {
    const mod = await import('../lib/api/trial-notifications.service');
    if (!mod.processTrialNotifications) throw new Error('processTrialNotifications missing');
    if (!mod.processAllAcademyTrialNotifications) throw new Error('processAllAcademyTrialNotifications missing');
  });

  // ── 2. Mock Functions ──────────────────────────────────────────

  console.log('\n🎭 2. Mock Functions\n');

  await test('mockRegisterTrialStudent returns TrialStudent', async () => {
    const { mockRegisterTrialStudent } = await import('../lib/mocks/trial.mock');
    const result = await mockRegisterTrialStudent('academy-1', {
      name: 'Test User',
      phone: '5511999999999',
      source: 'walk_in',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'beginner',
    });
    if (!result) throw new Error('returned null');
    if (!result.id) throw new Error('no id');
    if (result.name !== 'Test User') throw new Error('wrong name');
    if (result.status !== 'active') throw new Error('wrong status');
  });

  await test('mockListTrialStudents returns array', async () => {
    const { mockListTrialStudents } = await import('../lib/mocks/trial.mock');
    const result = await mockListTrialStudents('academy-1');
    if (!Array.isArray(result)) throw new Error('not array');
    if (result.length === 0) throw new Error('empty');
  });

  await test('mockGetTrialMetrics returns metrics', async () => {
    const { mockGetTrialMetrics } = await import('../lib/mocks/trial.mock');
    const result = await mockGetTrialMetrics('academy-1');
    if (typeof result.active_now !== 'number') throw new Error('no active_now');
    if (typeof result.conversion_rate !== 'number') throw new Error('no conversion_rate');
    if (typeof result.expiring_in_3_days !== 'number') throw new Error('no expiring_in_3_days');
  });

  await test('mockGetTrialStudent returns student', async () => {
    const { mockGetTrialStudent } = await import('../lib/mocks/trial.mock');
    const result = await mockGetTrialStudent('trial-s-1');
    if (!result) throw new Error('returned null');
    if (!result.name) throw new Error('no name');
  });

  await test('mockGetTrialConfig returns config', async () => {
    const { mockGetTrialConfig } = await import('../lib/mocks/trial.mock');
    const result = await mockGetTrialConfig('academy-1');
    if (!result) throw new Error('returned null');
    if (typeof result.trial_duration_days !== 'number') throw new Error('no duration');
  });

  await test('mockGetTrialActivity returns array', async () => {
    const { mockGetTrialActivity } = await import('../lib/mocks/trial.mock');
    const result = await mockGetTrialActivity('trial-s-1');
    if (!Array.isArray(result)) throw new Error('not array');
  });

  await test('mockConvertTrial returns student', async () => {
    const { mockConvertTrial } = await import('../lib/mocks/trial.mock');
    const result = await mockConvertTrial('trial-s-1', 'Plano Mensal');
    if (!result) throw new Error('returned null');
    if (result.status !== 'converted') throw new Error('not converted');
  });

  await test('mockSubmitTrialFeedback works', async () => {
    const { mockSubmitTrialFeedback } = await import('../lib/mocks/trial.mock');
    await mockSubmitTrialFeedback('trial-s-1', 5, 'Great!', true);
    // void return — no throw means success
  });

  await test('mockGetMyTrialInfo returns info', async () => {
    const { mockGetMyTrialInfo } = await import('../lib/mocks/trial.mock');
    const result = await mockGetMyTrialInfo('academy-1');
    if (!result) throw new Error('returned null');
    if (!result.name) throw new Error('no name');
  });

  await test('mockProcessTrialNotifications returns summary', async () => {
    const { mockProcessTrialNotifications } = await import('../lib/mocks/trial-notifications.mock');
    const result = mockProcessTrialNotifications('academy-1');
    if (typeof result.sent !== 'number') throw new Error('no sent count');
    if (!Array.isArray(result.results)) throw new Error('no results array');
  });

  // ── 3. Service functions (mock mode) ──────────────────────────

  console.log('\n🔌 3. Service Functions (mock mode)\n');

  await test('registerTrialStudent via mock', async () => {
    const { registerTrialStudent } = await import('../lib/api/trial.service');
    const result = await registerTrialStudent('academy-1', {
      name: 'Mock Test',
      phone: '5511988887777',
      source: 'website',
      modalities_interest: ['muay_thai'],
      experience_level: 'beginner',
    });
    if (!result) throw new Error('returned null');
    if (!result.id) throw new Error('no id');
  });

  await test('listTrialStudents via mock', async () => {
    const { listTrialStudents } = await import('../lib/api/trial.service');
    const result = await listTrialStudents('academy-1');
    if (!Array.isArray(result)) throw new Error('not array');
  });

  await test('getTrialMetrics via mock', async () => {
    const { getTrialMetrics } = await import('../lib/api/trial.service');
    const result = await getTrialMetrics('academy-1');
    if (typeof result.active_now !== 'number') throw new Error('invalid metrics');
  });

  await test('getTrialConfig via mock', async () => {
    const { getTrialConfig } = await import('../lib/api/trial.service');
    const result = await getTrialConfig('academy-1');
    if (!result) throw new Error('returned null');
  });

  await test('getMyTrialInfo via mock', async () => {
    const { getMyTrialInfo } = await import('../lib/api/trial.service');
    const result = await getMyTrialInfo('academy-1');
    if (!result) throw new Error('returned null');
  });

  await test('generateWelcomeWhatsAppLink returns URL', async () => {
    const { generateWelcomeWhatsAppLink } = await import('../lib/api/trial.service');
    const url = generateWelcomeWhatsAppLink({
      id: 'test',
      academy_id: 'academy-1',
      name: 'Test User',
      phone: '5511999999999',
      source: 'walk_in',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'beginner',
      has_health_issues: false,
      trial_start_date: '2026-03-20',
      trial_end_date: '2026-03-27',
      trial_classes_attended: 0,
      trial_classes_limit: 10,
      status: 'active',
      expiry_notified: false,
      follow_up_done: false,
      created_at: '2026-03-20',
      updated_at: '2026-03-20',
    } as any);
    if (!url.startsWith('https://wa.me/')) throw new Error('not a whatsapp link');
  });

  await test('generateFollowUpWhatsAppLink returns URL for all types', async () => {
    const { generateFollowUpWhatsAppLink } = await import('../lib/api/trial.service');
    const student = {
      id: 'test',
      academy_id: 'academy-1',
      name: 'Test User',
      phone: '5511999999999',
      source: 'walk_in',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'beginner',
      has_health_issues: false,
      trial_start_date: '2026-03-20',
      trial_end_date: '2026-03-27',
      trial_classes_attended: 0,
      trial_classes_limit: 10,
      status: 'active',
      expiry_notified: false,
      follow_up_done: false,
      created_at: '2026-03-20',
      updated_at: '2026-03-20',
    } as any;
    for (const type of ['day3', 'day5', 'expiry', 'offer'] as const) {
      const url = generateFollowUpWhatsAppLink(student, type);
      if (!url.startsWith('https://wa.me/')) throw new Error(`${type}: not a whatsapp link`);
    }
  });

  // ── 4. Page Files Exist ──────────────────────────────────────

  console.log('\n📄 4. Page Files Exist\n');

  const fs = await import('fs');
  const pagePaths = [
    'app/(admin)/admin/experimental/page.tsx',
    'app/(admin)/admin/experimental/novo/page.tsx',
    'app/(admin)/admin/experimental/[id]/page.tsx',
    'app/(admin)/admin/experimental/config/page.tsx',
    'app/(main)/dashboard/trial/page.tsx',
    'app/(main)/dashboard/trial/feedback/page.tsx',
    'app/api/cron/trial-notifications/route.ts',
  ];

  for (const p of pagePaths) {
    const fullPath = `${process.cwd()}/${p}`;
    if (fs.existsSync(fullPath)) {
      PASS(`Page exists: ${p}`);
    } else {
      FAIL(`Page exists: ${p}`, 'File not found');
    }
  }

  // ── 5. Service Files Exist ──────────────────────────────────

  console.log('\n📁 5. Service & Mock Files\n');

  const servicePaths = [
    'lib/api/trial.service.ts',
    'lib/api/trial-notifications.service.ts',
    'lib/mocks/trial.mock.ts',
    'lib/mocks/trial-notifications.mock.ts',
    'scripts/seed-trial-students.ts',
    'supabase/migrations/065_trial_student.sql',
  ];

  for (const p of servicePaths) {
    const fullPath = `${process.cwd()}/${p}`;
    if (fs.existsSync(fullPath)) {
      PASS(`File exists: ${p}`);
    } else {
      FAIL(`File exists: ${p}`, 'File not found');
    }
  }

  // ── 6. Admin Dashboard TrialCard ────────────────────────────

  console.log('\n🎯 6. Dashboard Integration\n');

  await test('Admin dashboard imports TrialCard', async () => {
    const content = fs.readFileSync(`${process.cwd()}/app/(admin)/admin/page.tsx`, 'utf-8');
    if (!content.includes('TrialCard')) throw new Error('TrialCard not found in admin page');
    if (!content.includes('getTrialMetrics')) throw new Error('getTrialMetrics not imported');
    if (!content.includes('listTrialStudents')) throw new Error('listTrialStudents not imported');
  });

  await test('Professor dashboard imports TrialStudentsPreview', async () => {
    const content = fs.readFileSync(`${process.cwd()}/app/(professor)/professor/page.tsx`, 'utf-8');
    if (!content.includes('TrialStudentsPreview')) throw new Error('TrialStudentsPreview not found');
    if (!content.includes('listTrialStudents')) throw new Error('listTrialStudents not imported');
  });

  await test('Reception dashboard has experimental link', async () => {
    const content = fs.readFileSync(`${process.cwd()}/app/(recepcao)/recepcao/page.tsx`, 'utf-8');
    if (!content.includes('/admin/experimental/novo')) throw new Error('trial link not found');
  });

  await test('AdminShell has experimental menu item', async () => {
    const content = fs.readFileSync(`${process.cwd()}/components/shell/AdminShell.tsx`, 'utf-8');
    if (!content.includes('/admin/experimental')) throw new Error('experimental menu not found');
  });

  await test('Landing page has trial form', async () => {
    const content = fs.readFileSync(`${process.cwd()}/app/page.tsx`, 'utf-8');
    if (!content.includes('TrialFormSection') && !content.includes('registerTrialFromWebsite')) {
      throw new Error('trial form not found in landing page');
    }
  });

  // ── 7. Migration File ──────────────────────────────────────

  console.log('\n🗄  7. Migration Verification\n');

  await test('Migration 065 creates trial_students table', async () => {
    const content = fs.readFileSync(`${process.cwd()}/supabase/migrations/065_trial_student.sql`, 'utf-8');
    if (!content.includes('CREATE TABLE')) throw new Error('no CREATE TABLE');
    if (!content.includes('trial_students')) throw new Error('trial_students not found');
    if (!content.includes('trial_activity_log')) throw new Error('trial_activity_log not found');
    if (!content.includes('trial_config')) throw new Error('trial_config not found');
  });

  await test('Migration 065 updates get_my_academy_ids', async () => {
    const content = fs.readFileSync(`${process.cwd()}/supabase/migrations/065_trial_student.sql`, 'utf-8');
    if (!content.includes('get_my_academy_ids')) throw new Error('get_my_academy_ids not updated');
    if (!content.includes("'trial'")) throw new Error('trial status not included');
  });

  await test('Migration 065 enables RLS', async () => {
    const content = fs.readFileSync(`${process.cwd()}/supabase/migrations/065_trial_student.sql`, 'utf-8');
    if (!content.includes('ENABLE ROW LEVEL SECURITY')) throw new Error('RLS not enabled');
    if (!content.includes('get_my_academy_ids()')) throw new Error('RLS policy not using get_my_academy_ids');
  });

  // ── Summary ─────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 RESULTS: ${pass} PASS / ${fail} FAIL / ${pass + fail} TOTAL`);
  console.log(`   Score: ${pass}/${pass + fail} (${Math.round((pass / (pass + fail)) * 100)}%)\n`);

  if (fail > 0) {
    console.log('❌ FAILED TESTS:');
    for (const r of results.filter((r) => r.status === 'FAIL')) {
      console.log(`   - ${r.name}: ${r.detail}`);
    }
    console.log('');
  }

  process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
