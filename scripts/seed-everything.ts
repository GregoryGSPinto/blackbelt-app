// ═══════════════════════════════════════════════════════════════
// BLACKBELT v2 — SEED COMPLETO
// Roda com: SUPABASE_SERVICE_ROLE_KEY=xxx NEXT_PUBLIC_SUPABASE_URL=xxx npx tsx scripts/seed-everything.ts
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

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return !error;
}

async function seed() {
  console.log('═══ BLACKBELT v2 — SEED COMPLETO ═══\n');

  // 1. Verificar que tabelas existem
  const requiredTables = [
    'people', 'family_links', 'academy_teen_config', 'audit_log',
    'student_timeline_events', 'family_invoices', 'data_health_issues',
  ];
  for (const table of requiredTables) {
    const exists = await tableExists(table);
    if (!exists) {
      console.error(`❌ Tabela "${table}" nao existe. Rode a migration primeiro!`);
      console.error('   Cole MIGRATION_MASTER_PARA_RODAR.sql no Supabase SQL Editor.');
      process.exit(1);
    }
  }
  console.log('✅ Todas as tabelas verificadas\n');

  // 2. Buscar academia
  let academyId: string;
  const { data: academy } = await supabase
    .from('academies')
    .select('id, name')
    .ilike('name', '%guerreiros%')
    .single();

  if (!academy) {
    const { data: firstAcademy } = await supabase
      .from('academies')
      .select('id, name')
      .limit(1)
      .single();
    if (!firstAcademy) {
      console.error('❌ Nenhuma academia encontrada. Crie pelo menos uma academia primeiro.');
      process.exit(1);
    }
    console.log(`⚠️  "Guerreiros do Tatame" nao encontrada. Usando: ${firstAcademy.name}`);
    academyId = firstAcademy.id;
  } else {
    console.log(`✅ Academia: ${academy.name}`);
    academyId = academy.id;
  }

  // 3. Criar 12 pessoas
  console.log('\n--- Criando pessoas ---');
  const peopleData = [
    { full_name: 'Roberto Silva', cpf: '111.222.333-44', email: 'roberto@teste.com', phone: '(11) 99999-1001', birth_date: '1980-03-15', gender: 'masculino' },
    { full_name: 'Maria Santos', cpf: '222.333.444-55', email: 'maria@teste.com', phone: '(11) 99999-1002', birth_date: '1982-07-20', gender: 'feminino' },
    { full_name: 'Carlos Oliveira', cpf: '333.444.555-66', email: 'carlos.resp@teste.com', phone: '(11) 99999-1003', birth_date: '1978-11-10', gender: 'masculino' },
    { full_name: 'Ana Pereira', cpf: '444.555.666-77', email: 'ana.resp@teste.com', phone: '(11) 99999-1004', birth_date: '1985-01-25', gender: 'feminino' },
    { full_name: 'Lucas Silva', email: 'lucas.teen@teste.com', phone: '(11) 99999-2001', birth_date: '2011-05-10', gender: 'masculino' },
    { full_name: 'Julia Santos', email: 'julia.teen@teste.com', phone: '(11) 99999-2002', birth_date: '2010-09-15', gender: 'feminino' },
    { full_name: 'Pedro Oliveira', email: 'pedro.teen@teste.com', birth_date: '2012-02-28', gender: 'masculino' },
    { full_name: 'Sofia Pereira', email: 'sofia.teen@teste.com', birth_date: '2011-12-03', gender: 'feminino' },
    { full_name: 'Matheus Silva', birth_date: '2016-08-20', gender: 'masculino' },
    { full_name: 'Isabela Santos', birth_date: '2017-04-12', gender: 'feminino' },
    { full_name: 'Gabriel Oliveira', birth_date: '2015-11-30', gender: 'masculino' },
    { full_name: 'Laura Pereira', birth_date: '2018-06-05', gender: 'feminino' },
  ];

  const allPeople: Array<{ id: string; full_name: string; email?: string }> = [];
  for (const p of peopleData) {
    // Try to find existing
    const { data: existing } = await supabase
      .from('people')
      .select('id, full_name, email')
      .eq('full_name', p.full_name)
      .maybeSingle();

    if (existing) {
      allPeople.push(existing);
      continue;
    }

    const { data, error } = await supabase.from('people').insert(p).select('id, full_name, email').single();
    if (error) {
      console.log(`  ⚠️ ${p.full_name}: ${error.message}`);
    } else if (data) {
      allPeople.push(data);
    }
  }
  console.log(`  ✅ ${allPeople.length} pessoas criadas/encontradas`);

  const personByName = (name: string) => allPeople.find((p) => p.full_name === name);

  // 4. Criar family links
  console.log('\n--- Criando vinculos familiares ---');
  const familyLinks = [
    { guardian: 'Roberto Silva', dependent: 'Lucas Silva', relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Roberto Silva', dependent: 'Matheus Silva', relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Maria Santos', dependent: 'Julia Santos', relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Maria Santos', dependent: 'Isabela Santos', relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Carlos Oliveira', dependent: 'Pedro Oliveira', relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Carlos Oliveira', dependent: 'Gabriel Oliveira', relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Ana Pereira', dependent: 'Sofia Pereira', relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Ana Pereira', dependent: 'Laura Pereira', relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian: 'Roberto Silva', dependent: 'Julia Santos', relationship: 'padrasto', is_primary_guardian: false, is_financial_responsible: false, receives_billing: false },
  ];

  let linksCreated = 0;
  for (const link of familyLinks) {
    const guardian = personByName(link.guardian);
    const dependent = personByName(link.dependent);
    if (!guardian || !dependent) {
      console.log(`  ⚠️ Vinculo ${link.guardian} → ${link.dependent}: pessoa nao encontrada`);
      continue;
    }
    const { error } = await supabase.from('family_links').upsert({
      guardian_person_id: guardian.id,
      dependent_person_id: dependent.id,
      relationship: link.relationship,
      is_primary_guardian: link.is_primary_guardian,
      is_financial_responsible: link.is_financial_responsible,
      receives_notifications: true,
      receives_billing: link.receives_billing,
    }, { onConflict: 'guardian_person_id,dependent_person_id' });
    if (error) console.log(`  ⚠️ ${link.guardian} → ${link.dependent}: ${error.message}`);
    else linksCreated++;
  }
  console.log(`  ✅ ${linksCreated} vinculos criados`);

  // 5. Vincular profiles existentes a people (por email)
  console.log('\n--- Vinculando profiles a people ---');
  let profilesLinked = 0;
  for (const person of allPeople) {
    if (!person.email) continue;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, person_id')
      .eq('email', person.email)
      .is('person_id', null)
      .maybeSingle();
    if (profile) {
      await supabase.from('profiles').update({ person_id: person.id }).eq('id', profile.id);
      profilesLinked++;
    }
  }
  console.log(`  ✅ ${profilesLinked} profiles vinculados`);

  // 6. Academy teen config
  console.log('\n--- Criando academy_teen_config ---');
  const { error: teenErr } = await supabase.from('academy_teen_config').upsert({
    academy_id: academyId,
    teen_can_view_schedule: true,
    teen_can_self_checkin: true,
    teen_can_receive_direct_notifications: true,
    teen_can_view_payments: false,
    teen_can_edit_personal_data: false,
    teen_can_participate_general_ranking: false,
  }, { onConflict: 'academy_id' });
  console.log(teenErr ? `  ⚠️ ${teenErr.message}` : '  ✅ Configuracao teen criada');

  // 7. Parental controls nos teens
  console.log('\n--- Definindo parental controls ---');
  const teenNames = ['Lucas Silva', 'Julia Santos', 'Pedro Oliveira', 'Sofia Pereira'];
  for (const name of teenNames) {
    const person = personByName(name);
    if (!person) continue;
    await supabase.from('profiles')
      .update({
        parental_controls: {
          max_screen_time_minutes: 120,
          can_view_ranking: true,
          can_message_professor: true,
          can_view_schedule: true,
          can_self_checkin: true,
        },
      })
      .eq('person_id', person.id);
  }
  console.log('  ✅ Parental controls definidos');

  // 8. Family invoices (3 meses)
  console.log('\n--- Criando faturas familiares ---');
  const months = ['2026-01', '2026-02', '2026-03'];
  const guardians = ['Roberto Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Pereira'];
  let invoicesCreated = 0;
  for (const guardianName of guardians) {
    const guardian = personByName(guardianName);
    if (!guardian) continue;
    for (const month of months) {
      const isPaid = month !== '2026-03';
      const { error } = await supabase.from('family_invoices').insert({
        guardian_person_id: guardian.id,
        academy_id: academyId,
        reference_month: month,
        total_amount: 397.0,
        status: isPaid ? 'paid' : 'pending',
        due_date: `${month}-10`,
        paid_at: isPaid ? `${month}-08T10:00:00Z` : null,
        payment_method: isPaid ? 'pix' : null,
        line_items: [{ description: 'Mensalidade - Plano Familia', amount: 397.0 }],
      });
      if (!error) invoicesCreated++;
    }
  }
  console.log(`  ✅ ${invoicesCreated} faturas criadas`);

  // 9. Timeline events
  console.log('\n--- Criando timeline events ---');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('academy_id', academyId)
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']);

  let eventsCreated = 0;
  for (const profile of allProfiles || []) {
    const { error: e1 } = await supabase.from('student_timeline_events').insert({
      profile_id: profile.id,
      academy_id: academyId,
      event_type: 'matricula',
      title: `${profile.display_name} matriculado`,
      description: 'Matricula realizada pelo admin',
      event_date: '2025-06-01T10:00:00Z',
    });
    if (!e1) eventsCreated++;

    for (let i = 0; i < 3; i++) {
      const day = 10 + i * 3;
      const { error: e2 } = await supabase.from('student_timeline_events').insert({
        profile_id: profile.id,
        academy_id: academyId,
        event_type: 'presenca',
        title: 'Presenca registrada',
        event_date: `2026-03-${String(day).padStart(2, '0')}T18:00:00Z`,
      });
      if (!e2) eventsCreated++;
    }
  }
  console.log(`  ✅ ${eventsCreated} eventos criados`);

  // 10. Rodar detect_data_health_issues
  console.log('\n--- Detectando inconsistencias ---');
  const { data: issuesCount, error: detectErr } = await supabase.rpc('detect_data_health_issues', { p_academy_id: academyId });
  console.log(detectErr ? `  ⚠️ ${detectErr.message}` : `  ✅ ${issuesCount} inconsistencias detectadas`);

  // 11. Audit log entries
  console.log('\n--- Criando audit log de exemplo ---');
  const auditEntries = [
    { action: 'seed_run', entity_type: 'system', entity_id: academyId },
    { action: 'create', entity_type: 'people', entity_id: allPeople[0]?.id },
    { action: 'create', entity_type: 'family_link', entity_id: allPeople[0]?.id },
  ];
  for (const entry of auditEntries) {
    if (!entry.entity_id) continue;
    await supabase.from('audit_log').insert({
      academy_id: academyId,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      new_data: { source: 'seed-everything.ts', timestamp: new Date().toISOString() },
    });
  }
  console.log('  ✅ Audit log entries criadas');

  // 12. Relatorio final
  console.log('\n═══ RELATORIO FINAL ═══');
  const tables = [
    'people', 'family_links', 'academy_teen_config',
    'profile_evolution_log', 'data_health_issues',
    'family_invoices', 'student_timeline_events',
    'account_deletion_log', 'audit_log', 'webhook_log',
    'payment_customers', 'support_tickets',
  ];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(error ? `  ❌ ${table}: ${error.message}` : `  ✅ ${table}: ${count} registros`);
  }

  console.log('\n═══ SEED CONCLUIDO COM SUCESSO! ═══');
}

seed().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
