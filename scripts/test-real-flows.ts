/**
 * Testa 10 fluxos E2E contra o Supabase real.
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/test-real-flows.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testFlows() {
  let pass = 0;
  let fail = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      pass++;
    } else {
      console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`);
      fail++;
    }
  }

  // FLUXO 1 — Login
  console.log('\n=== FLUXO 1: Login ===');
  const { data: login } = await supabase.auth.signInWithPassword({
    email: 'admin@guerreiros.com', password: 'BlackBelt@2026'
  });
  assert('Login admin', !!login?.user);

  // FLUXO 2 — Buscar profile
  console.log('\n=== FLUXO 2: Profile ===');
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'admin@guerreiros.com').single();
  assert('Profile existe', !!profile);
  assert('Profile tem academy_id', !!profile?.academy_id);
  assert('Profile role é admin', profile?.role === 'admin');

  // FLUXO 3 — Buscar academia
  console.log('\n=== FLUXO 3: Academia ===');
  if (profile?.academy_id) {
    const { data: academy } = await supabase.from('academies').select('*').eq('id', profile.academy_id).single();
    assert('Academia existe', !!academy);
    assert('Academia tem nome', !!academy?.name);
    assert('Academia status ativa', academy?.status === 'active');
  }

  // FLUXO 4 — Listar turmas
  console.log('\n=== FLUXO 4: Turmas ===');
  const { data: turmas } = await supabase.from('classes').select('*').eq('academy_id', profile?.academy_id);
  assert('Turmas existem', (turmas?.length || 0) > 0);
  assert('Tem pelo menos 5 turmas', (turmas?.length || 0) >= 5);

  // FLUXO 5 — Listar alunos
  console.log('\n=== FLUXO 5: Alunos ===');
  const { data: alunos } = await supabase.from('profiles').select('*')
    .eq('academy_id', profile?.academy_id)
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']);
  assert('Alunos existem', (alunos?.length || 0) > 0);

  // FLUXO 6 — Check-ins
  console.log('\n=== FLUXO 6: Check-ins ===');
  const { count } = await supabase.from('checkins').select('*', { count: 'exact', head: true })
    .eq('academy_id', profile?.academy_id);
  assert('Check-ins existem', (count || 0) > 0);
  assert('Tem pelo menos 50 check-ins', (count || 0) >= 50);

  // FLUXO 7 — Faturas
  console.log('\n=== FLUXO 7: Faturas ===');
  const { count: fCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
    .eq('academy_id', profile?.academy_id);
  assert('Faturas existem', (fCount || 0) > 0);

  // FLUXO 8 — Planos
  console.log('\n=== FLUXO 8: Planos ===');
  const { data: planos } = await supabase.from('platform_plans').select('*');
  assert('Planos existem', (planos?.length || 0) > 0);
  const pro = planos?.find((p: any) => p.tier === 'pro');
  assert('Pro custa R$249', pro?.price_monthly === 24900);

  // FLUXO 9 — Guardian links
  console.log('\n=== FLUXO 9: Guardian links ===');
  const { data: links } = await supabase.from('guardian_links').select('*');
  assert('Guardian links existem', (links?.length || 0) > 0);

  // FLUXO 10 — Multi-profile (superadmin)
  console.log('\n=== FLUXO 10: Multi-profile ===');
  const { data: superLogin } = await supabase.auth.signInWithPassword({
    email: 'greg@email.com', password: 'BlackBelt@Greg1994'
  });
  assert('Login superadmin', !!superLogin?.user);

  // RESULTADO
  console.log('\n════════════════════════════════');
  console.log(`✅ Passou: ${pass}`);
  console.log(`❌ Falhou: ${fail}`);
  console.log(`📊 Score: ${Math.round((pass / (pass + fail)) * 100)}%`);
  console.log('════════════════════════════════\n');

  if (fail > 0) {
    process.exit(1);
  }
}

testFlows().catch(console.error);
