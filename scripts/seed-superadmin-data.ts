import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ── Helpers ────────────────────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function randomEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Constants ──────────────────────────────────────────────────
const DEMO_ACADEMY = '809f2763-0096-4cfa-8057-b5b029cbc62f';

const PLAN_IDS: Record<string, string> = {
  starter: 'f66c5fe6-3f82-4917-9e78-a34751d6b2ac',
  essencial: '24fa41c2-40bf-42b0-adb6-7abaf1941af2',
  pro: '939e3cad-b01b-4bf0-ac6c-008f995b4229',
  blackbelt: 'ad7c94e0-44a5-42c1-abb9-aeef3882b919',
  enterprise: '9ecec9cc-6516-4201-9921-7c43d2a64633',
};

const TIER_IDS: Record<string, string> = {
  starter: 'd166a88a-e42b-4e6e-95a2-205ac5ba16e2',
  growth: '04f3e515-6b72-4805-adb9-92ca02874b39',
  pro: '35f46b43-4aac-4147-9af2-b281f0602281',
  scale: '4fef2498-a0c0-49b2-afbc-f05d2e64497a',
  enterprise: '5d40f419-45d1-499b-acd8-b4ec2ff3c0f9',
};

const PLANS: Record<string, { name: string; cents: number; tier: string }> = {
  starter: { name: 'Starter', cents: 7900, tier: 'starter' },
  essencial: { name: 'Essencial', cents: 14900, tier: 'growth' },
  pro: { name: 'Pro', cents: 24900, tier: 'pro' },
  blackbelt: { name: 'Black Belt', cents: 39700, tier: 'scale' },
  enterprise: { name: 'Enterprise', cents: 89900, tier: 'enterprise' },
};

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🌱 SEED SUPERADMIN DATA\n');

  // ──────────────────────────────────────────────────────────────
  // 1. Get all real academies (skip Smoke tests)
  // ──────────────────────────────────────────────────────────────
  const { data: allAcademies } = await supabase
    .from('academies')
    .select('id, name, status, plan_id, subscription_status');

  if (!allAcademies || allAcademies.length === 0) {
    console.error('❌ Nenhuma academia encontrada');
    process.exit(1);
  }

  const realAcademies = allAcademies.filter((a) => !a.name.includes('Smoke Academy'));
  const smokeAcademies = allAcademies.filter((a) => a.name.includes('Smoke Academy'));
  console.log(`📊 Academias: ${realAcademies.length} reais, ${smokeAcademies.length} smoke tests\n`);

  // ──────────────────────────────────────────────────────────────
  // 2. Assign plans to ALL academies
  // ──────────────────────────────────────────────────────────────
  console.log('── 1/8: Assigning plans to academies ──');

  const planDist = ['starter', 'starter', 'essencial', 'essencial', 'essencial', 'pro', 'pro', 'blackbelt'];
  const statusDist = ['active', 'active', 'active', 'active', 'active', 'active', 'trial'];

  // Demo academy = Pro + active
  await supabase
    .from('academies')
    .update({
      plan_id: PLAN_IDS.pro,
      subscription_status: 'active',
      status: 'active',
      city: 'Vespasiano',
      state: 'MG',
      phone: '(31) 99876-5432',
      email: 'contato@guerreirosdotatame.com.br',
    })
    .eq('id', DEMO_ACADEMY);

  // Other real academies
  const assignedPlans: { id: string; planKey: string; status: string }[] = [
    { id: DEMO_ACADEMY, planKey: 'pro', status: 'active' },
  ];

  for (const ac of realAcademies) {
    if (ac.id === DEMO_ACADEMY) continue;
    const planKey = randomEl(planDist);
    const status = randomEl(statusDist);
    await supabase
      .from('academies')
      .update({
        plan_id: PLAN_IDS[planKey],
        subscription_status: status === 'active' ? 'active' : 'trial',
        status,
      })
      .eq('id', ac.id);
    assignedPlans.push({ id: ac.id, planKey, status });
  }

  // Smoke academies → Starter trial
  for (const ac of smokeAcademies) {
    assignedPlans.push({ id: ac.id, planKey: 'starter', status: 'trial' });
  }

  console.log(`✅ ${assignedPlans.length} academias com plano atribuído\n`);

  // ──────────────────────────────────────────────────────────────
  // 3. Create academy_subscriptions
  // ──────────────────────────────────────────────────────────────
  console.log('── 2/8: Creating academy_subscriptions ──');

  // Remove all existing except DEMO
  await supabase
    .from('academy_subscriptions')
    .delete()
    .neq('academy_id', DEMO_ACADEMY);

  const subs: Record<string, unknown>[] = [];
  for (const assign of assignedPlans) {
    if (assign.id === DEMO_ACADEMY) continue; // keep existing
    const plan = PLANS[assign.planKey];
    const createdDaysAgo = 10 + Math.floor(Math.random() * 150);
    const isActive = assign.status === 'active';

    // Insert all as 'trial' first (check constraint), then update to 'active'
    subs.push({
      academy_id: assign.id,
      tier_id: TIER_IDS[plan.tier],
      plan_id: assign.planKey,
      plan_name: plan.name,
      price_cents: plan.cents,
      total_price: plan.cents / 100,
      status: 'trial',
      billing_cycle: 'monthly',
      billing_type: randomEl(['pix', 'credit_card', 'boleto']),
      paid_modules: [],
      additional_professors: 0,
      additional_units: 0,
      trial_started_at: daysAgo(createdDaysAgo + 7),
      trial_ends_at: daysAgo(createdDaysAgo),
      plan_started_at: isActive ? daysAgo(createdDaysAgo) : null,
      current_period_start: daysAgo(createdDaysAgo % 30),
      created_at: daysAgo(createdDaysAgo + 7),
      updated_at: daysAgo(0),
    });
  }

  // Update demo academy subscription
  await supabase
    .from('academy_subscriptions')
    .update({
      plan_name: 'Pro',
      price_cents: 24900,
      status: 'active',
      plan_started_at: daysAgo(120),
      updated_at: new Date().toISOString(),
    })
    .eq('academy_id', DEMO_ACADEMY);

  if (subs.length > 0) {
    const { error } = await supabase.from('academy_subscriptions').insert(subs);
    if (error) console.error('❌ academy_subscriptions insert:', error.message);
    else {
      console.log(`✅ ${subs.length} subscriptions criadas (trial)`);
      // Now update active ones
      const activeIds = assignedPlans.filter((a) => a.status === 'active' && a.id !== DEMO_ACADEMY).map((a) => a.id);
      if (activeIds.length > 0) {
        const { error: updateErr } = await supabase
          .from('academy_subscriptions')
          .update({ status: 'active', plan_started_at: daysAgo(60), updated_at: new Date().toISOString() })
          .in('academy_id', activeIds);
        if (updateErr) console.error('❌ academy_subscriptions update to active:', updateErr.message);
        else console.log(`✅ ${activeIds.length} subscriptions → active\n`);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 4. Create billing_history (6 meses)
  // ──────────────────────────────────────────────────────────────
  console.log('── 3/8: Creating billing_history (6 meses) ──');
  await supabase.from('billing_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const now = new Date();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const bills: Record<string, unknown>[] = [];
  for (const assign of assignedPlans) {
    const plan = PLANS[assign.planKey];
    for (let m = 5; m >= 0; m--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const paid = Math.random() > 0.08; // 92% payment rate
      const paidDate = paid
        ? new Date(periodStart.getTime() + Math.random() * 5 * 86400000)
        : null;

      bills.push({
        academy_id: assign.id,
        amount: plan.cents / 100,
        description: `Mensalidade ${plan.name} — ${monthNames[periodStart.getMonth()]}/${periodStart.getFullYear()}`,
        status: paid ? 'paid' : (Math.random() > 0.5 ? 'pending' : 'failed'),
        payment_method: randomEl(['pix', 'credit_card', 'boleto']),
        paid_at: paidDate?.toISOString() ?? null,
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
        created_at: periodStart.toISOString(),
      });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < bills.length; i += 50) {
    const batch = bills.slice(i, i + 50);
    const { error } = await supabase.from('billing_history').insert(batch);
    if (error) {
      console.error(`❌ billing_history batch ${i}:`, error.message);
    }
  }
  console.log(`✅ ${bills.length} registros de billing\n`);

  // ──────────────────────────────────────────────────────────────
  // 5. Create platform_settings (analytics cache)
  // ──────────────────────────────────────────────────────────────
  console.log('── 4/8: Creating platform_settings ──');

  // Delete existing
  await supabase.from('platform_settings').delete().in('key', ['product_analytics', 'health_overview', 'total_platform_students']);

  const { count: totalStudents } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
    .eq('status', 'active');

  const productAnalytics = {
    dau: 42 + Math.floor(Math.random() * 20),
    wau: 180 + Math.floor(Math.random() * 50),
    mau: 320 + Math.floor(Math.random() * 80),
    features: [
      { name: 'Check-in', sessions: 892, growth: 12 },
      { name: 'Financeiro', sessions: 654, growth: 8 },
      { name: 'Turmas', sessions: 543, growth: 15 },
      { name: 'Vídeo-aulas', sessions: 421, growth: 22 },
      { name: 'Gamificação', sessions: 398, growth: 35 },
      { name: 'Relatórios', sessions: 312, growth: -3 },
      { name: 'Comunicação', sessions: 287, growth: 18 },
      { name: 'Campeonatos', sessions: 201, growth: 45 },
      { name: 'Currículo', sessions: 176, growth: 28 },
      { name: 'Loja', sessions: 89, growth: -12 },
    ],
    peakHours: Array.from({ length: 18 }, (_, i) => {
      const hour = i + 6;
      const base = hour >= 17 && hour <= 20 ? 100 : hour >= 14 && hour <= 16 ? 45 : 20;
      return { hour: `${String(hour).padStart(2, '0')}:00`, sessions: base + Math.floor(Math.random() * 50) };
    }),
    devices: { mobile: 62, desktop: 31, tablet: 7 },
    nps: 72,
    updatedAt: new Date().toISOString(),
  };

  const healthOverview = {
    averageScore: 68,
    distribution: { excellent: 3, good: 5, fair: 6, poor: 2, critical: 2 },
    trend: 'improving',
    topFactors: [
      { name: 'Presença Regular', weight: 25, avgScore: 72 },
      { name: 'Engajamento Digital', weight: 20, avgScore: 64 },
      { name: 'Saúde Financeira', weight: 25, avgScore: 71 },
      { name: 'Retenção', weight: 20, avgScore: 66 },
      { name: 'Crescimento', weight: 10, avgScore: 58 },
    ],
    updatedAt: new Date().toISOString(),
  };

  const { error: settingsError } = await supabase.from('platform_settings').insert([
    { key: 'product_analytics', value: productAnalytics, updated_at: new Date().toISOString() },
    { key: 'health_overview', value: healthOverview, updated_at: new Date().toISOString() },
    { key: 'total_platform_students', value: { count: totalStudents ?? 0 }, updated_at: new Date().toISOString() },
  ]);
  if (settingsError) console.error('❌ platform_settings:', settingsError.message);
  else console.log('✅ 3 platform_settings criados\n');

  // ──────────────────────────────────────────────────────────────
  // 6. Create platform_alerts
  // ──────────────────────────────────────────────────────────────
  console.log('── 5/8: Creating platform_alerts ──');
  await supabase.from('platform_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const alertAcademies = realAcademies.slice(0, 5);
  const alerts = [
    {
      type: 'trial_expiring',
      message: `Trial de "${alertAcademies[1]?.name ?? 'Academia Demo'}" expira em 2 dias`,
      severity: 'high',
      resolved: false,
      created_at: daysAgo(1),
    },
    {
      type: 'payment_failed',
      message: `Pagamento falhou para "${alertAcademies[2]?.name ?? 'Academia X'}"`,
      severity: 'high',
      resolved: false,
      created_at: daysAgo(2),
    },
    {
      type: 'usage_exceeded',
      message: `"${alertAcademies[0]?.name ?? 'Guerreiros'}" ultrapassou limite de alunos do plano`,
      severity: 'medium',
      resolved: false,
      created_at: daysAgo(3),
    },
    {
      type: 'inactive_academy',
      message: `"${alertAcademies[3]?.name ?? 'Academia Y'}" sem login há 45 dias`,
      severity: 'low',
      resolved: false,
      created_at: daysAgo(5),
    },
    {
      type: 'payment_failed',
      message: `Renovação de "${alertAcademies[4]?.name ?? 'Academia Z'}" falhou 3x consecutivas`,
      severity: 'high',
      resolved: true,
      created_at: daysAgo(10),
      updated_at: daysAgo(7),
    },
    {
      type: 'churn_risk',
      message: `"${alertAcademies[1]?.name ?? 'Academia Demo'}" marcada como risco de churn (health score < 30)`,
      severity: 'high',
      resolved: false,
      created_at: daysAgo(1),
    },
  ];

  const { error: alertError } = await supabase.from('platform_alerts').insert(alerts);
  if (alertError) console.error('❌ platform_alerts:', alertError.message);
  else console.log(`✅ ${alerts.length} alertas criados\n`);

  // ──────────────────────────────────────────────────────────────
  // 7. Create seasons + xp_ledger
  // ──────────────────────────────────────────────────────────────
  console.log('── 6/8: Creating seasons ──');

  const { count: existingSeasons } = await supabase.from('seasons').select('*', { count: 'exact', head: true });
  if (!existingSeasons || existingSeasons === 0) {
    // seasons schema: name, theme, status, start_date, end_date, academy_id, rewards
    const { error: seasonError } = await supabase.from('seasons').insert([
      {
        name: 'Temporada Fogo Interior',
        theme: 'Primeira temporada BlackBelt — conquiste XP e suba no ranking!',
        start_date: dateStr(90),
        end_date: dateStr(-90),
        status: 'active',
        academy_id: DEMO_ACADEMY,
        rewards: { xp_multiplier: 1.5, badge: 'fogo_interior' },
        created_at: daysAgo(90),
      },
      {
        name: 'Pré-Temporada',
        theme: 'Fase de testes do sistema de gamificação',
        start_date: dateStr(180),
        end_date: dateStr(91),
        status: 'ended',
        academy_id: DEMO_ACADEMY,
        rewards: { xp_multiplier: 1.0, badge: 'pioneer' },
        created_at: daysAgo(180),
      },
    ]);
    if (seasonError) console.error('❌ seasons:', seasonError.message);
    else console.log('✅ 2 seasons criadas\n');
  } else {
    console.log(`⏭️ ${existingSeasons} seasons já existem\n`);
  }

  // XP Ledger
  console.log('── 7/8: Creating xp_ledger ──');
  await supabase.from('xp_ledger').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  {
    const { data: studentMembers } = await supabase
      .from('memberships')
      .select('profile_id, academy_id')
      .in('role', ['aluno_adulto', 'aluno_teen'])
      .eq('status', 'active')
      .limit(25);

    // xp_ledger schema: student_id, amount, reason, reference_id, created_at
    // Need student IDs, not profile IDs
    const { data: studentIds } = await supabase
      .from('students')
      .select('id, academy_id')
      .limit(25);

    const xpReasons = [
      { reason: 'checkin', xp: 10 },
      { reason: 'streak_7', xp: 50 },
      { reason: 'streak_30', xp: 200 },
      { reason: 'belt_promotion', xp: 500 },
      { reason: 'first_class', xp: 25 },
      { reason: 'challenge_complete', xp: 100 },
      { reason: 'video_watched', xp: 15 },
      { reason: 'tournament', xp: 150 },
    ];

    if (studentIds && studentIds.length > 0) {
      const xpEntries: Record<string, unknown>[] = [];
      for (const student of studentIds) {
        const eventCount = 5 + Math.floor(Math.random() * 15);
        for (let i = 0; i < eventCount; i++) {
          const event = randomEl(xpReasons);
          xpEntries.push({
            student_id: student.id,
            amount: event.xp,
            reason: event.reason,
            created_at: daysAgo(Math.floor(Math.random() * 90)),
          });
        }
      }

      for (let i = 0; i < xpEntries.length; i += 50) {
        const batch = xpEntries.slice(i, i + 50);
        const { error } = await supabase.from('xp_ledger').insert(batch);
        if (error) console.error(`❌ xp_ledger batch ${i}:`, error.message);
      }
      console.log(`✅ ${xpEntries.length} entradas de XP criadas\n`);
    } else {
      console.log('⏭️ Sem students para popular XP\n');
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 8. Create daily_metrics (30 dias)
  // ──────────────────────────────────────────────────────────────
  console.log('── 8/8: Creating daily_metrics ──');
  // Delete existing and re-create with 30 days
  await supabase.from('daily_metrics').delete().eq('product', 'blackbelt');
  {
    // daily_metrics schema: date, product, total_users, new_users, active_users_7d,
    // total_academies, active_academies, trial_academies, churned_academies,
    // mrr_brl, new_mrr_brl, churned_mrr_brl, total_checkins, total_classes,
    // total_registrations, total_championships, avg_session_seconds
    const metrics: Record<string, unknown>[] = [];
    for (let d = 29; d >= 0; d--) {
      const baseUsers = 280 + Math.floor(Math.random() * 60);
      const baseAcademies = 14 + Math.floor(Math.random() * 4);
      metrics.push({
        date: dateStr(d),
        product: 'blackbelt',
        total_users: baseUsers + d * 2,
        new_users: Math.floor(Math.random() * 5),
        active_users_7d: Math.floor(baseUsers * 0.45) + Math.floor(Math.random() * 30),
        total_academies: baseAcademies,
        active_academies: baseAcademies - Math.floor(Math.random() * 3),
        trial_academies: 1 + Math.floor(Math.random() * 3),
        churned_academies: Math.random() > 0.85 ? 1 : 0,
        mrr_brl: 2800 + Math.floor(Math.random() * 800) + d * 15,
        new_mrr_brl: Math.floor(Math.random() * 300),
        churned_mrr_brl: Math.random() > 0.8 ? Math.floor(Math.random() * 200) : 0,
        total_checkins: 180 + Math.floor(Math.random() * 60),
        total_classes: 30 + Math.floor(Math.random() * 15),
        total_registrations: Math.floor(Math.random() * 3),
        active_championships: Math.floor(Math.random() * 2),
        avg_session_seconds: 180 + Math.floor(Math.random() * 120),
        created_at: daysAgo(d),
      });
    }
    const { error } = await supabase.from('daily_metrics').insert(metrics);
    if (error) console.error('❌ daily_metrics:', error.message);
    else console.log('✅ 30 dias de métricas criados\n');
  }

  // ──────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  🌱 SEED SUPERADMIN COMPLETO                      ║');
  console.log('╠═══════════════════════════════════════════════════╣');

  const { count: c1 } = await supabase.from('academy_subscriptions').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('billing_history').select('*', { count: 'exact', head: true });
  const { count: c3 } = await supabase.from('platform_settings').select('*', { count: 'exact', head: true });
  const { count: c4 } = await supabase.from('platform_alerts').select('*', { count: 'exact', head: true });
  const { count: c5 } = await supabase.from('seasons').select('*', { count: 'exact', head: true });
  const { count: c6 } = await supabase.from('xp_ledger').select('*', { count: 'exact', head: true });
  const { count: c7 } = await supabase.from('daily_metrics').select('*', { count: 'exact', head: true });

  console.log(`║  academies (com plan_id):    ${assignedPlans.length}`);
  console.log(`║  academy_subscriptions:      ${c1}`);
  console.log(`║  billing_history:            ${c2}`);
  console.log(`║  platform_settings:          ${c3}`);
  console.log(`║  platform_alerts:            ${c4}`);
  console.log(`║  seasons:                    ${c5}`);
  console.log(`║  xp_ledger:                  ${c6}`);
  console.log(`║  daily_metrics:              ${c7}`);
  console.log('╚═══════════════════════════════════════════════════╝');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
