/**
 * seed-full-academy.ts
 *
 * Populates a complete, realistic martial arts academy in Supabase.
 * Uses the service_role key to bypass RLS and create auth users.
 *
 * Run with:  npx tsx scripts/seed-full-academy.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

// Load environment variables from .env.local
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

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'BlackBelt@2026';

// ── Helpers ─────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Check if a date falls on a vacation / holiday skip date (Jan vacation, Carnival, New Year) */
function isSkipDate(d: Date): boolean {
  const m = d.getMonth(); // 0-indexed
  const day = d.getDate();
  const dow = d.getDay();
  const year = d.getFullYear();

  // January 1st
  if (m === 0 && day === 1) return true;

  // January vacation: first 2 weeks (Jan 1-14)
  if (m === 0 && day <= 14) return true;

  // Carnival 2026: March 3-4
  if (year === 2026 && m === 2 && (day === 3 || day === 4)) return true;

  return false;
}

/** Build a checked_at timestamp for a given date + class start_time, with jitter */
function buildCheckedAt(dateStr: string, startTime: string): string {
  const [h, m] = startTime.split(':').map(Number);
  const d = new Date(`${dateStr}T${startTime}:00-03:00`); // BRT
  // jitter: -5min to +15min
  const jitterMinutes = randomBetween(-5, 15);
  d.setMinutes(d.getMinutes() + jitterMinutes);
  return d.toISOString();
}

// ── ID maps ─────────────────────────────────────────────────────────────────

// keyed by user number (1-30)
const userIds: Record<number, string> = {};
const profileIds: Record<number, string> = {};
const studentIds: Record<number, string> = {};

let academyId: string;
let unitSedeId: string;
let unitFilialId: string;

const modalityIds: Record<string, string> = {};
const classIds: Record<string, string> = {};
const planIds: Record<string, string> = {};
const subscriptionIds: Record<number, string> = {};
const videoIds: string[] = [];
const seriesIds: Record<string, string> = {};
const challengeIds: Record<string, string> = {};
const eventIds: Record<string, string> = {};

let totalRecords = 0;

// ── Step 0: Cleanup ────────────────────────────────────────────────────────

async function cleanup() {
  console.log('Limpando dados existentes...');

  // Tables in dependency order (children first)
  const tables = [
    'challenge_progress',
    'challenges',
    'nps_responses',
    'feed_comments',
    'feed_likes',
    'feed_posts',
    'class_notes',
    'event_registrations',
    'events',
    'leads',
    'video_progress',
    'series_videos',
    'series',
    'videos',
    'student_xp',
    'notifications',
    'messages',
    'achievements',
    'invoices',
    'subscriptions',
    'plans',
    'evaluations',
    'progressions',
    'attendance',
    'class_enrollments',
    'classes',
    'guardians',
    'students',
    'modalities',
    'memberships',
    'units',
    'push_tokens',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('0 rows')) {
      console.warn(`  Aviso ao limpar ${table}: ${error.message}`);
    }
  }

  // Delete profiles (must come after memberships, students, etc.)
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Delete academies last
  await supabase.from('academies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Delete auth users by email
  const emails = [
    'super@blackbelt.app',
    'roberto@guerreiros.com', 'camila@guerreiros.com',
    'andre@guerreiros.com', 'fernanda@guerreiros.com', 'thiago@guerreiros.com',
    'joao@email.com', 'marcos@email.com', 'rafael@email.com', 'bruno@email.com',
    'luciana@email.com', 'pedro@email.com', 'anacarol@email.com', 'diego@email.com',
    'isabela@email.com', 'guilherme@email.com', 'juliana@email.com', 'matheus@email.com',
    'lucas.teen@email.com', 'sophia@email.com', 'gabriel.teen@email.com',
    'valentina@email.com', 'enzo@email.com',
    'miguel.kids@email.com', 'helena.kids@email.com', 'arthur.kids@email.com', 'laura.kids@email.com',
    'maria.resp@email.com', 'patricia@email.com', 'carlos.resp@email.com', 'renata@email.com',
    'julia@guerreiros.com', 'fernando@guerreiros.com',
  ];

  // Fetch all users once
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const allUsers = (listData?.users ?? []) as Array<{ id: string; email?: string }>;

  for (const email of emails) {
    const user = allUsers.find((u) => u.email === email);
    if (user) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  console.log('  Cleanup concluido.');
}

// ── Step 0.5: Super Admin ──────────────────────────────────────────────────

async function createSuperAdmin() {
  console.log('Criando super admin...');

  const { data: superAuth, error: sErr } = await supabase.auth.admin.createUser({
    email: 'super@blackbelt.app',
    password: '@Greg1994',
    email_confirm: true,
    user_metadata: { name: 'Gregory Pinto', display_name: 'Gregory Pinto' },
  });
  if (sErr) throw new Error(`Erro ao criar Super Admin: ${sErr.message}`);

  await delay(500);

  // Get auto-created profile
  const { data: sProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', superAuth.user.id)
    .single();

  if (sProfile) {
    await supabase
      .from('profiles')
      .update({ role: 'superadmin', display_name: 'Gregory Pinto' })
      .eq('id', sProfile.id);
  } else {
    // Create manually if trigger didn't fire
    await supabase.from('profiles').insert({
      user_id: superAuth.user.id,
      role: 'superadmin',
      display_name: 'Gregory Pinto',
    });
  }

  totalRecords += 2; // auth + profile
  console.log('  Super Admin criado: super@blackbelt.app / @Greg1994');
}

// ── Step 1: Academy + Units + Modalities ───────────────────────────────────

async function createAcademy() {
  console.log('Criando academia...');

  // We need an owner — we'll create Roberto first and use his user_id
  // But academy requires owner_id which is auth.users.id
  // We'll create the admin user first, then academy

  // Create Roberto auth user first
  const { data: robertoAuth, error: rErr } = await supabase.auth.admin.createUser({
    email: 'roberto@guerreiros.com',
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Roberto Carlos Mendes' },
  });
  if (rErr) throw new Error(`Erro ao criar Roberto: ${rErr.message}`);
  userIds[1] = robertoAuth.user.id;

  // Get auto-created profile for Roberto
  await delay(500);
  const { data: rProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', robertoAuth.user.id)
    .single();
  if (!rProfile) throw new Error('Profile de Roberto nao encontrado');
  profileIds[1] = rProfile.id;

  // Update profile with correct role
  await supabase
    .from('profiles')
    .update({ role: 'admin', display_name: 'Roberto Carlos Mendes' })
    .eq('id', rProfile.id);

  // Create academy
  const { data: academy, error: aErr } = await supabase
    .from('academies')
    .insert({
      name: 'Academia Guerreiros do Tatame',
      slug: 'guerreiros-tatame',
      owner_id: robertoAuth.user.id,
    })
    .select('id')
    .single();
  if (aErr) throw new Error(`Erro ao criar academia: ${aErr.message}`);
  academyId = academy.id;

  // Create membership for Roberto
  await supabase.from('memberships').insert({
    profile_id: profileIds[1],
    academy_id: academyId,
    role: 'admin',
    status: 'active',
  });

  // Create units
  const { data: units, error: uErr } = await supabase
    .from('units')
    .insert([
      { academy_id: academyId, name: 'Sede Principal', address: 'Rua dos Atletas, 250 - Centro' },
      { academy_id: academyId, name: 'Filial Shopping', address: 'Av. Brasil, 1500 - Shopping Matozinhos, sala 205' },
    ])
    .select('id, name');
  if (uErr) throw new Error(`Erro ao criar unidades: ${uErr.message}`);
  unitSedeId = units!.find((u) => u.name === 'Sede Principal')!.id;
  unitFilialId = units!.find((u) => u.name === 'Filial Shopping')!.id;

  // Create modalities
  const modalityData = [
    { name: 'Jiu-Jitsu Brasileiro', belt_required: 'white' },
    { name: 'Judo', belt_required: 'white' },
    { name: 'Muay Thai', belt_required: 'white' },
    { name: 'MMA', belt_required: 'yellow' },
    { name: 'Jiu-Jitsu Kids', belt_required: 'white' },
  ];
  const { data: mods, error: mErr } = await supabase
    .from('modalities')
    .insert(modalityData.map((m) => ({ ...m, academy_id: academyId })))
    .select('id, name');
  if (mErr) throw new Error(`Erro ao criar modalidades: ${mErr.message}`);
  for (const m of mods!) {
    modalityIds[m.name] = m.id;
  }

  totalRecords += 1 + 2 + 5; // academy + units + modalities
  console.log('  Academia, 2 unidades e 5 modalidades criadas.');
}

// ── Step 2: Create Users ───────────────────────────────────────────────────

interface UserSpec {
  num: number;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'aluno_kids' | 'responsavel' | 'recepcao' | 'franqueador';
  belt?: string;
}

const USER_SPECS: UserSpec[] = [
  // Roberto (#1) already created in createAcademy
  { num: 2, name: 'Camila Ferreira Santos', email: 'camila@guerreiros.com', role: 'admin' },
  { num: 3, name: 'Andre Luis da Silva', email: 'andre@guerreiros.com', role: 'professor', belt: 'black' },
  { num: 4, name: 'Fernanda Oliveira', email: 'fernanda@guerreiros.com', role: 'professor', belt: 'black' },
  { num: 5, name: 'Thiago Nakamura', email: 'thiago@guerreiros.com', role: 'professor', belt: 'brown' },
  { num: 6, name: 'Joao Pedro Almeida', email: 'joao@email.com', role: 'aluno_adulto', belt: 'blue' },
  { num: 7, name: 'Marcos Vinicius Costa', email: 'marcos@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 8, name: 'Rafael Santos Lima', email: 'rafael@email.com', role: 'aluno_adulto', belt: 'purple' },
  { num: 9, name: 'Bruno Henrique Souza', email: 'bruno@email.com', role: 'aluno_adulto', belt: 'blue' },
  { num: 10, name: 'Luciana Pereira', email: 'luciana@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 11, name: 'Pedro Augusto Rocha', email: 'pedro@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 12, name: 'Ana Carolina Dias', email: 'anacarol@email.com', role: 'aluno_adulto', belt: 'blue' },
  { num: 13, name: 'Diego Martins', email: 'diego@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 14, name: 'Isabela Fonseca', email: 'isabela@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 15, name: 'Guilherme Neves', email: 'guilherme@email.com', role: 'aluno_adulto', belt: 'purple' },
  { num: 16, name: 'Juliana Alves', email: 'juliana@email.com', role: 'aluno_adulto', belt: 'blue' },
  { num: 17, name: 'Matheus Ribeiro', email: 'matheus@email.com', role: 'aluno_adulto', belt: 'white' },
  { num: 18, name: 'Lucas Gabriel Mendes', email: 'lucas.teen@email.com', role: 'aluno_teen', belt: 'yellow' },
  { num: 19, name: 'Sophia Oliveira', email: 'sophia@email.com', role: 'aluno_teen', belt: 'orange' },
  { num: 20, name: 'Gabriel Santos', email: 'gabriel.teen@email.com', role: 'aluno_teen', belt: 'white' },
  { num: 21, name: 'Valentina Costa', email: 'valentina@email.com', role: 'aluno_teen', belt: 'yellow' },
  { num: 22, name: 'Enzo Ferreira', email: 'enzo@email.com', role: 'aluno_teen', belt: 'white' },
  { num: 23, name: 'Miguel Pereira', email: 'miguel.kids@email.com', role: 'aluno_kids', belt: 'white' },
  { num: 24, name: 'Helena Costa', email: 'helena.kids@email.com', role: 'aluno_kids', belt: 'gray' },
  { num: 25, name: 'Arthur Nakamura', email: 'arthur.kids@email.com', role: 'aluno_kids', belt: 'white' },
  { num: 26, name: 'Laura Almeida', email: 'laura.kids@email.com', role: 'aluno_kids', belt: 'white' },
  { num: 27, name: 'Maria Clara Mendes', email: 'maria.resp@email.com', role: 'responsavel' },
  { num: 28, name: 'Patricia Oliveira', email: 'patricia@email.com', role: 'responsavel' },
  { num: 29, name: 'Carlos Pereira', email: 'carlos.resp@email.com', role: 'responsavel' },
  { num: 30, name: 'Renata Costa', email: 'renata@email.com', role: 'responsavel' },
  { num: 31, name: 'Julia Santos', email: 'julia@guerreiros.com', role: 'recepcao' },
  { num: 32, name: 'Fernando Almeida', email: 'fernando@guerreiros.com', role: 'franqueador' },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createUsers() {
  console.log('Criando 30 usuarios...');

  for (const spec of USER_SPECS) {
    // Roberto (#1) already created
    if (spec.num === 1) continue;

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: spec.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: spec.name },
    });
    if (authErr) {
      console.error(`  Erro usuario ${spec.num} (${spec.email}): ${authErr.message}`);
      continue;
    }
    userIds[spec.num] = authData.user.id;

    // Wait for trigger to create profile
    await delay(300);

    // Get auto-created profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (!profile) {
      console.error(`  Profile nao encontrado para ${spec.email}`);
      continue;
    }
    profileIds[spec.num] = profile.id;

    // Update profile with correct role and display_name
    await supabase
      .from('profiles')
      .update({ role: spec.role, display_name: spec.name })
      .eq('id', profile.id);

    // Create membership
    await supabase.from('memberships').insert({
      profile_id: profile.id,
      academy_id: academyId,
      role: spec.role,
      status: 'active',
    });

    // Create student record if applicable
    const isStudent = ['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(spec.role);
    if (isStudent && spec.belt) {
      // Compute started_at based on belt to make it realistic
      let monthsAgo = 1;
      if (spec.belt === 'purple') monthsAgo = 12;
      else if (spec.belt === 'blue') monthsAgo = 8;
      else if (spec.belt === 'orange') monthsAgo = 9;
      else if (spec.belt === 'yellow') monthsAgo = 7;
      else if (spec.belt === 'gray') monthsAgo = 6;
      else monthsAgo = randomBetween(1, 5);

      const startedAt = new Date();
      startedAt.setMonth(startedAt.getMonth() - monthsAgo);

      const { data: student, error: sErr } = await supabase
        .from('students')
        .insert({
          profile_id: profile.id,
          academy_id: academyId,
          belt: spec.belt,
          started_at: startedAt.toISOString(),
        })
        .select('id')
        .single();

      if (sErr) {
        console.error(`  Erro ao criar student ${spec.num}: ${sErr.message}`);
      } else {
        studentIds[spec.num] = student.id;
      }
    }

    // Professors also get a student record (for belt tracking)
    if (spec.role === 'professor' && spec.belt) {
      const startedAt = new Date();
      startedAt.setFullYear(startedAt.getFullYear() - randomBetween(5, 15));

      const { data: student } = await supabase
        .from('students')
        .insert({
          profile_id: profile.id,
          academy_id: academyId,
          belt: spec.belt,
          started_at: startedAt.toISOString(),
        })
        .select('id')
        .single();

      if (student) {
        studentIds[spec.num] = student.id;
      }
    }
  }

  totalRecords += 29 + 29 + 29; // auth + profiles + memberships (Roberto already counted)
  console.log(`  ${Object.keys(userIds).length} usuarios criados.`);
}

// ── Step 3: Guardian Links ─────────────────────────────────────────────────

async function createGuardians() {
  console.log('Criando vinculos de responsaveis...');

  const links: { guardian_num: number; student_num: number; relation: string }[] = [
    { guardian_num: 27, student_num: 18, relation: 'mae' },
    { guardian_num: 28, student_num: 19, relation: 'mae' },
    { guardian_num: 28, student_num: 23, relation: 'mae' },
    { guardian_num: 29, student_num: 20, relation: 'pai' },
    { guardian_num: 29, student_num: 24, relation: 'pai' },
    { guardian_num: 30, student_num: 21, relation: 'mae' },
    { guardian_num: 30, student_num: 26, relation: 'mae' },
  ];

  const rows = links
    .filter((l) => profileIds[l.guardian_num] && studentIds[l.student_num])
    .map((l) => ({
      guardian_profile_id: profileIds[l.guardian_num],
      student_id: studentIds[l.student_num],
      relation: l.relation,
    }));

  const { error } = await supabase.from('guardians').insert(rows);
  if (error) console.error('  Erro guardians:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} vinculos criados.`);
}

// ── Step 4: Classes + Enrollments ──────────────────────────────────────────

interface ClassSpec {
  key: string;
  name: string;
  modality: string;
  professorNum: number;
  unitKey: 'sede' | 'filial';
  schedule: { day_of_week: number; start_time: string; end_time: string }[];
  capacity: number;
}

const CLASS_SPECS: ClassSpec[] = [
  {
    key: 'bjj_ini', name: 'BJJ Iniciante', modality: 'Jiu-Jitsu Brasileiro', professorNum: 3,
    unitKey: 'sede', capacity: 25,
    schedule: [
      { day_of_week: 1, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 3, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 5, start_time: '19:00', end_time: '20:30' },
    ],
  },
  {
    key: 'bjj_av', name: 'BJJ Avancado', modality: 'Jiu-Jitsu Brasileiro', professorNum: 3,
    unitKey: 'sede', capacity: 20,
    schedule: [
      { day_of_week: 2, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 4, start_time: '19:00', end_time: '20:30' },
    ],
  },
  {
    key: 'judo', name: 'Judo Adulto', modality: 'Judo', professorNum: 4,
    unitKey: 'sede', capacity: 20,
    schedule: [
      { day_of_week: 2, start_time: '18:00', end_time: '19:30' },
      { day_of_week: 4, start_time: '18:00', end_time: '19:30' },
    ],
  },
  {
    key: 'mt_sede', name: 'Muay Thai Sede', modality: 'Muay Thai', professorNum: 3,
    unitKey: 'sede', capacity: 20,
    schedule: [
      { day_of_week: 1, start_time: '20:30', end_time: '22:00' },
      { day_of_week: 3, start_time: '20:30', end_time: '22:00' },
      { day_of_week: 5, start_time: '20:30', end_time: '22:00' },
    ],
  },
  {
    key: 'mma', name: 'MMA', modality: 'MMA', professorNum: 3,
    unitKey: 'sede', capacity: 15,
    schedule: [{ day_of_week: 6, start_time: '10:00', end_time: '12:00' }],
  },
  {
    key: 'kids', name: 'JiuJitsu Kids', modality: 'Jiu-Jitsu Kids', professorNum: 4,
    unitKey: 'sede', capacity: 20,
    schedule: [
      { day_of_week: 2, start_time: '17:00', end_time: '18:00' },
      { day_of_week: 4, start_time: '17:00', end_time: '18:00' },
    ],
  },
  {
    key: 'comp', name: 'Competicao BJJ', modality: 'Jiu-Jitsu Brasileiro', professorNum: 3,
    unitKey: 'sede', capacity: 10,
    schedule: [{ day_of_week: 6, start_time: '08:00', end_time: '10:00' }],
  },
  {
    key: 'open', name: 'Open Mat', modality: 'Jiu-Jitsu Brasileiro', professorNum: 3,
    unitKey: 'sede', capacity: 30,
    schedule: [{ day_of_week: 0, start_time: '09:00', end_time: '11:00' }],
  },
  {
    key: 'bjj_fil', name: 'BJJ Filial', modality: 'Jiu-Jitsu Brasileiro', professorNum: 5,
    unitKey: 'filial', capacity: 15,
    schedule: [
      { day_of_week: 1, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 3, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 5, start_time: '19:00', end_time: '20:30' },
    ],
  },
  {
    key: 'mt_fil', name: 'Muay Thai Filial', modality: 'Muay Thai', professorNum: 5,
    unitKey: 'filial', capacity: 15,
    schedule: [
      { day_of_week: 2, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 4, start_time: '19:00', end_time: '20:30' },
    ],
  },
  {
    key: 'func', name: 'Funcional Luta', modality: 'Muay Thai', professorNum: 5,
    unitKey: 'filial', capacity: 20,
    schedule: [{ day_of_week: 6, start_time: '09:00', end_time: '10:00' }],
  },
];

async function createClasses() {
  console.log('Criando 11 turmas...');

  for (const cls of CLASS_SPECS) {
    const unitId = cls.unitKey === 'sede' ? unitSedeId : unitFilialId;
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: cls.name,
        modality_id: modalityIds[cls.modality],
        unit_id: unitId,
        academy_id: academyId,
        professor_id: profileIds[cls.professorNum],
        schedule: cls.schedule,
        capacity: cls.capacity,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Erro turma ${cls.key}: ${error.message}`);
      continue;
    }
    classIds[cls.key] = data.id;
  }

  totalRecords += Object.keys(classIds).length;
  console.log(`  ${Object.keys(classIds).length} turmas criadas.`);
}

// Enrollment mapping: class_key -> student_nums
const ENROLLMENT_MAP: Record<string, number[]> = {
  bjj_ini: [7, 11, 10, 13, 14, 18, 19, 20, 21, 22],
  bjj_av: [6, 8, 9, 12, 15, 16],
  judo: [9, 16, 18, 20, 26],
  mt_sede: [10, 12, 13, 19, 21, 17],
  mma: [6, 8, 12, 17],
  kids: [23, 24, 25, 26],
  comp: [6, 8, 12, 19],
};

async function createEnrollments() {
  console.log('Criando matriculas em turmas...');

  let count = 0;
  for (const [classKey, studentNums] of Object.entries(ENROLLMENT_MAP)) {
    const cid = classIds[classKey];
    if (!cid) continue;

    const rows = studentNums
      .filter((n) => studentIds[n])
      .map((n) => ({
        student_id: studentIds[n],
        class_id: cid,
        status: 'active',
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('class_enrollments').insert(rows);
      if (error) console.error(`  Erro enrollments ${classKey}: ${error.message}`);
      count += rows.length;
    }
  }

  totalRecords += count;
  console.log(`  ${count} matriculas criadas.`);
}

// ── Step 5: Attendance ─────────────────────────────────────────────────────

interface AttendanceConfig {
  studentNum: number;
  targetTotal: number;
  freqPerWeek: number;
  monthsActive: number;
  stoppedDaysAgo?: number; // if the student stopped attending
  classKeys: string[]; // which classes to attend
}

const ATTENDANCE_CONFIGS: AttendanceConfig[] = [
  { studentNum: 6, targetTotal: 142, freqPerWeek: 4, monthsActive: 10, classKeys: ['bjj_av', 'comp', 'mma'] },
  { studentNum: 7, targetTotal: 18, freqPerWeek: 2, monthsActive: 3, classKeys: ['bjj_ini'] },
  { studentNum: 8, targetTotal: 245, freqPerWeek: 5, monthsActive: 12, classKeys: ['bjj_av', 'comp', 'mma'] },
  { studentNum: 9, targetTotal: 87, freqPerWeek: 3, monthsActive: 8, classKeys: ['bjj_av', 'judo'] },
  { studentNum: 10, targetTotal: 52, freqPerWeek: 3, monthsActive: 5, classKeys: ['bjj_ini', 'mt_sede'] },
  { studentNum: 11, targetTotal: 14, freqPerWeek: 2, monthsActive: 2, classKeys: ['bjj_ini'] },
  { studentNum: 12, targetTotal: 128, freqPerWeek: 4, monthsActive: 9, classKeys: ['bjj_av', 'mt_sede', 'comp', 'mma'] },
  { studentNum: 13, targetTotal: 38, freqPerWeek: 3, monthsActive: 4, classKeys: ['bjj_ini', 'mt_sede'] },
  { studentNum: 14, targetTotal: 6, freqPerWeek: 2, monthsActive: 1, classKeys: ['bjj_ini'] },
  { studentNum: 15, targetTotal: 156, freqPerWeek: 4, monthsActive: 10, stoppedDaysAgo: 8, classKeys: ['bjj_av'] },
  { studentNum: 16, targetTotal: 95, freqPerWeek: 3, monthsActive: 8, classKeys: ['bjj_av', 'judo'] },
  { studentNum: 17, targetTotal: 78, freqPerWeek: 4, monthsActive: 6, classKeys: ['mt_sede', 'mma'] },
  // Teens
  { studentNum: 18, targetTotal: 60, freqPerWeek: 3, monthsActive: 7, classKeys: ['bjj_ini', 'judo'] },
  { studentNum: 19, targetTotal: 72, freqPerWeek: 3, monthsActive: 9, classKeys: ['bjj_ini', 'mt_sede', 'comp'] },
  { studentNum: 20, targetTotal: 40, freqPerWeek: 2, monthsActive: 5, classKeys: ['bjj_ini', 'judo'] },
  { studentNum: 21, targetTotal: 48, freqPerWeek: 2, monthsActive: 7, classKeys: ['bjj_ini', 'mt_sede'] },
  { studentNum: 22, targetTotal: 30, freqPerWeek: 2, monthsActive: 4, classKeys: ['bjj_ini'] },
  // Kids
  { studentNum: 23, targetTotal: 35, freqPerWeek: 2, monthsActive: 5, classKeys: ['kids'] },
  { studentNum: 24, targetTotal: 42, freqPerWeek: 3, monthsActive: 6, classKeys: ['kids'] },
  { studentNum: 25, targetTotal: 28, freqPerWeek: 2, monthsActive: 4, classKeys: ['kids'] },
  { studentNum: 26, targetTotal: 20, freqPerWeek: 2, monthsActive: 5, classKeys: ['kids', 'judo'] },
];

async function generateAttendance() {
  console.log('Gerando presencas...');

  const allAttendance: {
    student_id: string;
    class_id: string;
    checked_at: string;
    method: string;
  }[] = [];

  for (const cfg of ATTENDANCE_CONFIGS) {
    const sid = studentIds[cfg.studentNum];
    if (!sid) continue;

    // Determine date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - cfg.monthsActive);
    if (startDate < new Date('2025-10-01')) {
      startDate.setTime(new Date('2025-10-01').getTime());
    }

    const endDate = cfg.stoppedDaysAgo ? daysAgo(cfg.stoppedDaysAgo) : new Date();

    // Get class schedules for this student
    const classSchedules: { classId: string; schedule: { day_of_week: number; start_time: string }[] }[] = [];
    for (const ck of cfg.classKeys) {
      const cid = classIds[ck];
      if (!cid) continue;
      const spec = CLASS_SPECS.find((c) => c.key === ck);
      if (!spec) continue;
      classSchedules.push({ classId: cid, schedule: spec.schedule });
    }

    // Generate all possible attendance dates
    const possibleDates: { date: string; classId: string; startTime: string }[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      if (!isSkipDate(cursor)) {
        const dow = cursor.getDay();
        for (const cs of classSchedules) {
          for (const s of cs.schedule) {
            if (s.day_of_week === dow) {
              possibleDates.push({
                date: isoDate(cursor),
                classId: cs.classId,
                startTime: s.start_time,
              });
            }
          }
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    // Sample to reach target total
    const target = Math.min(cfg.targetTotal, possibleDates.length);

    // Shuffle and pick
    const shuffled = possibleDates.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, target);

    // Deduplicate by (student, class, date)
    const seen = new Set<string>();
    for (const s of selected) {
      const key = `${sid}|${s.classId}|${s.date}`;
      if (seen.has(key)) continue;
      seen.add(key);

      allAttendance.push({
        student_id: sid,
        class_id: s.classId,
        checked_at: buildCheckedAt(s.date, s.startTime),
        method: Math.random() < 0.7 ? 'manual' : 'qr_code',
      });
    }
  }

  // Insert in batches of 500
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < allAttendance.length; i += batchSize) {
    const batch = allAttendance.slice(i, i + batchSize);
    const { error } = await supabase.from('attendance').insert(batch);
    if (error) {
      console.error(`  Erro batch attendance ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  totalRecords += inserted;
  console.log(`  ${inserted} presencas geradas.`);
}

// ── Step 6: Evaluations ────────────────────────────────────────────────────

interface EvalConfig {
  studentNum: number;
  techniqueScores: number[];
  classKey: string;
}

const EVAL_CONFIGS: EvalConfig[] = [
  { studentNum: 6, techniqueScores: [72, 78, 82, 85, 88], classKey: 'bjj_av' },
  { studentNum: 8, techniqueScores: [88, 90, 92, 94, 95], classKey: 'bjj_av' },
  { studentNum: 7, techniqueScores: [40, 45, 50, 55], classKey: 'bjj_ini' },
  { studentNum: 10, techniqueScores: [55, 62, 68, 72, 78], classKey: 'bjj_ini' },
  { studentNum: 15, techniqueScores: [85, 88, 85, 82, 80], classKey: 'bjj_av' },
  { studentNum: 9, techniqueScores: [68, 72, 75, 78], classKey: 'bjj_av' },
  { studentNum: 12, techniqueScores: [75, 80, 83, 86], classKey: 'bjj_av' },
  { studentNum: 11, techniqueScores: [45, 52], classKey: 'bjj_ini' },
  { studentNum: 19, techniqueScores: [65, 70, 75, 78], classKey: 'bjj_ini' },
  { studentNum: 18, techniqueScores: [60, 65, 70], classKey: 'bjj_ini' },
  { studentNum: 16, techniqueScores: [70, 75, 78, 82], classKey: 'bjj_av' },
  { studentNum: 17, techniqueScores: [58, 64, 70, 75], classKey: 'mt_sede' },
  { studentNum: 13, techniqueScores: [50, 56, 62], classKey: 'bjj_ini' },
];

const OBSERVATIONS: Record<string, string[]> = {
  technique: [
    'Boa execucao da guarda fechada.',
    'Precisa melhorar a base na montada.',
    'Transicoes mais fluidas neste mes.',
    'Raspagem de gancho evoluindo bem.',
    'Finalizacoes precisam mais polimento.',
    'Boa leitura de jogo, antecipa movimentos.',
    'Armlock com boa mecanica.',
    'Posicionamento defensivo excelente.',
  ],
  discipline: [
    'Sempre pontual e respeitoso.',
    'Chegou atrasado algumas vezes.',
    'Excelente disciplina, referencia para turma.',
    'Segue orientacoes e corrige erros.',
    'Precisa manter foco durante o treino.',
  ],
  evolution: [
    'Evolucao muito acima da media.',
    'Progresso constante mês a mês.',
    'Ritmo de evolucao esta diminuindo.',
    'Surpreendendo com o progresso.',
    'Evolucao dentro do esperado.',
  ],
  attendance: [
    'Frequencia exemplar.',
    'Presenca irregular neste periodo.',
    'Frequencia boa, pode ser melhor.',
    'Faltou pouco, muito consistente.',
  ],
};

async function generateEvaluations() {
  console.log('Gerando avaliacoes...');

  const rows: {
    student_id: string;
    class_id: string;
    criteria: string;
    score: number;
    observation: string;
    created_at: string;
  }[] = [];

  for (const cfg of EVAL_CONFIGS) {
    const sid = studentIds[cfg.studentNum];
    const cid = classIds[cfg.classKey];
    if (!sid || !cid) continue;

    for (let i = 0; i < cfg.techniqueScores.length; i++) {
      const monthOffset = cfg.techniqueScores.length - i;
      const evalDate = new Date();
      evalDate.setMonth(evalDate.getMonth() - monthOffset);
      evalDate.setDate(15); // mid-month

      const techScore = cfg.techniqueScores[i];

      // technique
      rows.push({
        student_id: sid,
        class_id: cid,
        criteria: 'technique',
        score: techScore,
        observation: randomPick(OBSERVATIONS.technique),
        created_at: evalDate.toISOString(),
      });

      // discipline
      rows.push({
        student_id: sid,
        class_id: cid,
        criteria: 'discipline',
        score: Math.min(100, techScore + randomBetween(-5, 10)),
        observation: randomPick(OBSERVATIONS.discipline),
        created_at: evalDate.toISOString(),
      });

      // evolution
      rows.push({
        student_id: sid,
        class_id: cid,
        criteria: 'evolution',
        score: Math.min(100, techScore + randomBetween(-8, 5)),
        observation: randomPick(OBSERVATIONS.evolution),
        created_at: evalDate.toISOString(),
      });

      // attendance
      rows.push({
        student_id: sid,
        class_id: cid,
        criteria: 'attendance',
        score: Math.min(100, techScore + randomBetween(-10, 15)),
        observation: randomPick(OBSERVATIONS.attendance),
        created_at: evalDate.toISOString(),
      });
    }
  }

  const { error } = await supabase.from('evaluations').insert(rows);
  if (error) console.error('  Erro evaluations:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} avaliacoes geradas.`);
}

// ── Step 7: Progressions ───────────────────────────────────────────────────

interface ProgressionSpec {
  studentNum: number;
  from_belt: string;
  to_belt: string;
  monthsAgo: number;
  evaluatedByNum: number;
}

const PROGRESSIONS: ProgressionSpec[] = [
  { studentNum: 8, from_belt: 'white', to_belt: 'blue', monthsAgo: 9, evaluatedByNum: 3 },
  { studentNum: 8, from_belt: 'blue', to_belt: 'purple', monthsAgo: 2, evaluatedByNum: 3 },
  { studentNum: 6, from_belt: 'white', to_belt: 'blue', monthsAgo: 5, evaluatedByNum: 3 },
  { studentNum: 9, from_belt: 'white', to_belt: 'blue', monthsAgo: 4, evaluatedByNum: 3 },
  { studentNum: 12, from_belt: 'white', to_belt: 'blue', monthsAgo: 6, evaluatedByNum: 3 },
  { studentNum: 16, from_belt: 'white', to_belt: 'blue', monthsAgo: 3, evaluatedByNum: 3 },
  { studentNum: 19, from_belt: 'white', to_belt: 'yellow', monthsAgo: 7, evaluatedByNum: 4 },
  { studentNum: 19, from_belt: 'yellow', to_belt: 'orange', monthsAgo: 2, evaluatedByNum: 4 },
  { studentNum: 18, from_belt: 'white', to_belt: 'yellow', monthsAgo: 4, evaluatedByNum: 4 },
  { studentNum: 24, from_belt: 'white', to_belt: 'gray', monthsAgo: 3, evaluatedByNum: 4 },
  { studentNum: 15, from_belt: 'white', to_belt: 'blue', monthsAgo: 8, evaluatedByNum: 3 },
  { studentNum: 15, from_belt: 'blue', to_belt: 'purple', monthsAgo: 3, evaluatedByNum: 3 },
];

async function createProgressions() {
  console.log('Criando progressoes de faixa...');

  const rows = PROGRESSIONS
    .filter((p) => studentIds[p.studentNum] && profileIds[p.evaluatedByNum])
    .map((p) => {
      const d = new Date();
      d.setMonth(d.getMonth() - p.monthsAgo);
      return {
        student_id: studentIds[p.studentNum],
        evaluated_by: profileIds[p.evaluatedByNum],
        from_belt: p.from_belt,
        to_belt: p.to_belt,
        created_at: d.toISOString(),
      };
    });

  const { error } = await supabase.from('progressions').insert(rows);
  if (error) console.error('  Erro progressions:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} progressoes criadas.`);
}

// ── Step 8: Achievements ───────────────────────────────────────────────────

async function createAchievements() {
  console.log('Gerando conquistas...');

  // We need the professor profile as granted_by
  const grantedBy = profileIds[3]; // André

  interface AchievementDef {
    name: string;
    type: string;
    category: string;
    rarity: string;
    xp_reward: number;
    studentNums: number[];
  }

  const defs: AchievementDef[] = [
    {
      name: 'Primeira Aula',
      type: 'class_milestone',
      category: 'frequencia',
      rarity: 'common',
      xp_reward: 10,
      studentNums: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    },
    {
      name: '10 Aulas',
      type: 'class_milestone',
      category: 'frequencia',
      rarity: 'common',
      xp_reward: 25,
      studentNums: [6, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    },
    {
      name: '50 Aulas',
      type: 'class_milestone',
      category: 'frequencia',
      rarity: 'rare',
      xp_reward: 100,
      studentNums: [6, 8, 12, 15, 10, 9, 16, 17, 19],
    },
    {
      name: '100 Aulas',
      type: 'class_milestone',
      category: 'frequencia',
      rarity: 'epic',
      xp_reward: 250,
      studentNums: [6, 8, 12, 15],
    },
    {
      name: 'Streak 7 dias',
      type: 'attendance_streak',
      category: 'consistencia',
      rarity: 'rare',
      xp_reward: 50,
      studentNums: [6, 8, 12, 10, 17, 19],
    },
    {
      name: 'Streak 14 dias',
      type: 'attendance_streak',
      category: 'consistencia',
      rarity: 'epic',
      xp_reward: 100,
      studentNums: [6, 8, 12],
    },
    {
      name: 'Streak 30 dias',
      type: 'attendance_streak',
      category: 'consistencia',
      rarity: 'legendary',
      xp_reward: 300,
      studentNums: [8],
    },
    // Belt promotions as achievements
    { name: 'Faixa Azul', type: 'belt_promotion', category: 'graduacao', rarity: 'epic', xp_reward: 200, studentNums: [6, 8, 9, 12, 15, 16] },
    { name: 'Faixa Roxa', type: 'belt_promotion', category: 'graduacao', rarity: 'epic', xp_reward: 200, studentNums: [8, 15] },
    { name: 'Faixa Amarela', type: 'belt_promotion', category: 'graduacao', rarity: 'epic', xp_reward: 200, studentNums: [18, 19] },
    { name: 'Faixa Laranja', type: 'belt_promotion', category: 'graduacao', rarity: 'epic', xp_reward: 200, studentNums: [19] },
    { name: 'Faixa Cinza', type: 'belt_promotion', category: 'graduacao', rarity: 'epic', xp_reward: 200, studentNums: [24] },
    // Cross-training
    { name: 'Cross-training', type: 'custom', category: 'versatilidade', rarity: 'rare', xp_reward: 75, studentNums: [9, 16, 12] },
    // Estudioso
    { name: 'Estudioso', type: 'custom', category: 'conteudo', rarity: 'rare', xp_reward: 50, studentNums: [8, 6, 12] },
  ];

  const rows: any[] = [];
  for (const def of defs) {
    for (const sn of def.studentNums) {
      const sid = studentIds[sn];
      if (!sid) continue;
      const grantDate = new Date();
      grantDate.setDate(grantDate.getDate() - randomBetween(1, 90));
      rows.push({
        student_id: sid,
        type: def.type,
        name: def.name,
        description: `Conquista: ${def.name}`,
        category: def.category,
        rarity: def.rarity,
        xp_reward: def.xp_reward,
        granted_at: grantDate.toISOString(),
        granted_by: grantedBy,
      });
    }
  }

  // Insert in batches
  const batchSize = 100;
  let count = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('achievements').insert(batch);
    if (error) console.error(`  Erro achievements batch ${i}: ${error.message}`);
    else count += batch.length;
  }

  totalRecords += count;
  console.log(`  ${count} conquistas geradas.`);
}

// ── Step 9: Plans + Subscriptions + Invoices ───────────────────────────────

async function createFinancial() {
  console.log('Criando planos, assinaturas e faturas...');

  // Plans
  const planData = [
    { name: 'Basico', price: 129.0, interval: 'monthly', features: JSON.stringify({ max_classes: 3, modalities: 1 }) },
    { name: 'Padrao', price: 179.0, interval: 'monthly', features: JSON.stringify({ max_classes: 5, modalities: 2 }) },
    { name: 'Premium', price: 229.0, interval: 'monthly', features: JSON.stringify({ max_classes: 'unlimited', modalities: 'all' }) },
    { name: 'Familia', price: 299.0, interval: 'monthly', features: JSON.stringify({ max_classes: 'unlimited', modalities: 'all', family: true }) },
    { name: 'Kids', price: 99.0, interval: 'monthly', features: JSON.stringify({ max_classes: 3, modalities: 1, age_group: 'kids' }) },
    { name: 'Teen', price: 149.0, interval: 'monthly', features: JSON.stringify({ max_classes: 4, modalities: 2, age_group: 'teen' }) },
  ];

  const { data: plans, error: pErr } = await supabase
    .from('plans')
    .insert(planData.map((p) => ({ ...p, academy_id: academyId })))
    .select('id, name');
  if (pErr) throw new Error(`Erro planos: ${pErr.message}`);
  for (const p of plans!) {
    planIds[p.name] = p.id;
  }
  totalRecords += plans!.length;

  // Subscriptions
  interface SubSpec {
    studentNum: number;
    planName: string;
    price: number;
    status: string;
  }

  const subSpecs: SubSpec[] = [
    { studentNum: 6, planName: 'Premium', price: 229, status: 'active' },
    { studentNum: 7, planName: 'Basico', price: 129, status: 'past_due' },
    { studentNum: 8, planName: 'Premium', price: 229, status: 'active' },
    { studentNum: 9, planName: 'Padrao', price: 179, status: 'active' },
    { studentNum: 10, planName: 'Padrao', price: 179, status: 'active' },
    { studentNum: 11, planName: 'Basico', price: 129, status: 'active' },
    { studentNum: 12, planName: 'Premium', price: 229, status: 'active' },
    { studentNum: 13, planName: 'Padrao', price: 179, status: 'active' },
    { studentNum: 14, planName: 'Basico', price: 129, status: 'active' },
    { studentNum: 15, planName: 'Premium', price: 229, status: 'past_due' },
    { studentNum: 16, planName: 'Padrao', price: 179, status: 'active' },
    { studentNum: 17, planName: 'Padrao', price: 179, status: 'active' },
    { studentNum: 18, planName: 'Teen', price: 149, status: 'active' },
    { studentNum: 19, planName: 'Teen', price: 149, status: 'active' },
    { studentNum: 20, planName: 'Teen', price: 149, status: 'active' },
    { studentNum: 21, planName: 'Teen', price: 149, status: 'active' },
    { studentNum: 22, planName: 'Teen', price: 149, status: 'active' },
    { studentNum: 23, planName: 'Kids', price: 99, status: 'active' },
    { studentNum: 24, planName: 'Kids', price: 99, status: 'active' },
    { studentNum: 25, planName: 'Kids', price: 99, status: 'active' },
    { studentNum: 26, planName: 'Kids', price: 99, status: 'active' },
  ];

  for (const ss of subSpecs) {
    const sid = studentIds[ss.studentNum];
    if (!sid) continue;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(1);

    const { data: sub, error } = await supabase
      .from('subscriptions')
      .insert({
        student_id: sid,
        plan_id: planIds[ss.planName],
        status: ss.status,
        current_period_end: periodEnd.toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Erro subscription ${ss.studentNum}: ${error.message}`);
      continue;
    }
    subscriptionIds[ss.studentNum] = sub.id;
  }

  totalRecords += subSpecs.length;

  // Invoices: October 2025 through March 2026 (6 months x 21 students)
  const months = [
    { year: 2025, month: 10 },
    { year: 2025, month: 11 },
    { year: 2025, month: 12 },
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
    { year: 2026, month: 3 },
  ];

  const invoiceRows: any[] = [];
  const paymentMethods = ['pix', 'pix', 'pix', 'pix', 'pix', 'pix', 'boleto', 'boleto', 'boleto', 'cartao'];

  // Pick 3 random student/month combos that will be paid 1-3 days late
  const latePayments = new Set<string>();
  while (latePayments.size < 3) {
    const sn = randomPick(subSpecs.filter((s) => s.status === 'active')).studentNum;
    const mi = randomBetween(0, 4); // not March
    latePayments.add(`${sn}-${mi}`);
  }

  for (let mi = 0; mi < months.length; mi++) {
    const m = months[mi];
    const dueDate = new Date(m.year, m.month - 1, 10);
    const isCurrentMonth = m.year === 2026 && m.month === 3;

    for (const ss of subSpecs) {
      const subId = subscriptionIds[ss.studentNum];
      if (!subId) continue;

      let status = 'paid';
      let paidAt: string | null = null;

      if (isCurrentMonth && ss.studentNum === 7) {
        // Marcos March: overdue 5 days
        status = 'open';
      } else if (isCurrentMonth && ss.studentNum === 15) {
        // Guilherme March: overdue 12 days
        status = 'open';
      } else if (latePayments.has(`${ss.studentNum}-${mi}`)) {
        // Paid 1-3 days late
        status = 'paid';
        const lateDays = randomBetween(1, 3);
        const paid = new Date(dueDate);
        paid.setDate(paid.getDate() + lateDays);
        paidAt = paid.toISOString();
      } else {
        // Paid on time (within 3 days of due_date)
        const daysBefore = randomBetween(0, 3);
        const paid = new Date(dueDate);
        paid.setDate(paid.getDate() - daysBefore);
        paidAt = paid.toISOString();
      }

      invoiceRows.push({
        subscription_id: subId,
        amount: ss.price,
        status,
        due_date: isoDate(dueDate),
        paid_at: paidAt,
        created_at: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1).toISOString(),
      });
    }
  }

  // Insert invoices in batches
  const batchSize = 50;
  let invoiceCount = 0;
  for (let i = 0; i < invoiceRows.length; i += batchSize) {
    const batch = invoiceRows.slice(i, i + batchSize);
    const { error } = await supabase.from('invoices').insert(batch);
    if (error) console.error(`  Erro invoices batch ${i}: ${error.message}`);
    else invoiceCount += batch.length;
  }

  totalRecords += invoiceCount;
  console.log(`  ${plans!.length} planos, ${Object.keys(subscriptionIds).length} assinaturas, ${invoiceCount} faturas criadas.`);
}

// ── Step 10: Messages ──────────────────────────────────────────────────────

async function createMessages() {
  console.log('Criando mensagens...');

  interface Msg {
    from_num: number;
    to_num: number;
    content: string;
    daysAgo: number;
    read: boolean;
  }

  const msgs: Msg[] = [
    // André → João
    { from_num: 3, to_num: 6, content: 'Joao, seu armlock na terca estava muito bom. Foca na transicao mount→braco.', daysAgo: 3, read: true },
    { from_num: 6, to_num: 3, content: 'Valeu professor! Vou assistir o video que indicou. Ate quinta!', daysAgo: 3, read: true },
    // André → Marcos
    { from_num: 3, to_num: 7, content: 'Marcos, senti sua falta essa semana. Ta tudo bem?', daysAgo: 5, read: true },
    { from_num: 7, to_num: 3, content: 'Oi professor, hora extra no trabalho. Semana que vem volto!', daysAgo: 4, read: true },
    // André → Guilherme (no reply)
    { from_num: 3, to_num: 15, content: 'Guilherme, faz 8 dias que nao aparece. Ta acontecendo alguma coisa?', daysAgo: 1, read: false },
    // André → Luciana
    { from_num: 3, to_num: 10, content: 'Luciana, suas avaliacoes estao otimas. Mais 2 meses e faixa azul!', daysAgo: 2, read: true },
    { from_num: 10, to_num: 3, content: 'Que felicidade professor!! Vou continuar firme!', daysAgo: 2, read: true },
    // André → Isabela
    { from_num: 3, to_num: 14, content: 'Isabela, como esta se sentindo nas primeiras semanas?', daysAgo: 6, read: true },
    { from_num: 14, to_num: 3, content: 'Adorando professor! So estou com dor no braco do armlock kkk', daysAgo: 5, read: true },
    { from_num: 3, to_num: 14, content: 'Normal no comeco! Vai passando.', daysAgo: 5, read: true },
    // Fernanda → Patrícia (responsavel)
    { from_num: 4, to_num: 28, content: 'Patricia, a Sophia esta evoluindo muito. Quero indicar pro campeonato.', daysAgo: 4, read: true },
    { from_num: 28, to_num: 4, content: 'Claro professora! Pode me passar detalhes?', daysAgo: 3, read: true },
    // Fernanda → Renata
    { from_num: 4, to_num: 30, content: 'Renata, a Laura vem so 1x/semana. Ideal seria 2x.', daysAgo: 7, read: true },
    { from_num: 30, to_num: 4, content: 'Ela tem natacao na terca. Vou reorganizar.', daysAgo: 6, read: true },
    // Fernanda → Carlos
    { from_num: 4, to_num: 29, content: 'Carlos, Gabriel e Helena estao indo muito bem!', daysAgo: 2, read: true },
    { from_num: 29, to_num: 4, content: 'Obrigado professora! Helena ja diz que quer ser faixa preta', daysAgo: 1, read: true },
    // Additional conversations
    { from_num: 3, to_num: 8, content: 'Rafael, excelente treino hoje. Voce esta pronto pro campeonato!', daysAgo: 1, read: true },
    { from_num: 8, to_num: 3, content: 'Obrigado professor! Estou muito motivado.', daysAgo: 1, read: true },
    { from_num: 3, to_num: 12, content: 'Ana Carol, boa evolucao essa semana. O estrangulamento esta perfeito.', daysAgo: 2, read: true },
    { from_num: 12, to_num: 3, content: 'Obrigada professor! Treinando bastante em casa tambem.', daysAgo: 2, read: true },
  ];

  const rows = msgs
    .filter((m) => profileIds[m.from_num] && profileIds[m.to_num])
    .map((m) => {
      const d = new Date();
      d.setDate(d.getDate() - m.daysAgo);
      d.setHours(randomBetween(8, 22), randomBetween(0, 59));
      return {
        from_id: profileIds[m.from_num],
        to_id: profileIds[m.to_num],
        channel: 'direct',
        content: m.content,
        read_at: m.read ? d.toISOString() : null,
        created_at: d.toISOString(),
      };
    });

  const { error } = await supabase.from('messages').insert(rows);
  if (error) console.error('  Erro messages:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} mensagens criadas.`);
}

// ── Step 11: Notifications ─────────────────────────────────────────────────

async function createNotifications() {
  console.log('Criando notificacoes...');

  const notifs: { user_num: number; type: string; title: string; body: string; daysAgo: number; read: boolean }[] = [
    // Class reminders
    { user_num: 6, type: 'class_reminder', title: 'Aula em 1 hora', body: 'BJJ Avancado comeca as 19:00', daysAgo: 0, read: false },
    { user_num: 8, type: 'class_reminder', title: 'Aula em 1 hora', body: 'BJJ Avancado comeca as 19:00', daysAgo: 0, read: false },
    { user_num: 12, type: 'class_reminder', title: 'Aula em 1 hora', body: 'BJJ Avancado comeca as 19:00', daysAgo: 0, read: true },
    // Achievement unlocks
    { user_num: 8, type: 'achievement', title: 'Nova conquista!', body: 'Voce desbloqueou Streak 30 dias!', daysAgo: 2, read: true },
    { user_num: 6, type: 'achievement', title: 'Nova conquista!', body: 'Voce desbloqueou 100 Aulas!', daysAgo: 5, read: true },
    { user_num: 19, type: 'achievement', title: 'Nova conquista!', body: 'Voce desbloqueou 50 Aulas!', daysAgo: 3, read: true },
    // Payment reminders
    { user_num: 7, type: 'payment', title: 'Pagamento pendente', body: 'Sua fatura de Marco esta pendente ha 5 dias.', daysAgo: 0, read: false },
    { user_num: 15, type: 'payment', title: 'Pagamento pendente', body: 'Sua fatura de Marco esta pendente ha 12 dias.', daysAgo: 0, read: false },
    // Message notifications
    { user_num: 15, type: 'message', title: 'Nova mensagem', body: 'Prof. Andre te enviou uma mensagem.', daysAgo: 1, read: false },
    { user_num: 6, type: 'message', title: 'Nova mensagem', body: 'Prof. Andre te enviou uma mensagem.', daysAgo: 3, read: true },
    // Challenge notification
    { user_num: 8, type: 'challenge', title: 'Desafio proximo!', body: 'Faltam 2 aulas para completar Guerreiro de Marco!', daysAgo: 1, read: true },
    { user_num: 6, type: 'challenge', title: 'Desafio proximo!', body: 'Faltam 4 aulas para completar Guerreiro de Marco!', daysAgo: 1, read: false },
    // Evaluation notification
    { user_num: 10, type: 'evaluation', title: 'Nova avaliacao', body: 'O professor Andre registrou sua avaliacao mensal.', daysAgo: 2, read: true },
    { user_num: 9, type: 'evaluation', title: 'Nova avaliacao', body: 'O professor Andre registrou sua avaliacao mensal.', daysAgo: 2, read: true },
    // Event reminders
    { user_num: 6, type: 'event', title: 'Evento: Seminario', body: 'Seminario Prof. Convidado em 20/04. Garanta sua vaga!', daysAgo: 3, read: true },
    { user_num: 8, type: 'event', title: 'Evento: Campeonato', body: 'Campeonato Interno BJJ em 15/05. Inscricoes abertas!', daysAgo: 2, read: true },
    // Graduation
    { user_num: 18, type: 'event', title: 'Graduacao Trimestral', body: 'Nao perca a Graduacao em 30/04!', daysAgo: 1, read: false },
    { user_num: 19, type: 'event', title: 'Graduacao Trimestral', body: 'Nao perca a Graduacao em 30/04!', daysAgo: 1, read: false },
    // Welcome
    { user_num: 14, type: 'system', title: 'Bem-vinda!', body: 'Bem-vinda a Academia Guerreiros do Tatame!', daysAgo: 7, read: true },
    // Inactivity
    { user_num: 15, type: 'inactivity', title: 'Sentimos sua falta!', body: 'Guilherme, faz 8 dias que nao te vemos. Tudo bem?', daysAgo: 0, read: false },
    // New video
    { user_num: 6, type: 'content', title: 'Novo video disponivel', body: 'Confira: Armlock da guarda - Detalhes avanvados', daysAgo: 4, read: true },
    { user_num: 8, type: 'content', title: 'Novo video disponivel', body: 'Confira: Estrategia de Competicao', daysAgo: 4, read: true },
  ];

  const rows = notifs
    .filter((n) => userIds[n.user_num])
    .map((n) => {
      const d = new Date();
      d.setDate(d.getDate() - n.daysAgo);
      d.setHours(randomBetween(7, 21), randomBetween(0, 59));
      return {
        user_id: userIds[n.user_num],
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
        created_at: d.toISOString(),
      };
    });

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) console.error('  Erro notifications:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} notificacoes criadas.`);
}

// ── Step 12: Videos + Series + Progress ────────────────────────────────────

async function createVideos() {
  console.log('Criando videos e series...');

  // Series definitions
  const seriesDefs = [
    { key: 'fund_bjj', title: 'Fundamentos BJJ' },
    { key: 'inter_bjj', title: 'BJJ Intermediario' },
    { key: 'judo_jj', title: 'Judo para Jiu-Jiteiro' },
  ];

  for (const sd of seriesDefs) {
    const { data, error } = await supabase
      .from('series')
      .insert({ academy_id: academyId, title: sd.title })
      .select('id')
      .single();
    if (error) console.error(`  Erro series ${sd.key}: ${error.message}`);
    else seriesIds[sd.key] = data.id;
  }
  totalRecords += seriesDefs.length;

  // Video definitions
  interface VideoDef {
    title: string;
    belt_level: string;
    duration: number;
    seriesKey?: string;
    position?: number;
    url: string;
  }

  const videoDefs: VideoDef[] = [
    // Fundamentos BJJ (5)
    { title: 'Postura base e posicionamento', belt_level: 'white', duration: 480, seriesKey: 'fund_bjj', position: 1, url: 'https://storage.example.com/videos/fundamentos-bjj-01.mp4' },
    { title: 'Guarda fechada - Controle e quebra de postura', belt_level: 'white', duration: 720, seriesKey: 'fund_bjj', position: 2, url: 'https://storage.example.com/videos/fundamentos-bjj-02.mp4' },
    { title: 'Passagem de guarda basica - Over-under', belt_level: 'white', duration: 600, seriesKey: 'fund_bjj', position: 3, url: 'https://storage.example.com/videos/fundamentos-bjj-03.mp4' },
    { title: 'Montada e controle de costas', belt_level: 'white', duration: 900, seriesKey: 'fund_bjj', position: 4, url: 'https://storage.example.com/videos/fundamentos-bjj-04.mp4' },
    { title: 'Finalizacoes basicas - Armlock e Triangulo', belt_level: 'white', duration: 780, seriesKey: 'fund_bjj', position: 5, url: 'https://storage.example.com/videos/fundamentos-bjj-05.mp4' },
    // BJJ Intermediário (4)
    { title: 'Meia-guarda - Underhook e Dog Fight', belt_level: 'blue', duration: 720, seriesKey: 'inter_bjj', position: 1, url: 'https://storage.example.com/videos/inter-bjj-01.mp4' },
    { title: 'Guarda aberta - De La Riva e Berimbolo', belt_level: 'blue', duration: 1080, seriesKey: 'inter_bjj', position: 2, url: 'https://storage.example.com/videos/inter-bjj-02.mp4' },
    { title: 'Armlock da guarda - Detalhes avancados', belt_level: 'blue', duration: 840, seriesKey: 'inter_bjj', position: 3, url: 'https://storage.example.com/videos/inter-bjj-03.mp4' },
    { title: 'Estrangulamentos de costas - Bow and Arrow e RNC', belt_level: 'blue', duration: 960, seriesKey: 'inter_bjj', position: 4, url: 'https://storage.example.com/videos/inter-bjj-04.mp4' },
    // Judô para Jiu-Jiteiro (3)
    { title: 'Osoto-gari e Ouchi-gari para competicao', belt_level: 'white', duration: 600, seriesKey: 'judo_jj', position: 1, url: 'https://storage.example.com/videos/judo-jj-01.mp4' },
    { title: 'Harai-goshi e Seoi-nage - Aplicacoes no BJJ', belt_level: 'white', duration: 720, seriesKey: 'judo_jj', position: 2, url: 'https://storage.example.com/videos/judo-jj-02.mp4' },
    { title: 'Quedas e pegadas para Jiu-Jiteiro', belt_level: 'white', duration: 540, seriesKey: 'judo_jj', position: 3, url: 'https://storage.example.com/videos/judo-jj-03.mp4' },
    // Standalone (3)
    { title: 'Preparacao fisica para lutadores', belt_level: 'white', duration: 900, url: 'https://storage.example.com/videos/prep-fisica-01.mp4' },
    { title: 'Aquecimento funcional pre-treino', belt_level: 'white', duration: 480, url: 'https://storage.example.com/videos/aquecimento-01.mp4' },
    { title: 'Estrategia de competicao - Pontos e vantagens', belt_level: 'blue', duration: 1080, url: 'https://storage.example.com/videos/estrategia-comp-01.mp4' },
  ];

  for (const vd of videoDefs) {
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        academy_id: academyId,
        title: vd.title,
        description: `Video: ${vd.title}`,
        url: vd.url,
        belt_level: vd.belt_level,
        duration: vd.duration,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Erro video ${vd.title}: ${error.message}`);
      continue;
    }
    videoIds.push(video.id);

    // Link to series
    if (vd.seriesKey && seriesIds[vd.seriesKey]) {
      await supabase.from('series_videos').insert({
        series_id: seriesIds[vd.seriesKey],
        video_id: video.id,
        position: vd.position || 0,
      });
      totalRecords++;
    }
  }
  totalRecords += videoIds.length;

  // Video progress
  interface ProgressSpec {
    studentNum: number;
    count: number; // how many videos completed
  }

  const progressSpecs: ProgressSpec[] = [
    { studentNum: 6, count: 12 },  // João: 12/15
    { studentNum: 8, count: 15 },  // Rafael: 15/15
    { studentNum: 10, count: 5 },  // Luciana: 5/15 (fundamentos only)
    { studentNum: 7, count: 2 },   // Marcos: 2/15
  ];

  let vpCount = 0;
  for (const ps of progressSpecs) {
    const sid = studentIds[ps.studentNum];
    if (!sid) continue;

    const vidsToWatch = ps.studentNum === 10
      ? videoIds.slice(0, 5) // Luciana: first 5 (fundamentos)
      : videoIds.slice(0, ps.count);

    for (let i = 0; i < vidsToWatch.length; i++) {
      const watchedDaysAgo = randomBetween(1, 60);
      const d = new Date();
      d.setDate(d.getDate() - watchedDaysAgo);

      await supabase.from('video_progress').insert({
        student_id: sid,
        video_id: vidsToWatch[i],
        progress: 100,
        last_watched_at: d.toISOString(),
      });
      vpCount++;
    }
  }

  totalRecords += vpCount;
  console.log(`  ${videoIds.length} videos, ${Object.keys(seriesIds).length} series, ${vpCount} progresso criados.`);
}

// ── Step 13: XP + Challenges + Progress ────────────────────────────────────

async function createXpAndChallenges() {
  console.log('Criando XP, desafios e progresso...');

  // Student XP
  interface XpSpec {
    studentNum: number;
    xp: number;
    level: number;
    title?: string;
  }

  const xpSpecs: XpSpec[] = [
    { studentNum: 8, xp: 4850, level: 15, title: 'Centuriao' },
    { studentNum: 6, xp: 3200, level: 11, title: 'Dedicado' },
    { studentNum: 12, xp: 2980, level: 10, title: 'Guerreira' },
    { studentNum: 19, xp: 3100, level: 10, title: 'Top Teen' },
    { studentNum: 10, xp: 1560, level: 6, title: 'Em Ascensao' },
    { studentNum: 16, xp: 1400, level: 5 },
    { studentNum: 9, xp: 1300, level: 5 },
    { studentNum: 17, xp: 1200, level: 4 },
    { studentNum: 18, xp: 2450, level: 8 },
    { studentNum: 13, xp: 800, level: 3 },
    { studentNum: 15, xp: 2600, level: 9 },
    { studentNum: 7, xp: 180, level: 1 },
    { studentNum: 11, xp: 140, level: 1 },
    { studentNum: 14, xp: 60, level: 1 },
    { studentNum: 20, xp: 650, level: 3 },
    { studentNum: 21, xp: 720, level: 3 },
    { studentNum: 22, xp: 350, level: 2 },
    { studentNum: 23, xp: 500, level: 2 },
    { studentNum: 24, xp: 620, level: 3 },
    { studentNum: 25, xp: 380, level: 2 },
    { studentNum: 26, xp: 250, level: 2 },
  ];

  const xpRows = xpSpecs
    .filter((x) => studentIds[x.studentNum])
    .map((x) => ({
      student_id: studentIds[x.studentNum],
      xp: x.xp,
      level: x.level,
      title: x.title || null,
    }));

  const { error: xpErr } = await supabase.from('student_xp').insert(xpRows);
  if (xpErr) console.error('  Erro student_xp:', xpErr.message);
  totalRecords += xpRows.length;

  // Challenges
  const challengeDefs = [
    {
      key: 'guerreiro_marco',
      title: 'Guerreiro de Marco',
      description: '12 presencas no mes de marco',
      xp_reward: 200,
      target: 12,
      metric: 'presencas',
      start_date: '2026-03-01',
      end_date: '2026-03-31',
      active: true,
    },
    {
      key: 'traga_amigo',
      title: 'Traga um Amigo',
      description: 'Indique 1 amigo para a academia',
      xp_reward: 100,
      target: 1,
      metric: 'presencas', // using presencas as closest metric
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      active: true,
    },
  ];

  for (const cd of challengeDefs) {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        academy_id: academyId,
        title: cd.title,
        description: cd.description,
        xp_reward: cd.xp_reward,
        target: cd.target,
        metric: cd.metric,
        start_date: cd.start_date,
        end_date: cd.end_date,
        active: cd.active,
      })
      .select('id')
      .single();
    if (error) console.error(`  Erro challenge ${cd.key}: ${error.message}`);
    else challengeIds[cd.key] = data.id;
  }
  totalRecords += challengeDefs.length;

  // Challenge progress for "Guerreiro de Marco"
  const guerreiroChallengeId = challengeIds['guerreiro_marco'];
  if (guerreiroChallengeId) {
    const progressData: { studentNum: number; current: number; completed: boolean }[] = [
      { studentNum: 8, current: 12, completed: true },
      { studentNum: 6, current: 10, completed: false },
      { studentNum: 12, current: 9, completed: false },
      { studentNum: 17, current: 8, completed: false },
      { studentNum: 10, current: 6, completed: false },
      { studentNum: 16, current: 7, completed: false },
      { studentNum: 9, current: 6, completed: false },
      { studentNum: 13, current: 5, completed: false },
      { studentNum: 19, current: 8, completed: false },
      { studentNum: 18, current: 6, completed: false },
      { studentNum: 7, current: 2, completed: false },
      { studentNum: 15, current: 0, completed: false },
    ];

    const cpRows = progressData
      .filter((p) => studentIds[p.studentNum])
      .map((p) => ({
        challenge_id: guerreiroChallengeId,
        student_id: studentIds[p.studentNum],
        current: p.current,
        completed: p.completed,
        completed_at: p.completed ? new Date().toISOString() : null,
      }));

    const { error } = await supabase.from('challenge_progress').insert(cpRows);
    if (error) console.error('  Erro challenge_progress:', error.message);
    totalRecords += cpRows.length;
  }

  console.log(`  ${xpRows.length} XP, ${challengeDefs.length} desafios criados.`);
}

// ── Step 14: Leads ─────────────────────────────────────────────────────────

async function createLeads() {
  console.log('Criando leads...');

  const leadDefs = [
    {
      name: 'Marina Silva',
      email: 'marina.lead@email.com',
      phone: '(31) 98888-1111',
      origin: 'instagram' as const,
      status: 'contatado' as const,
      modality: 'BJJ',
      notes: 'Interesse em Jiu-Jitsu. Contactada via DM.',
      created_at: daysAgo(2).toISOString(),
    },
    {
      name: 'Carlos Eduardo',
      email: 'carloseduardo.lead@email.com',
      phone: '(31) 98888-2222',
      origin: 'indicacao' as const,
      status: 'experimental_marcada' as const,
      modality: 'MMA',
      notes: 'Indicacao do Joao. Experimental marcada para quinta.',
      referred_by: studentIds[6] || undefined,
      created_at: daysAgo(4).toISOString(),
      experimental_date: addDays(new Date(), 2).toISOString(),
    },
    {
      name: 'Fernanda Rodrigues',
      email: 'fernanda.lead@email.com',
      phone: '(31) 98888-3333',
      origin: 'google' as const,
      status: 'contatado' as const,
      modality: 'Judo',
      notes: 'Encontrou pelo Google. Quer saber horarios.',
      created_at: daysAgo(7).toISOString(),
    },
    {
      name: 'Ricardo Alves',
      email: 'ricardo.lead@email.com',
      phone: '(31) 98888-4444',
      origin: 'passou_na_frente' as const,
      status: 'lead' as const,
      modality: 'Muay Thai',
      notes: 'Passou na frente da academia. Pediu informacoes.',
      created_at: daysAgo(1).toISOString(),
    },
    {
      name: 'Amanda Torres',
      email: 'amanda.lead@email.com',
      phone: '(31) 98888-5555',
      origin: 'outro' as const,
      status: 'ex_aluno' as const,
      modality: 'BJJ',
      notes: 'Ex-aluna, saiu ha 3 meses. Possivel reativacao.',
      created_at: daysAgo(90).toISOString(),
    },
    {
      name: 'Julio Cesar',
      email: 'julio.lead@email.com',
      phone: '(31) 98888-6666',
      origin: 'indicacao' as const,
      status: 'experimental_marcada' as const,
      modality: 'BJJ',
      notes: 'Indicacao do Diego. Experimental marcada.',
      referred_by: studentIds[13] || undefined,
      created_at: daysAgo(3).toISOString(),
      experimental_date: addDays(new Date(), 1).toISOString(),
    },
    {
      name: 'Beatriz Lima',
      email: 'beatriz.lead@email.com',
      phone: '(31) 98888-7777',
      origin: 'facebook' as const,
      status: 'experimental_marcada' as const,
      modality: 'Kids',
      notes: 'Interessada em aulas para filha de 8 anos.',
      created_at: daysAgo(5).toISOString(),
      experimental_date: addDays(new Date(), 3).toISOString(),
    },
    {
      name: 'Paulo Mendes',
      email: 'paulo.lead@email.com',
      phone: '(31) 98888-8888',
      origin: 'linkedin' as const,
      status: 'descartado' as const,
      modality: 'BJJ',
      notes: 'Nao respondeu apos 3 tentativas.',
      created_at: daysAgo(30).toISOString(),
    },
  ];

  const rows = leadDefs.map((l) => ({
    academy_id: academyId,
    ...l,
  }));

  const { error } = await supabase.from('leads').insert(rows);
  if (error) console.error('  Erro leads:', error.message);
  totalRecords += rows.length;
  console.log(`  ${rows.length} leads criados.`);
}

// ── Step 15: Events ────────────────────────────────────────────────────────

async function createEvents() {
  console.log('Criando eventos...');

  const eventDefs = [
    {
      key: 'seminario',
      title: 'Seminario Prof. Convidado',
      description: 'Seminario especial com professor convidado faixa preta 3o grau.',
      type: 'seminario',
      date: '2026-04-20T09:00:00-03:00',
      end_date: '2026-04-20T12:00:00-03:00',
      location: 'Sede Principal - Rua dos Atletas, 250',
      max_slots: 40,
      price: 80.0,
    },
    {
      key: 'campeonato',
      title: 'Campeonato Interno BJJ',
      description: 'Campeonato interno de Jiu-Jitsu Brasileiro. Todas as faixas.',
      type: 'campeonato',
      date: '2026-05-15T08:00:00-03:00',
      end_date: '2026-05-15T18:00:00-03:00',
      location: 'Sede Principal - Rua dos Atletas, 250',
      max_slots: 60,
      price: 50.0,
    },
    {
      key: 'graduacao',
      title: 'Graduacao Trimestral',
      description: 'Cerimonia de graduacao e entrega de faixas. Todos convidados!',
      type: 'graduacao',
      date: '2026-04-30T19:00:00-03:00',
      end_date: '2026-04-30T21:00:00-03:00',
      location: 'Sede Principal - Rua dos Atletas, 250',
      max_slots: null,
      price: 0,
    },
  ];

  for (const ed of eventDefs) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        academy_id: academyId,
        title: ed.title,
        description: ed.description,
        type: ed.type,
        date: ed.date,
        end_date: ed.end_date,
        location: ed.location,
        max_slots: ed.max_slots,
        price: ed.price,
      })
      .select('id')
      .single();
    if (error) console.error(`  Erro event ${ed.key}: ${error.message}`);
    else eventIds[ed.key] = data.id;
  }
  totalRecords += eventDefs.length;

  // Event registrations
  // Seminário: 22 registered
  const seminarioStudents = [6, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 7, 11, 22, 23, 24, 25, 26, 14, 26];
  if (eventIds['seminario']) {
    const regRows = seminarioStudents
      .slice(0, 22)
      .filter((sn) => studentIds[sn])
      .map((sn) => ({
        event_id: eventIds['seminario'],
        student_id: studentIds[sn],
        status: 'inscrito',
      }));

    // Deduplicate
    const seen = new Set<string>();
    const uniqueRows = regRows.filter((r) => {
      const key = `${r.event_id}|${r.student_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const { error } = await supabase.from('event_registrations').insert(uniqueRows);
    if (error) console.error('  Erro event_registrations seminario:', error.message);
    totalRecords += uniqueRows.length;
  }

  // Campeonato: 8 registered
  const campeonatoStudents = [6, 8, 12, 19, 9, 16, 17, 15];
  if (eventIds['campeonato']) {
    const regRows = campeonatoStudents
      .filter((sn) => studentIds[sn])
      .map((sn) => ({
        event_id: eventIds['campeonato'],
        student_id: studentIds[sn],
        status: 'inscrito',
      }));

    const { error } = await supabase.from('event_registrations').insert(regRows);
    if (error) console.error('  Erro event_registrations campeonato:', error.message);
    totalRecords += regRows.length;
  }

  console.log(`  ${eventDefs.length} eventos e registros criados.`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=================================================');
  console.log(' BlackBelt v2 - Seed Completo');
  console.log(' Academia: Guerreiros do Tatame');
  console.log('=================================================\n');

  const start = Date.now();

  try {
    await cleanup();
    await createSuperAdmin();
    await createAcademy();
    await createUsers();
    await createGuardians();
    await createClasses();
    await createEnrollments();
    await generateAttendance();
    await generateEvaluations();
    await createProgressions();
    await createAchievements();
    await createFinancial();
    await createMessages();
    await createNotifications();
    await createVideos();
    await createXpAndChallenges();
    await createLeads();
    await createEvents();
  } catch (err: any) {
    console.error('\n\nERRO FATAL:', err.message);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n=================================================');
  console.log(` Seed completo: ${totalRecords}+ registros criados`);
  console.log(` Tempo: ${elapsed}s`);
  console.log('=================================================');
  console.log('\nCredenciais de acesso:');
  console.log('  Super Admin: super@blackbelt.app / @Greg1994');
  console.log('  Admin: roberto@guerreiros.com / BlackBelt@2026');
  console.log('  Admin: camila@guerreiros.com / BlackBelt@2026');
  console.log('  Prof:  andre@guerreiros.com / fernanda@guerreiros.com / thiago@guerreiros.com');
  console.log('  Recep: julia@guerreiros.com / BlackBelt@2026');
  console.log('  Aluno: joao@email.com, rafael@email.com, marcos@email.com ...');
  console.log('  Teen:  lucas.teen@email.com, sophia@email.com ...');
  console.log('  Kids:  miguel.kids@email.com, helena.kids@email.com ...');
  console.log('  Resp:  maria.resp@email.com, patricia@email.com ...');
  console.log('  Franq: fernando@guerreiros.com / BlackBelt@2026');
}

main();
