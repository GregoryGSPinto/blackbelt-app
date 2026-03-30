/**
 * Testa 10 fluxos E2E contra o Supabase real.
 *
 * Schema-aware: profiles NAO tem email/academy_id.
 * Memberships liga profiles a academies.
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/test-real-flows.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

// Admin client — bypasses RLS for data queries
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Auth client — uses anon key for login tests (simulates real app)
const authClient = createClient(supabaseUrl, anonKey || serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testFlows() {
  let pass = 0;
  let fail = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      pass++;
    } else {
      console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`);
      fail++;
    }
  }

  // ═══════════════════════════════════════════
  // FLUXO 1 — Login admin
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 1: Login admin ===');
  const { data: login, error: loginErr } = await authClient.auth.signInWithPassword({
    email: 'admin@guerreiros.com',
    password: 'BlackBelt@2026',
  });
  assert('Login admin@guerreiros.com', !!login?.user, loginErr?.message);
  const adminUserId = login?.user?.id;

  // ═══════════════════════════════════════════
  // FLUXO 2 — Buscar profile (via user_id, NOT email)
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 2: Profile ===');
  let adminProfileId: string | null = null;

  if (adminUserId) {
    const { data: profiles, error: profileErr } = await admin
      .from('profiles')
      .select('id, user_id, role, display_name')
      .eq('user_id', adminUserId);

    const profile = profiles?.find((p: any) => p.role === 'admin') ?? profiles?.[0];
    assert('Profile existe', !!profile, profileErr?.message);
    assert('Profile role e admin', profile?.role === 'admin', `role=${profile?.role}`);
    assert('Profile tem display_name', !!profile?.display_name, `display_name=${profile?.display_name}`);
    adminProfileId = profile?.id || null;
  } else {
    assert('Profile existe', false, 'user_id nao disponivel (login falhou)');
  }

  // ═══════════════════════════════════════════
  // FLUXO 3 — Buscar academia (via memberships)
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 3: Academia ===');
  let academyId: string | null = null;

  if (adminProfileId) {
    const { data: membership, error: membErr } = await admin
      .from('memberships')
      .select('academy_id, role, status')
      .eq('profile_id', adminProfileId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    assert('Membership existe', !!membership, membErr?.message);
    assert('Membership role e admin', membership?.role === 'admin', `role=${membership?.role}`);
    assert('Membership status ativa', membership?.status === 'active', `status=${membership?.status}`);

    academyId = membership?.academy_id || null;

    if (academyId) {
      const { data: academy, error: acadErr } = await admin
        .from('academies')
        .select('id, name, status')
        .eq('id', academyId)
        .single();

      assert('Academia existe', !!academy, acadErr?.message);
      assert('Academia tem nome', !!academy?.name, `name=${academy?.name}`);
      assert('Academia status ativa', academy?.status === 'active', `status=${academy?.status}`);
    }
  } else {
    assert('Membership existe', false, 'profile_id nao disponivel');
  }

  // ═══════════════════════════════════════════
  // FLUXO 4 — Listar turmas
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 4: Turmas ===');
  if (academyId) {
    const { data: turmas, error: turmasErr } = await admin
      .from('classes')
      .select('id, name')
      .eq('academy_id', academyId);

    assert('Turmas existem', (turmas?.length || 0) > 0, turmasErr?.message);
    assert('Tem pelo menos 5 turmas', (turmas?.length || 0) >= 5, `count=${turmas?.length}`);
  } else {
    assert('Turmas existem', false, 'academy_id nao disponivel');
  }

  // ═══════════════════════════════════════════
  // FLUXO 5 — Listar alunos (via memberships)
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 5: Alunos ===');
  if (academyId) {
    const { data: alunos, error: alunosErr } = await admin
      .from('memberships')
      .select('id, profile_id, role')
      .eq('academy_id', academyId)
      .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']);

    assert('Alunos existem', (alunos?.length || 0) > 0, alunosErr?.message);
    assert('Tem pelo menos 3 alunos', (alunos?.length || 0) >= 3, `count=${alunos?.length}`);
  } else {
    assert('Alunos existem', false, 'academy_id nao disponivel');
  }

  // ═══════════════════════════════════════════
  // FLUXO 6 — Check-ins
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 6: Check-ins ===');
  if (academyId) {
    const { count, error: checkErr } = await admin
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId);

    assert('Check-ins existem', (count || 0) > 0, checkErr?.message);
    assert('Tem pelo menos 50 check-ins', (count || 0) >= 50, `count=${count}`);
  } else {
    assert('Check-ins existem', false, 'academy_id nao disponivel');
  }

  // ═══════════════════════════════════════════
  // FLUXO 7 — Faturas
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 7: Faturas ===');
  {
    const { count, error: invErr } = await admin
      .from('invoices')
      .select('id', { count: 'exact', head: true });

    assert('Faturas existem', (count || 0) > 0, invErr?.message || `count=${count}`);
  }

  // ═══════════════════════════════════════════
  // FLUXO 8 — Planos
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 8: Planos ===');
  {
    const { data: planos, error: planErr } = await admin
      .from('platform_plans')
      .select('id, tier, name, price_monthly');

    assert('Planos existem', (planos?.length || 0) > 0, planErr?.message);
    assert('Tem 5 planos', (planos?.length || 0) === 5, `count=${planos?.length}`);

    const pro = planos?.find((p: any) => p.tier === 'pro');
    assert('Pro custa R$249', pro?.price_monthly === 24900, `price_monthly=${pro?.price_monthly}`);
  }

  // ═══════════════════════════════════════════
  // FLUXO 9 — Guardian links
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 9: Guardian links ===');
  {
    const { data: links, error: linkErr } = await admin
      .from('guardian_links')
      .select('id, guardian_id, child_id, relationship');

    assert('Guardian links existem', (links?.length || 0) > 0, linkErr?.message || `count=${links?.length}`);

    if (links && links.length > 0) {
      assert('Relationship e parent', links[0].relationship === 'parent', `relationship=${links[0].relationship}`);
    }
  }

  // ═══════════════════════════════════════════
  // FLUXO 10 — Login superadmin
  // ═══════════════════════════════════════════
  console.log('\n=== FLUXO 10: Login superadmin ===');
  // Use a fresh auth client so the previous signIn doesn't interfere
  const authClient2 = createClient(supabaseUrl, anonKey || serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: superLogin, error: superErr } = await authClient2.auth.signInWithPassword({
    email: 'greg@email.com',
    password: 'BlackBelt@Greg1994',
  });
  assert('Login superadmin', !!superLogin?.user, superErr?.message);

  if (superLogin?.user) {
    const { data: superProfiles } = await admin
      .from('profiles')
      .select('id, role')
      .eq('user_id', superLogin.user.id);

    const superProfile = superProfiles?.find((p: any) => p.role === 'superadmin') ?? superProfiles?.[0];
    assert('Superadmin profile role', superProfile?.role === 'superadmin', `role=${superProfile?.role}`);
  }

  // ═══════════════════════════════════════════
  // RESULTADO
  // ═══════════════════════════════════════════
  console.log('\n════════════════════════════════');
  console.log(`Passou: ${pass}`);
  console.log(`Falhou: ${fail}`);
  console.log(`Score: ${Math.round((pass / (pass + fail)) * 100)}%`);
  console.log('════════════════════════════════\n');

  if (fail > 0) {
    process.exit(1);
  }
}

testFlows().catch(console.error);
