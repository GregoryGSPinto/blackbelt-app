/**
 * seed-trial-students.ts
 *
 * Seeds 10 trial students with diverse statuses and activity logs
 * for the Guerreiros do Tatame academy.
 *
 * Run with:  npx tsx scripts/seed-trial-students.ts
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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function seedTrialStudents() {
  console.log('🥋 Seeding trial students...\n');

  // Resolve academy
  const { data: academy } = await supabase
    .from('academies')
    .select('id')
    .limit(1)
    .single();

  if (!academy) {
    console.error('❌ No academy found. Run seed-full-academy.ts first.');
    process.exit(1);
  }

  const academyId = academy.id;
  console.log(`  Academy: ${academyId}`);

  // Seed trial config if not exists
  const { data: existingConfig } = await supabase
    .from('trial_config')
    .select('id')
    .eq('academy_id', academyId)
    .single();

  if (!existingConfig) {
    await supabase.from('trial_config').insert({
      academy_id: academyId,
      trial_duration_days: 7,
      trial_classes_limit: 10,
      require_health_declaration: false,
      require_phone: true,
      require_email: false,
      auto_create_account: true,
      welcome_message: 'Olá {nome}! 👋 Bem-vindo(a) à Guerreiros do Tatame! Seu período experimental de 7 dias começou!',
      expiry_warning_message: '{nome}, seu período experimental termina amanhã!',
      expired_message: '{nome}, seu período experimental terminou. Venha continuar sua jornada!',
      send_welcome_whatsapp: true,
      send_day3_reminder: true,
      send_day5_reminder: true,
      send_expiry_notification: true,
      send_post_expiry_offer: true,
      conversion_discount_percent: 15,
      conversion_discount_valid_days: 7,
    });
    console.log('  ✅ Trial config created');
  } else {
    console.log('  ⏭  Trial config already exists');
  }

  // Trial students
  const students = [
    // 3 active
    {
      name: 'Lucas Almeida',
      phone: '5511999990001',
      email: 'lucas.almeida@email.com',
      source: 'walk_in',
      modalities_interest: ['jiu_jitsu', 'muay_thai'],
      experience_level: 'beginner',
      goals: 'Perder peso e aprender defesa pessoal',
      trial_start_date: daysAgo(2),
      trial_end_date: daysFromNow(5),
      trial_classes_attended: 2,
      trial_classes_limit: 10,
      status: 'active',
    },
    {
      name: 'Ana Carolina Souza',
      phone: '5511999990002',
      email: 'ana.souza@email.com',
      source: 'instagram',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'some_experience',
      goals: 'Retomar os treinos',
      trial_start_date: daysAgo(5),
      trial_end_date: daysFromNow(2),
      trial_classes_attended: 4,
      trial_classes_limit: 10,
      status: 'active',
      rating: 5,
      feedback: 'Adorei a academia! Professores muito atenciosos.',
      would_recommend: true,
    },
    {
      name: 'Rafael Costa',
      phone: '5511999990003',
      source: 'website',
      modalities_interest: ['muay_thai', 'boxe'],
      experience_level: 'beginner',
      trial_start_date: daysAgo(1),
      trial_end_date: daysFromNow(6),
      trial_classes_attended: 1,
      trial_classes_limit: 10,
      status: 'active',
    },
    // 3 converted
    {
      name: 'Mariana Oliveira',
      phone: '5511999990004',
      email: 'mariana.oliveira@email.com',
      source: 'referral',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'intermediate',
      trial_start_date: daysAgo(14),
      trial_end_date: daysAgo(7),
      trial_classes_attended: 6,
      trial_classes_limit: 10,
      status: 'converted',
      converted_at: daysAgo(6),
      converted_plan: 'Plano Mensal',
      rating: 5,
      feedback: 'Melhor academia da regiao!',
      would_recommend: true,
    },
    {
      name: 'Thiago Santos',
      phone: '5511999990005',
      source: 'google',
      modalities_interest: ['muay_thai'],
      experience_level: 'beginner',
      trial_start_date: daysAgo(21),
      trial_end_date: daysAgo(14),
      trial_classes_attended: 5,
      trial_classes_limit: 10,
      status: 'converted',
      converted_at: daysAgo(13),
      converted_plan: 'Plano Trimestral',
      rating: 4,
      feedback: 'Otima experiencia, horarios podiam ser melhores.',
      would_recommend: true,
    },
    {
      name: 'Julia Pereira',
      phone: '5511999990006',
      email: 'julia.p@email.com',
      source: 'event',
      modalities_interest: ['jiu_jitsu', 'muay_thai'],
      experience_level: 'some_experience',
      trial_start_date: daysAgo(30),
      trial_end_date: daysAgo(23),
      trial_classes_attended: 7,
      trial_classes_limit: 10,
      status: 'converted',
      converted_at: daysAgo(22),
      converted_plan: 'Plano Semestral',
      rating: 5,
      would_recommend: true,
    },
    // 2 expired
    {
      name: 'Carlos Henrique',
      phone: '5511999990007',
      source: 'facebook',
      modalities_interest: ['boxe'],
      experience_level: 'beginner',
      trial_start_date: daysAgo(10),
      trial_end_date: daysAgo(3),
      trial_classes_attended: 1,
      trial_classes_limit: 10,
      status: 'expired',
      expiry_notified: true,
    },
    {
      name: 'Fernanda Lima',
      phone: '5511999990008',
      email: 'fernanda.lima@email.com',
      source: 'whatsapp',
      modalities_interest: ['jiu_jitsu'],
      experience_level: 'beginner',
      trial_start_date: daysAgo(12),
      trial_end_date: daysAgo(5),
      trial_classes_attended: 3,
      trial_classes_limit: 10,
      status: 'expired',
      expiry_notified: true,
      rating: 3,
      feedback: 'Foi ok, mas achei caro.',
      would_recommend: false,
    },
    // 1 cancelled
    {
      name: 'Roberto Nascimento',
      phone: '5511999990009',
      source: 'walk_in',
      modalities_interest: ['muay_thai'],
      experience_level: 'advanced',
      trial_start_date: daysAgo(4),
      trial_end_date: daysFromNow(3),
      trial_classes_attended: 0,
      trial_classes_limit: 10,
      status: 'cancelled',
      admin_notes: 'Desistiu pois viaja muito a trabalho.',
    },
    // 1 no_show
    {
      name: 'Patricia Gomes',
      phone: '5511999990010',
      email: 'pat.gomes@email.com',
      source: 'instagram',
      modalities_interest: ['jiu_jitsu', 'boxe'],
      experience_level: 'beginner',
      trial_start_date: daysAgo(8),
      trial_end_date: daysAgo(1),
      trial_classes_attended: 0,
      trial_classes_limit: 10,
      status: 'no_show',
      admin_notes: 'Agendou mas nunca apareceu.',
    },
  ];

  for (const student of students) {
    const { data: inserted, error } = await supabase
      .from('trial_students')
      .insert({
        academy_id: academyId,
        has_health_issues: false,
        follow_up_done: false,
        expiry_notified: false,
        ...student,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ ${student.name}: ${error.message}`);
      continue;
    }

    console.log(`  ✅ ${student.name} (${student.status})`);

    // Add activity logs for active/converted students
    if (inserted && student.trial_classes_attended > 0) {
      const activities: any[] = [
        {
          trial_student_id: inserted.id,
          academy_id: academyId,
          activity_type: 'registered',
          details: { source: student.source },
          created_at: student.trial_start_date + 'T10:00:00Z',
        },
      ];

      for (let i = 0; i < student.trial_classes_attended; i++) {
        const d = new Date(student.trial_start_date);
        d.setDate(d.getDate() + i + 1);
        activities.push({
          trial_student_id: inserted.id,
          academy_id: academyId,
          activity_type: i === 0 ? 'first_visit' : 'class_attended',
          details: { class_name: student.modalities_interest[0] },
          created_at: d.toISOString(),
        });
      }

      if (student.status === 'converted' && student.converted_at) {
        activities.push({
          trial_student_id: inserted.id,
          academy_id: academyId,
          activity_type: 'converted',
          details: { plan: student.converted_plan },
          created_at: student.converted_at + 'T14:00:00Z',
        });
      }

      if (student.rating) {
        activities.push({
          trial_student_id: inserted.id,
          academy_id: academyId,
          activity_type: 'feedback_given',
          details: { rating: student.rating },
          created_at: new Date().toISOString(),
        });
      }

      await supabase.from('trial_activity_log').insert(activities);
    }
  }

  console.log('\n🎉 Trial student seed complete!');
}

seedTrialStudents().catch(console.error);
