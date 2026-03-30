/**
 * Seed completo — BlackBelt v2 — Academia "Guerreiros do Tatame"
 *
 * Cria: users no Auth, academia, profiles (9 roles), turmas, planos,
 * guardian_links, check-ins (60 dias), faturas (3 meses).
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/seed-complete.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('🌱 Seed BlackBelt v2 — Guerreiros do Tatame\n');

  // ════════════════════════════════════════════
  // 1. CRIAR USUÁRIOS NO AUTH
  // ════════════════════════════════════════════

  const users = [
    { email: 'greg@email.com', password: 'BlackBelt@Greg1994', role: 'superadmin' },
    { email: 'admin@guerreiros.com', password: 'BlackBelt@2026', role: 'admin' },
    { email: 'professor@guerreiros.com', password: 'BlackBelt@2026', role: 'professor' },
    { email: 'recepcionista@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista' },
    { email: 'aluno@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_adulto' },
    { email: 'teen@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_teen' },
    { email: 'kids@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_kids' },
    { email: 'responsavel@guerreiros.com', password: 'BlackBelt@2026', role: 'responsavel' },
    { email: 'franqueador@email.com', password: 'BlackBelt@2026', role: 'franqueador' },
  ];

  console.log('👤 Criando usuários no Auth...');
  const userIds: Record<string, string> = {};

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find(user => user.email === u.email);
        if (existing) {
          userIds[u.role] = existing.id;
          console.log(`  ✅ ${u.email} (já existia: ${existing.id.substring(0, 8)}...)`);
          await supabase.auth.admin.updateUserById(existing.id, { password: u.password });
        } else {
          console.log(`  ❌ ${u.email}: ${error.message}`);
        }
      } else {
        console.log(`  ❌ ${u.email}: ${error.message}`);
      }
    } else if (data?.user) {
      userIds[u.role] = data.user.id;
      console.log(`  ✅ ${u.email} (criado: ${data.user.id.substring(0, 8)}...)`);
    }
  }

  // ════════════════════════════════════════════
  // 2. CRIAR ACADEMIA
  // ════════════════════════════════════════════

  console.log('\n🏛️ Criando academia...');

  const { data: existingAcademy } = await supabase
    .from('academies')
    .select('id')
    .eq('slug', 'guerreiros-do-tatame')
    .single();

  let academyId: string;

  if (existingAcademy) {
    academyId = existingAcademy.id;
    console.log(`  ✅ Guerreiros do Tatame já existe: ${academyId.substring(0, 8)}...`);
  } else {
    const { data: newAcademy, error } = await supabase
      .from('academies')
      .insert({
        name: 'Guerreiros do Tatame',
        slug: 'guerreiros-do-tatame',
        cnpj: '12.345.678/0001-90',
        phone: '(31) 99999-1234',
        email: 'contato@guerreiros.com',
        address_street: 'Rua das Artes Marciais, 100',
        address_city: 'Vespasiano',
        address_state: 'MG',
        address_zip: '33200-000',
        plan_tier: 'pro',
        status: 'active',
        modalities: ['bjj', 'judo', 'karate', 'mma'],
        max_students: 200,
      })
      .select('id')
      .single();

    if (error) {
      console.log(`  ❌ Erro ao criar academia: ${error.message}`);
      console.log('  Tentando sem campos opcionais...');
      const { data: fallback, error: err2 } = await supabase
        .from('academies')
        .insert({
          name: 'Guerreiros do Tatame',
          slug: 'guerreiros-do-tatame',
          status: 'active',
        })
        .select('id')
        .single();
      if (err2) {
        console.log(`  ❌ Fallback também falhou: ${err2.message}`);
        process.exit(1);
      }
      academyId = fallback!.id;
      console.log(`  ✅ Guerreiros do Tatame criada (fallback): ${academyId.substring(0, 8)}...`);
    } else {
      academyId = newAcademy!.id;
      console.log(`  ✅ Guerreiros do Tatame criada: ${academyId.substring(0, 8)}...`);
    }
  }

  // ════════════════════════════════════════════
  // 3. CRIAR PROFILES
  // ════════════════════════════════════════════

  console.log('\n👥 Criando profiles...');

  const profileData = [
    { user_id: userIds['superadmin'], name: 'Gregory Pinto', role: 'superadmin', email: 'greg@email.com', academy_id: null },
    { user_id: userIds['admin'], name: 'Roberto Silva', role: 'admin', email: 'admin@guerreiros.com', academy_id: academyId },
    { user_id: userIds['professor'], name: 'André Nakamura', role: 'professor', email: 'professor@guerreiros.com', academy_id: academyId },
    { user_id: userIds['recepcionista'], name: 'Carla Souza', role: 'recepcionista', email: 'recepcionista@guerreiros.com', academy_id: academyId },
    { user_id: userIds['aluno_adulto'], name: 'João Mendes', role: 'aluno_adulto', email: 'aluno@guerreiros.com', academy_id: academyId },
    { user_id: userIds['aluno_teen'], name: 'Lucas Oliveira', role: 'aluno_teen', email: 'teen@guerreiros.com', academy_id: academyId },
    { user_id: userIds['aluno_kids'], name: 'Maria Silva', role: 'aluno_kids', email: 'kids@guerreiros.com', academy_id: academyId },
    { user_id: userIds['responsavel'], name: 'Paulo Oliveira', role: 'responsavel', email: 'responsavel@guerreiros.com', academy_id: academyId },
    { user_id: userIds['franqueador'], name: 'Carlos Ferreira', role: 'franqueador', email: 'franqueador@email.com', academy_id: null },
  ];

  for (const p of profileData) {
    if (!p.user_id) {
      console.log(`  ⏭️  ${p.name} — user_id não encontrado (Auth pode ter falhado)`);
      continue;
    }

    // Try upsert first
    const { error } = await supabase
      .from('profiles')
      .upsert(p, { onConflict: 'user_id' });

    if (error) {
      // Try plain insert
      const { error: err2 } = await supabase.from('profiles').insert(p);
      if (err2 && !err2.message.includes('duplicate')) {
        console.log(`  ❌ ${p.name}: ${err2.message}`);
      } else {
        console.log(`  ✅ ${p.name} (${p.role})`);
      }
    } else {
      console.log(`  ✅ ${p.name} (${p.role})`);
    }
  }

  // ════════════════════════════════════════════
  // 4. CRIAR TURMAS
  // ════════════════════════════════════════════

  console.log('\n📚 Criando turmas...');

  const { data: professorProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'professor@guerreiros.com')
    .single();

  const classes = [
    { name: 'BJJ Adulto Manhã', modality: 'bjj', schedule: 'Seg/Qua/Sex 07:00', max_students: 25, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'BJJ Adulto Noite', modality: 'bjj', schedule: 'Seg/Qua/Sex 19:00', max_students: 30, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'Judô Adulto', modality: 'judo', schedule: 'Ter/Qui 18:00', max_students: 20, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'BJJ Kids', modality: 'bjj', schedule: 'Sáb 09:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'BJJ Teen', modality: 'bjj', schedule: 'Ter/Qui 17:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'MMA', modality: 'mma', schedule: 'Seg/Qua/Sex 20:30', max_students: 20, professor_id: professorProfile?.id, academy_id: academyId },
    { name: 'Karatê Infantil', modality: 'karate', schedule: 'Sáb 10:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId },
  ];

  for (const c of classes) {
    const { error } = await supabase.from('classes').insert(c);
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ❌ ${c.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${c.name}`);
    }
  }

  // ════════════════════════════════════════════
  // 5. CRIAR PLANOS (se tabela plans permite insert)
  // ════════════════════════════════════════════

  console.log('\n💰 Criando planos...');

  const plans = [
    { tier: 'starter', name: 'Starter', price_monthly: 7900, is_popular: false, sort_order: 1, is_active: true },
    { tier: 'essencial', name: 'Essencial', price_monthly: 14900, is_popular: false, sort_order: 2, is_active: true },
    { tier: 'pro', name: 'Pro', price_monthly: 24900, is_popular: true, sort_order: 3, is_active: true },
    { tier: 'blackbelt', name: 'Black Belt', price_monthly: 39700, is_popular: false, sort_order: 4, is_active: true },
    { tier: 'enterprise', name: 'Enterprise', price_monthly: 0, is_popular: false, sort_order: 5, is_active: true },
  ];

  for (const p of plans) {
    // Check if plan already exists
    const { data: existing } = await supabase.from('platform_plans').select('id').eq('tier', p.tier).single();
    if (existing) {
      console.log(`  ✅ ${p.name} (já existe)`);
      continue;
    }
    const { error } = await supabase.from('platform_plans').insert(p);
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ❌ ${p.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${p.name} — R$ ${(p.price_monthly / 100).toFixed(0)}/mês`);
    }
  }

  // ════════════════════════════════════════════
  // 6. VINCULAR RESPONSÁVEL AOS FILHOS
  // ════════════════════════════════════════════

  console.log('\n👨‍👧‍👦 Vinculando responsável aos filhos...');

  const { data: guardianProfile } = await supabase.from('profiles').select('id').eq('email', 'responsavel@guerreiros.com').single();
  const { data: teenProfile } = await supabase.from('profiles').select('id').eq('email', 'teen@guerreiros.com').single();
  const { data: kidsProfile } = await supabase.from('profiles').select('id').eq('email', 'kids@guerreiros.com').single();

  if (guardianProfile && teenProfile) {
    const { error } = await supabase.from('guardian_links').insert({
      guardian_id: guardianProfile.id,
      child_id: teenProfile.id,
      relationship: 'parent',
    });
    if (!error || error.message.includes('duplicate')) console.log('  ✅ Paulo → Lucas (teen)');
    else console.log(`  ❌ ${error.message}`);
  } else {
    console.log('  ⏭️  Guardian links — perfis não encontrados');
  }

  if (guardianProfile && kidsProfile) {
    const { error } = await supabase.from('guardian_links').insert({
      guardian_id: guardianProfile.id,
      child_id: kidsProfile.id,
      relationship: 'parent',
    });
    if (!error || error.message.includes('duplicate')) console.log('  ✅ Paulo → Maria (kids)');
    else console.log(`  ❌ ${error.message}`);
  }

  // ════════════════════════════════════════════
  // 7. CRIAR CHECK-INS RECENTES (60 dias)
  // ════════════════════════════════════════════

  console.log('\n✅ Criando check-ins dos últimos 60 dias...');

  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
    .eq('academy_id', academyId);

  if (allStudents && allStudents.length > 0) {
    const checkins: any[] = [];
    const now = new Date();

    for (let d = 60; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0) continue; // skip Sundays

      for (const student of allStudents) {
        if (Math.random() > 0.7) continue; // 70% attendance

        checkins.push({
          profile_id: student.id,
          academy_id: academyId,
          checked_in_at: date.toISOString(),
          checkin_type: 'self',
        });
      }
    }

    for (let i = 0; i < checkins.length; i += 50) {
      const batch = checkins.slice(i, i + 50);
      const { error } = await supabase.from('checkins').insert(batch);
      if (error) console.log(`  ❌ Batch ${i}: ${error.message}`);
    }
    console.log(`  ✅ ${checkins.length} check-ins criados`);
  } else {
    console.log('  ⏭️  Nenhum aluno encontrado para check-ins');
  }

  // ════════════════════════════════════════════
  // 8. CRIAR FATURAS (últimos 3 meses)
  // ════════════════════════════════════════════

  console.log('\n💳 Criando faturas...');

  if (allStudents && allStudents.length > 0) {
    const invoices: any[] = [];
    const months = ['2026-01', '2026-02', '2026-03'];
    const paymentMethods = ['pix', 'dinheiro', 'cartao', 'transferencia'];

    for (const student of allStudents) {
      for (const month of months) {
        const isPaid = Math.random() > 0.2; // 80% paid
        invoices.push({
          profile_id: student.id,
          academy_id: academyId,
          amount: 14900,
          status: isPaid ? 'paid' : (month === '2026-03' ? 'pending' : 'overdue'),
          reference_month: month,
          due_date: `${month}-10`,
          paid_at: isPaid ? `${month}-08T10:00:00Z` : null,
          manual_payment: isPaid && Math.random() > 0.5,
          payment_method: isPaid ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null,
        });
      }
    }

    for (let i = 0; i < invoices.length; i += 20) {
      const batch = invoices.slice(i, i + 20);
      const { error } = await supabase.from('invoices').insert(batch);
      if (error) console.log(`  ❌ Faturas batch ${i}: ${error.message}`);
    }
    console.log(`  ✅ ${invoices.length} faturas criadas`);
  }

  // ════════════════════════════════════════════
  // 9. VERIFICAÇÃO FINAL
  // ════════════════════════════════════════════

  console.log('\n════════════════════════════════');
  console.log('VERIFICAÇÃO FINAL');
  console.log('════════════════════════════════\n');

  const tables = ['profiles', 'academies', 'classes', 'plans', 'checkins', 'invoices', 'guardian_links'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`  ❌ ${t}: ${error.message}`);
    } else {
      console.log(`  ✅ ${t}: ${count} registros`);
    }
  }

  // Test login
  console.log('\n🔑 Testando login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@guerreiros.com',
    password: 'BlackBelt@2026',
  });
  if (loginError) {
    console.log(`  ❌ Login admin: ${loginError.message}`);
  } else {
    console.log(`  ✅ Login admin OK: ${loginData.user?.id.substring(0, 8)}...`);
  }

  console.log('\n🎉 Seed completo!');
  console.log('Teste em: https://blackbeltv2.vercel.app/login');
  console.log('Login: admin@guerreiros.com / BlackBelt@2026');
}

seed().catch(console.error);
