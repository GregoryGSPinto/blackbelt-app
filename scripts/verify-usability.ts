// Script de verificação — checa se todas as tabelas e funções
// de usabilidade foram criadas corretamente no Supabase.
//
// RODAR: npx tsx scripts/verify-usability.ts
// REQUER: SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no .env.local

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function verify() {
  console.log('🔍 Verificando tabelas de usabilidade...\n');

  let passed = 0;
  let failed = 0;

  const tables = [
    'people',
    'family_links',
    'academy_teen_config',
    'profile_evolution_log',
    'data_health_issues',
    'family_invoices',
    'student_timeline_events',
  ];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ ${table}: ${count} registros`);
      passed++;
    }
  }

  // Verificar colunas novas em profiles
  console.log('\n🔍 Verificando colunas novas em profiles...');
  const { data: sampleProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('person_id, lifecycle_status, parental_controls, needs_password_change')
    .limit(1)
    .single();

  if (profileErr) {
    console.log(`❌ Erro ao verificar profiles: ${profileErr.message}`);
    failed++;
  } else if (sampleProfile) {
    const cols = ['person_id', 'lifecycle_status', 'parental_controls', 'needs_password_change'] as const;
    for (const col of cols) {
      const exists = sampleProfile[col] !== undefined;
      console.log(exists ? `✅ ${col}: existe` : `❌ ${col}: FALTA`);
      exists ? passed++ : failed++;
    }
  }

  // Verificar helper functions
  console.log('\n🔍 Verificando funções...');

  const fakeUUID = '00000000-0000-0000-0000-000000000000';

  const { error: gErr } = await supabase.rpc('get_guardians', {
    p_dependent_id: fakeUUID,
  });
  if (gErr?.message?.includes('function') || gErr?.message?.includes('does not exist')) {
    console.log('❌ get_guardians: NÃO EXISTE');
    failed++;
  } else {
    console.log('✅ get_guardians: existe');
    passed++;
  }

  const { error: dErr } = await supabase.rpc('get_dependents', {
    p_guardian_id: fakeUUID,
  });
  if (dErr?.message?.includes('function') || dErr?.message?.includes('does not exist')) {
    console.log('❌ get_dependents: NÃO EXISTE');
    failed++;
  } else {
    console.log('✅ get_dependents: existe');
    passed++;
  }

  const { error: dhErr } = await supabase.rpc('detect_data_health_issues', {
    p_academy_id: fakeUUID,
  });
  if (dhErr?.message?.includes('function') || dhErr?.message?.includes('does not exist')) {
    console.log('❌ detect_data_health_issues: NÃO EXISTE');
    failed++;
  } else {
    console.log('✅ detect_data_health_issues: existe');
    passed++;
  }

  const { error: caErr } = await supabase.rpc('calculate_age', {
    p_birth_date: '2000-01-01',
  });
  if (caErr?.message?.includes('function') || caErr?.message?.includes('does not exist')) {
    console.log('❌ calculate_age: NÃO EXISTE');
    failed++;
  } else {
    console.log('✅ calculate_age: existe');
    passed++;
  }

  // Verificar vínculos familiares
  console.log('\n🔍 Verificando vínculos familiares...');
  const { data: links, error: linksErr } = await supabase
    .from('family_links')
    .select('*, guardian:guardian_person_id(full_name), dependent:dependent_person_id(full_name)')
    .limit(10);

  if (linksErr) {
    console.log(`❌ Erro ao buscar vínculos: ${linksErr.message}`);
    failed++;
  } else if (!links || links.length === 0) {
    console.log('⚠️  Nenhum vínculo familiar encontrado (rode o seed primeiro)');
  } else {
    for (const link of links) {
      const guardianName = (link.guardian as { full_name: string } | null)?.full_name || '?';
      const dependentName = (link.dependent as { full_name: string } | null)?.full_name || '?';
      console.log(`  👨‍👩‍👧 ${guardianName} → ${dependentName} (${link.relationship})`);
    }
    console.log(`✅ ${links.length} vínculos familiares encontrados`);
    passed++;
  }

  // Verificar edge functions (local)
  console.log('\n🔍 Verificando edge functions (arquivos locais)...');
  const edgeFunctions = ['admin-create-user', 'evolve-profile'];
  for (const fn of edgeFunctions) {
    const localExists = fs.existsSync(`supabase/functions/${fn}/index.ts`);
    if (localExists) {
      console.log(`✅ ${fn}: arquivo existe`);
      passed++;
    } else {
      console.log(`❌ ${fn}: FALTA`);
      failed++;
    }
  }

  // Resumo
  console.log('\n═══════════════════════════════════════════');
  console.log(`🔍 Resultado: ${passed} passou, ${failed} falhou`);
  if (failed === 0) {
    console.log('🔥 TUDO OK — usabilidade configurada corretamente!');
  } else {
    console.log('⚠️  Alguns itens falharam — verifique se a migration foi rodada.');
  }
  console.log('═══════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

verify().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
