/**
 * seed-demo-data.ts
 *
 * Populates demo data BEYOND auth users for the Guerreiros do Tatame academy.
 * Requires that users already exist (run seed-full-academy.ts first or create
 * them manually).
 *
 * Creates: classes, extra students, enrollments, 60-day check-in history,
 * plans, subscriptions, invoices, belt progressions, achievements, XP, franchise.
 *
 * Run with:  npx tsx scripts/seed-demo-data.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { readFileSync } from 'fs';
import { resolve } from 'path';

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

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function randomDateLastYear(): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 365));
  return d.toISOString();
}

async function seedDemoData() {
  console.log('🥋 Populando dados demo — Guerreiros do Tatame\n');

  // ═══ Resolve academy ═══
  const { data: academy } = await supabase
    .from('academies')
    .select('id')
    .ilike('name', '%guerreiros%')
    .single();

  if (!academy) {
    console.error('❌ Academia "Guerreiros do Tatame" não encontrada. Execute seed-full-academy.ts primeiro.');
    process.exit(1);
  }
  const ACADEMY_ID = academy.id;
  console.log(`  Academia encontrada: ${ACADEMY_ID}`);

  // ═══ TURMAS ═══
  console.log('\n📚 Criando turmas...');
  const classes = [
    {
      name: 'Jiu-Jitsu Adulto',
      modality: 'jiu_jitsu',
      max_students: 25,
      schedule: [
        { day: 'monday', start: '19:00', end: '20:30' },
        { day: 'wednesday', start: '19:00', end: '20:30' },
        { day: 'friday', start: '19:00', end: '20:30' },
      ],
      level: 'all',
      description: 'Aula de Jiu-Jitsu Brasileiro para adultos, todos os níveis.',
    },
    {
      name: 'Judô Infantil',
      modality: 'judo',
      max_students: 20,
      schedule: [
        { day: 'tuesday', start: '17:00', end: '18:00' },
        { day: 'thursday', start: '17:00', end: '18:00' },
      ],
      level: 'beginner',
      description: 'Aula de Judô para crianças de 5 a 12 anos.',
    },
    {
      name: 'Karatê Adolescente',
      modality: 'karate',
      max_students: 20,
      schedule: [{ day: 'saturday', start: '10:00', end: '11:30' }],
      level: 'intermediate',
      description: 'Karatê Shotokan para adolescentes.',
    },
    {
      name: 'MMA Avançado',
      modality: 'mma',
      max_students: 15,
      schedule: [
        { day: 'tuesday', start: '20:00', end: '21:30' },
        { day: 'thursday', start: '20:00', end: '21:30' },
      ],
      level: 'advanced',
      description: 'Treino de MMA para competidores e avançados.',
    },
  ];

  // Fetch professor IDs
  const { data: professorMemberships } = await supabase
    .from('memberships')
    .select('profile_id')
    .eq('academy_id', ACADEMY_ID)
    .eq('role', 'professor');

  const profIds = (professorMemberships ?? []).map(m => m.profile_id);
  const prof1 = profIds[0] ?? null;
  const prof2 = profIds[1] ?? null;

  const professorAssignment = [prof1, prof2, prof1, prof2];

  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const { error } = await supabase.from('classes').upsert({
      name: cls.name,
      academy_id: ACADEMY_ID,
      professor_id: professorAssignment[i],
      capacity: cls.max_students,
      schedule: cls.schedule,
      status: 'active',
    }, { onConflict: 'name,academy_id' }).select('id');
    if (error) console.error(`  ❌ Turma ${cls.name}:`, error.message);
    else console.log(`  ✅ ${cls.name}`);
  }

  // ═══ ALUNOS EXTRAS ═══
  console.log('\n👥 Criando alunos extras...');
  const extraStudents = [
    { name: 'Maria Clara de Oliveira', email: 'mariaclara@email.com', belt: 'azul', stripes: 1, role: 'aluno_adulto' },
    { name: 'Pedro Henrique Santos', email: 'pedroh@email.com', belt: 'branca', stripes: 3, role: 'aluno_adulto' },
    { name: 'Ana Beatriz Lima', email: 'anab@email.com', belt: 'roxa', stripes: 0, role: 'aluno_adulto' },
    { name: 'Gabriel Souza Costa', email: 'gabriel.demo@email.com', belt: 'branca', stripes: 1, role: 'aluno_adulto' },
    { name: 'Juliana Ferreira Demo', email: 'juliana.demo@email.com', belt: 'azul', stripes: 0, role: 'aluno_adulto' },
    { name: 'Ricardo Almeida Jr', email: 'ricardo.demo@email.com', belt: 'marrom', stripes: 2, role: 'aluno_adulto' },
    { name: 'Camila Rodrigues Demo', email: 'camila.demo@email.com', belt: 'branca', stripes: 2, role: 'aluno_adulto' },
    { name: 'Thiago Nascimento Demo', email: 'thiago.demo@email.com', belt: 'azul', stripes: 3, role: 'aluno_adulto' },
    { name: 'Larissa Mendes', email: 'larissa.demo@email.com', belt: 'branca', stripes: 0, role: 'aluno_adulto' },
    { name: 'Felipe Barbosa', email: 'felipe.demo@email.com', belt: 'roxa', stripes: 1, role: 'aluno_adulto' },
    { name: 'Isabella Martins', email: 'isabella.demo@email.com', belt: 'amarela', stripes: 2, role: 'aluno_teen' },
    { name: 'Enzo Gabriel Silva', email: 'enzo.demo@email.com', belt: 'laranja', stripes: 0, role: 'aluno_teen' },
    { name: 'Sofia Alves', email: 'sofia.demo@email.com', belt: 'branca', stripes: 1, role: 'aluno_kids' },
    { name: 'Miguel Santos Oliveira', email: 'miguel.demo@email.com', belt: 'branca', stripes: 0, role: 'aluno_kids' },
    { name: 'Valentina Costa Demo', email: 'valentina.demo@email.com', belt: 'branca', stripes: 2, role: 'aluno_kids' },
  ];

  const createdStudentIds: string[] = [];

  for (const stu of extraStudents) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: stu.email,
      password: 'BlackBelt@2026',
      email_confirm: true,
      user_metadata: { display_name: stu.name, role: stu.role },
    });

    let userId: string;
    if (authError) {
      if (authError.message.includes('already')) {
        const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const existing = users?.users?.find((u: any) => u.email === stu.email);
        if (!existing) continue;
        userId = existing.id;
      } else {
        console.error(`  ❌ ${stu.name}:`, authError.message);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    // Wait for trigger
    await new Promise(r => setTimeout(r, 300));

    // Get profile (auto-created by trigger)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const profileId = profile?.id ?? userId;

    // Update profile
    await supabase.from('profiles').upsert({
      id: profileId,
      user_id: userId,
      email: stu.email,
      display_name: stu.name,
      role: stu.role,
    }, { onConflict: 'id' });

    // Student record
    const { data: studentRow } = await supabase.from('students').upsert({
      profile_id: profileId,
      academy_id: ACADEMY_ID,
      belt: stu.belt,
      started_at: randomDateLastYear(),
    }, { onConflict: 'profile_id,academy_id' }).select('id').single();

    if (studentRow) createdStudentIds.push(studentRow.id);

    // Membership
    await supabase.from('memberships').upsert({
      profile_id: profileId,
      academy_id: ACADEMY_ID,
      role: stu.role,
      status: 'active',
    }, { onConflict: 'profile_id,academy_id' });

    console.log(`  ✅ ${stu.name} (${stu.belt} ${stu.stripes}°)`);
  }

  // ═══ FETCH ALL STUDENTS ═══
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, profile_id')
    .eq('academy_id', ACADEMY_ID);

  const studentList = allStudents ?? [];
  console.log(`\n  Total alunos na academia: ${studentList.length}`);

  // ═══ CHECK-INS (últimos 60 dias) ═══
  console.log('\n📊 Gerando histórico de presenças (60 dias)...');
  let checkinCount = 0;

  for (const student of studentList) {
    const frequencyPerWeek = 2 + Math.floor(Math.random() * 3);
    const totalCheckins = frequencyPerWeek * 8;

    for (let i = 0; i < totalCheckins; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(17 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      const { error } = await supabase.from('attendance').insert({
        academy_id: ACADEMY_ID,
        student_id: student.id,
        checked_at: date.toISOString(),
        method: Math.random() > 0.3 ? 'qr_code' : 'manual',
      });

      if (!error) checkinCount++;
    }
  }
  console.log(`  ✅ ${checkinCount} check-ins gerados`);

  // ═══ PLANOS ═══
  console.log('\n💰 Criando planos...');
  const plans = [
    { name: 'Mensal', price_cents: 15000, interval: 'monthly' },
    { name: 'Trimestral', price_cents: 13500, interval: 'quarterly' },
    { name: 'Ilimitado', price_cents: 19900, interval: 'monthly' },
    { name: 'Kids/Teen', price_cents: 12000, interval: 'monthly' },
  ];

  const planIds: string[] = [];
  for (const plan of plans) {
    const { data, error } = await supabase.from('plans').upsert({
      name: plan.name,
      price_cents: plan.price_cents,
      interval: plan.interval,
      academy_id: ACADEMY_ID,
      status: 'active',
    }, { onConflict: 'name,academy_id' }).select('id').single();

    if (error) console.error(`  ❌ Plano ${plan.name}:`, error.message);
    else {
      console.log(`  ✅ ${plan.name} — R$ ${(plan.price_cents / 100).toFixed(2)}`);
      if (data) planIds.push(data.id);
    }
  }

  // ═══ FATURAS (últimos 3 meses) ═══
  console.log('\n🧾 Gerando faturas...');
  let invoiceCount = 0;

  for (const student of studentList.slice(0, 20)) {
    const planId = planIds[Math.floor(Math.random() * planIds.length)];
    const planPriceCents = plans[Math.floor(Math.random() * plans.length)].price_cents;

    // 3 invoices (last 3 months)
    for (let month = 0; month < 3; month++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() - month);
      dueDate.setDate(5);

      const isPaid = month > 0 || Math.random() > 0.2;
      const isOverdue = !isPaid && month === 0 && Math.random() > 0.5;

      const { error } = await supabase.from('invoices').insert({
        student_id: student.id,
        academy_id: ACADEMY_ID,
        amount_cents: planPriceCents,
        due_date: dueDate.toISOString().split('T')[0],
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
        paid_at: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 86400000).toISOString() : null,
        payment_method: isPaid ? (Math.random() > 0.5 ? 'pix' : 'boleto') : null,
      });
      if (!error) invoiceCount++;
    }
  }
  console.log(`  ✅ ${invoiceCount} faturas geradas`);

  // ═══ GRADUAÇÕES ═══
  console.log('\n🥋 Criando histórico de graduações...');
  const beltProgression = [
    { from: 'branca', to: 'branca', toStripes: 1 },
    { from: 'branca', to: 'branca', toStripes: 2 },
    { from: 'branca', to: 'branca', toStripes: 3 },
    { from: 'branca', to: 'branca', toStripes: 4 },
    { from: 'branca', to: 'azul', toStripes: 0 },
  ];

  let gradCount = 0;
  for (const student of studentList.slice(0, 8)) {
    const numProgressions = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numProgressions; i++) {
      const prog = beltProgression[Math.min(i, beltProgression.length - 1)];
      const daysAgoVal = (numProgressions - i) * 90 + Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgoVal);

      const { error } = await supabase.from('belt_progressions').insert({
        student_id: student.id,
        academy_id: ACADEMY_ID,
        from_belt: prog.from,
        from_stripes: i > 0 ? beltProgression[i - 1].toStripes : 0,
        to_belt: prog.to,
        to_stripes: prog.toStripes,
        promoted_by: prof1,
        promoted_at: date.toISOString(),
        notes: 'Promovido após avaliação técnica',
      });
      if (!error) gradCount++;
    }
  }
  console.log(`  ✅ ${gradCount} graduações geradas`);

  // ═══ XP PARA TEENS ═══
  console.log('\n⭐ Gerando XP para alunos...');
  let xpCount = 0;
  const { data: teenProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'aluno_teen');

  const teenProfileIds = (teenProfiles ?? []).map(p => p.id);
  const { data: teens } = await supabase
    .from('students')
    .select('id')
    .eq('academy_id', ACADEMY_ID)
    .in('profile_id', teenProfileIds.length > 0 ? teenProfileIds : ['__none__']);

  for (const teen of teens ?? []) {
    const xpEntries = 10 + Math.floor(Math.random() * 30);
    for (let i = 0; i < xpEntries; i++) {
      const { error } = await supabase.from('xp_ledger').insert({
        student_id: teen.id,
        amount: 5 + Math.floor(Math.random() * 50),
        reason: ['attendance', 'achievement', 'quiz'][Math.floor(Math.random() * 3)],
      });
      if (!error) xpCount++;
    }
  }
  console.log(`  ✅ ${xpCount} XP entries geradas`);

  // ═══ FRANCHISE ═══
  console.log('\n🏢 Configurando rede de franquias...');
  const { data: franqueadorProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'franqueador')
    .limit(1)
    .single();

  if (franqueadorProfile) {
    await supabase.from('franchise_networks').upsert({
      name: 'Rede Guerreiros do Tatame',
      owner_profile_id: franqueadorProfile.id,
    }, { onConflict: 'name' });
    console.log('  ✅ Rede de franquias configurada');
  } else {
    console.log('  ⚠️ Perfil franqueador não encontrado, pulando franquias');
  }

  // ═══ RESUMO ═══
  console.log('\n═══════════════════════════════════════');
  console.log('🎉 SEED COMPLETO — Guerreiros do Tatame');
  console.log('═══════════════════════════════════════');
  console.log(`Turmas: ${classes.length}`);
  console.log(`Alunos extras: ${extraStudents.length}`);
  console.log(`Total alunos: ${studentList.length}`);
  console.log(`Check-ins: ${checkinCount}`);
  console.log(`Faturas: ${invoiceCount}`);
  console.log(`Planos: ${plans.length}`);
  console.log(`Graduações: ${gradCount}`);
  console.log(`XP entries: ${xpCount}`);
  console.log('═══════════════════════════════════════');
}

seedDemoData().catch(console.error);
