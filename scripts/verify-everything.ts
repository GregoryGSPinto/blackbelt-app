// ═══════════════════════════════════════════════════════════════
// BLACKBELT v2 — VERIFICACAO COMPLETA
// Roda com: SUPABASE_SERVICE_ROLE_KEY=xxx NEXT_PUBLIC_SUPABASE_URL=xxx npx tsx scripts/verify-everything.ts
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log('═══ BLACKBELT v2 — VERIFICACAO COMPLETA ═══\n');
  let pass = 0;
  let fail = 0;

  function check(ok: boolean, label: string, detail?: string) {
    if (ok) {
      console.log(`  ✅ ${label}${detail ? ` (${detail})` : ''}`);
      pass++;
    } else {
      console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
      fail++;
    }
  }

  // 1. Verificar todas as tabelas
  console.log('--- Tabelas ---');
  const tables = [
    'people', 'family_links', 'academy_teen_config',
    'profile_evolution_log', 'data_health_issues',
    'family_invoices', 'student_timeline_events',
    'account_deletion_log', 'audit_log', 'webhook_log',
    'payment_customers', 'support_tickets',
  ];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    check(!error, table, error ? error.message : `${count} registros`);
  }

  // 2. Verificar colunas novas em profiles
  console.log('\n--- Colunas em profiles ---');
  const { data: sample, error: sampleErr } = await supabase
    .from('profiles')
    .select('person_id, lifecycle_status, parental_controls, needs_password_change')
    .limit(1)
    .maybeSingle();
  if (sampleErr) {
    check(false, 'colunas profiles', sampleErr.message);
  } else {
    check(true, 'person_id', 'presente');
    check(true, 'lifecycle_status', sample?.lifecycle_status ?? 'presente');
    check(true, 'parental_controls', 'presente');
    check(true, 'needs_password_change', 'presente');
  }

  // 3. Verificar colunas novas em invoices
  console.log('\n--- Colunas em invoices ---');
  const { error: invErr } = await supabase
    .from('invoices')
    .select('external_payment_id, payment_method, payment_link, pix_qr_code, pix_payload')
    .limit(1)
    .maybeSingle();
  check(!invErr, 'invoice payment columns', invErr ? invErr.message : 'todas presentes');

  // 4. Verificar funcoes
  console.log('\n--- Funcoes SQL ---');

  const { error: ageErr } = await supabase.rpc('calculate_age', { p_birth_date: '2000-01-01' });
  check(!ageErr, 'calculate_age', ageErr?.message);

  const { error: guardErr } = await supabase.rpc('get_guardians', { p_dependent_id: '00000000-0000-0000-0000-000000000000' });
  check(!guardErr || !guardErr.message.includes('function'), 'get_guardians', guardErr?.message || 'existe');

  const { error: depErr } = await supabase.rpc('get_dependents', { p_guardian_id: '00000000-0000-0000-0000-000000000000' });
  check(!depErr || !depErr.message.includes('function'), 'get_dependents', depErr?.message || 'existe');

  const { error: detectErr } = await supabase.rpc('detect_data_health_issues', { p_academy_id: '00000000-0000-0000-0000-000000000000' });
  check(!detectErr || !detectErr.message.includes('function'), 'detect_data_health_issues', detectErr?.message || 'existe');

  // 5. Verificar vinculos familiares
  console.log('\n--- Familias ---');
  const { data: links } = await supabase
    .from('family_links')
    .select('relationship, guardian:guardian_person_id(full_name), dependent:dependent_person_id(full_name)')
    .limit(10);

  if (links && links.length > 0) {
    check(true, `${links.length} vinculos encontrados`);
    for (const l of links) {
      const g = l.guardian as unknown as { full_name: string } | null;
      const d = l.dependent as unknown as { full_name: string } | null;
      console.log(`    ${g?.full_name || '?'} → ${d?.full_name || '?'} (${l.relationship})`);
    }
  } else {
    check(false, 'vinculos familiares', 'nenhum encontrado — rode seed-everything.ts');
  }

  // 6. Verificar announcements columns
  console.log('\n--- Announcements ---');
  const { error: annErr } = await supabase
    .from('announcements')
    .select('target_config, recipient_count, read_count')
    .limit(1)
    .maybeSingle();
  check(!annErr, 'announcement target columns', annErr?.message || 'presentes');

  // Resultado
  console.log(`\n═══ RESULTADO ═══`);
  console.log(`  Passou: ${pass}`);
  console.log(`  Falhou: ${fail}`);
  console.log(`  Total: ${pass + fail}`);

  if (fail === 0) {
    console.log('\n🎉 TUDO VERIFICADO! O banco esta pronto.');
  } else {
    console.log(`\n⚠️ ${fail} item(ns) precisam de atencao.`);
  }
}

verify().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
