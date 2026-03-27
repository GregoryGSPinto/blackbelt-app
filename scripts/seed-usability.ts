// Este script popula TODAS as tabelas de usabilidade com dados realistas
// da academia demo "Guerreiros do Tatame"
//
// RODAR: npx tsx scripts/seed-usability.ts
// REQUER: SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no .env.local

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function seed() {
  console.log('🌱 Iniciando seed de usabilidade...\n');

  // ═══ ACADEMY ID ═══
  const { data: academy } = await supabase.from('academies').select('id').eq('name', 'Guerreiros do Tatame').single();
  const ACADEMY_ID = academy?.id;
  if (!ACADEMY_ID) {
    console.error('❌ Academia "Guerreiros do Tatame" não encontrada. Rode o seed principal primeiro.');
    process.exit(1);
  }
  console.log(`✅ Academia: ${ACADEMY_ID}\n`);

  // ═══ 1. PEOPLE ═══
  console.log('👤 Criando pessoas...');

  const people = [
    // Responsáveis
    { full_name: 'Patrícia Oliveira', email: 'patricia@email.com', phone: '(31) 99876-5432', birth_date: '1985-03-15', gender: 'feminino', cpf: '123.456.789-00' },
    { full_name: 'Carlos Pereira', email: 'carlos.resp@email.com', phone: '(31) 99765-4321', birth_date: '1982-07-22', gender: 'masculino', cpf: '987.654.321-00' },
    { full_name: 'Maria Clara Mendes', email: 'maria.resp@email.com', phone: '(31) 99654-3210', birth_date: '1988-11-08', gender: 'feminino' },
    { full_name: 'Renata Costa', email: 'renata@email.com', phone: '(31) 99543-2109', birth_date: '1990-01-25', gender: 'feminino' },
    // Teens
    { full_name: 'Sophia Oliveira', email: 'sophia@email.com', phone: null, birth_date: '2010-05-15', gender: 'feminino', medical_notes: null },
    { full_name: 'Lucas Gabriel Mendes', email: 'lucas.teen@email.com', phone: null, birth_date: '2011-09-03', gender: 'masculino', medical_notes: null },
    { full_name: 'Gabriel Santos', email: 'gabriel.teen@email.com', phone: null, birth_date: '2012-04-18', gender: 'masculino', medical_notes: null },
    { full_name: 'Valentina Costa', email: 'valentina@email.com', phone: null, birth_date: '2009-12-01', gender: 'feminino', medical_notes: null },
    // Kids
    { full_name: 'Miguel Pereira', email: null, phone: null, birth_date: '2016-08-22', gender: 'masculino', medical_notes: 'Alergia a amendoim' },
    { full_name: 'Helena Costa', email: null, phone: null, birth_date: '2018-02-14', gender: 'feminino', medical_notes: null },
    { full_name: 'Arthur Nakamura', email: null, phone: null, birth_date: '2019-06-30', gender: 'masculino', medical_notes: 'Asma leve — sempre ter bombinha disponível' },
    { full_name: 'Laura Almeida', email: null, phone: null, birth_date: '2017-10-05', gender: 'feminino', medical_notes: null },
  ];

  const { data: insertedPeople, error: pErr } = await supabase.from('people').upsert(people, { onConflict: 'cpf' }).select();
  console.log(pErr ? `❌ ${pErr.message}` : `✅ ${insertedPeople?.length} pessoas criadas`);

  // Mapear por nome para usar nos links
  const pMap = new Map<string, string>();
  for (const p of insertedPeople || []) {
    pMap.set(p.full_name, p.id);
  }

  // ═══ 2. FAMILY LINKS ═══
  console.log('\n👨‍👩‍👧 Criando vínculos familiares...');

  const links = [
    // Patrícia é mãe de Sophia (teen) e Miguel (kids)
    { guardian_person_id: pMap.get('Patrícia Oliveira'), dependent_person_id: pMap.get('Sophia Oliveira'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Patrícia Oliveira'), dependent_person_id: pMap.get('Miguel Pereira'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Carlos é pai de Gabriel (teen) e Helena (kids)
    { guardian_person_id: pMap.get('Carlos Pereira'), dependent_person_id: pMap.get('Gabriel Santos'), relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Carlos Pereira'), dependent_person_id: pMap.get('Helena Costa'), relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Maria Clara é mãe de Lucas (teen)
    { guardian_person_id: pMap.get('Maria Clara Mendes'), dependent_person_id: pMap.get('Lucas Gabriel Mendes'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Renata é mãe de Valentina (teen) e Laura (kids)
    { guardian_person_id: pMap.get('Renata Costa'), dependent_person_id: pMap.get('Valentina Costa'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Renata Costa'), dependent_person_id: pMap.get('Laura Almeida'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
  ].filter(l => l.guardian_person_id && l.dependent_person_id);

  const { error: flErr } = await supabase.from('family_links').upsert(links, { onConflict: 'guardian_person_id,dependent_person_id' });
  console.log(flErr ? `❌ ${flErr.message}` : `✅ ${links.length} vínculos familiares criados`);

  // ═══ 3. VINCULAR PROFILES EXISTENTES A PEOPLE ═══
  console.log('\n🔗 Vinculando profiles a people...');

  const profileEmails = [
    'patricia@email.com', 'carlos.resp@email.com', 'maria.resp@email.com', 'renata@email.com',
    'sophia@email.com', 'lucas.teen@email.com', 'gabriel.teen@email.com', 'valentina@email.com',
  ];

  for (const email of profileEmails) {
    const matchedPerson = insertedPeople?.find(p => p.email === email);
    if (matchedPerson) {
      const { error } = await supabase
        .from('profiles')
        .update({ person_id: matchedPerson.id })
        .eq('email', email);
      console.log(error ? `  ❌ ${email}: ${error.message}` : `  ✅ ${email} → person_id vinculado`);
    }
  }

  // ═══ 4. ACADEMY TEEN CONFIG ═══
  console.log('\n⚙️ Configurando autonomia teen...');

  const { error: tcErr } = await supabase.from('academy_teen_config').upsert({
    academy_id: ACADEMY_ID,
    teen_can_view_schedule: true,
    teen_can_self_checkin: true,
    teen_can_receive_direct_notifications: true,
    teen_can_view_payments: false,
    teen_can_edit_personal_data: false,
    teen_can_participate_general_ranking: false,
  }, { onConflict: 'academy_id' });
  console.log(tcErr ? `❌ ${tcErr.message}` : '✅ Config teen criada');

  // ═══ 5. PARENTAL CONTROLS ═══
  console.log('\n🔒 Configurando controles parentais...');

  const teenProfiles = ['sophia@email.com', 'lucas.teen@email.com', 'gabriel.teen@email.com', 'valentina@email.com'];
  for (const email of teenProfiles) {
    const { error } = await supabase
      .from('profiles')
      .update({
        parental_controls: {
          canChangeEmail: false,
          canChangePassword: false,
          canViewFinancial: false,
          canSendMessages: true,
          canSelfCheckin: true,
          isSuspended: false,
          suspendedUntil: null,
          suspendedReason: null,
        },
      })
      .eq('email', email);
    console.log(error ? `  ❌ ${email}: ${error.message}` : `  ✅ ${email} — controle parental definido`);
  }

  // ═══ 6. FAMILY INVOICES ═══
  console.log('\n💰 Criando faturas familiares...');

  const months = ['2026-01', '2026-02', '2026-03'];
  const familyInvoices: Record<string, unknown>[] = [];

  for (const month of months) {
    // Patrícia: Sophia (R$149) + Miguel (R$99)
    if (pMap.get('Patrícia Oliveira')) {
      familyInvoices.push({
        guardian_person_id: pMap.get('Patrícia Oliveira'),
        academy_id: ACADEMY_ID,
        reference_month: month,
        total_amount: 248.00,
        status: month === '2026-03' ? 'pending' : 'paid',
        due_date: `${month}-10`,
        paid_at: month === '2026-03' ? null : `${month}-08T10:00:00Z`,
        line_items: JSON.stringify([
          { dependent_name: 'Sophia Oliveira', plan_name: 'BJJ Teen', amount: 149.00 },
          { dependent_name: 'Miguel Pereira', plan_name: 'JiuJitsu Kids', amount: 99.00 },
        ]),
      });
    }
    // Carlos: Gabriel (R$149) + Helena (R$99)
    if (pMap.get('Carlos Pereira')) {
      familyInvoices.push({
        guardian_person_id: pMap.get('Carlos Pereira'),
        academy_id: ACADEMY_ID,
        reference_month: month,
        total_amount: 248.00,
        status: month === '2026-03' ? 'overdue' : 'paid',
        due_date: `${month}-05`,
        paid_at: month === '2026-03' ? null : `${month}-04T14:00:00Z`,
        line_items: JSON.stringify([
          { dependent_name: 'Gabriel Santos', plan_name: 'BJJ Teen', amount: 149.00 },
          { dependent_name: 'Helena Costa', plan_name: 'JiuJitsu Kids', amount: 99.00 },
        ]),
      });
    }
  }

  const { error: fiErr } = await supabase.from('family_invoices').insert(familyInvoices);
  console.log(fiErr ? `❌ ${fiErr.message}` : `✅ ${familyInvoices.length} faturas familiares criadas`);

  // ═══ 7. TIMELINE EVENTS ═══
  console.log('\n📅 Criando eventos na timeline...');

  // Buscar IDs dos profiles pra popular timeline
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .eq('academy_id', ACADEMY_ID);

  const timelineEvents: Record<string, unknown>[] = [];
  for (const pr of allProfiles || []) {
    // Matrícula
    timelineEvents.push({
      profile_id: pr.id,
      academy_id: ACADEMY_ID,
      event_type: 'matricula',
      title: `${pr.display_name} se matriculou`,
      description: `Entrada como ${pr.role}`,
      event_date: '2025-06-01T10:00:00Z',
    });

    // Algumas presenças
    for (let i = 0; i < 5; i++) {
      const day = 10 + i * 3;
      timelineEvents.push({
        profile_id: pr.id,
        academy_id: ACADEMY_ID,
        event_type: 'presenca',
        title: 'Check-in realizado',
        description: 'Presença confirmada na turma',
        event_date: `2026-03-${String(day).padStart(2, '0')}T18:00:00Z`,
      });
    }
  }

  const { error: teErr } = await supabase.from('student_timeline_events').insert(timelineEvents.slice(0, 100)); // limitar a 100
  console.log(teErr ? `❌ ${teErr.message}` : `✅ ${Math.min(timelineEvents.length, 100)} eventos de timeline criados`);

  // ═══ 8. DATA HEALTH ═══
  console.log('\n🏥 Detectando inconsistências...');

  const { data: issuesCount, error: dhErr } = await supabase.rpc('detect_data_health_issues', { p_academy_id: ACADEMY_ID });
  console.log(dhErr ? `❌ ${dhErr.message}` : `✅ ${issuesCount} inconsistências detectadas`);

  // ═══ RESUMO ═══
  console.log('\n');
  console.log('🔥 ═══════════════════════════════════════════');
  console.log('🔥 SEED DE USABILIDADE COMPLETO!');
  console.log('🔥 ═══════════════════════════════════════════');
  console.log('');
  console.log('📋 O que foi populado:');
  console.log('   👤 12 pessoas (4 responsáveis, 4 teens, 4 kids)');
  console.log('   👨‍👩‍👧 7 vínculos familiares');
  console.log('   ⚙️ Config de autonomia teen');
  console.log('   🔒 Controles parentais nos 4 teens');
  console.log('   💰 Faturas familiares (jan-mar 2026)');
  console.log('   📅 Eventos de timeline');
  console.log('   🏥 Inconsistências detectadas automaticamente');
  console.log('');
  console.log('🧪 Teste no browser:');
  console.log('   → Login patricia@email.com → ver Central da Família');
  console.log('   → Login admin → ver Painel de Pendências');
  console.log('   → Login admin → Aluno detalhe → ver Timeline');
  console.log('   → Login admin → Configurações → Autonomia Teen');
}

seed().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
