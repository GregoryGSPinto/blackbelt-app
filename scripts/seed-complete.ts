/**
 * Seed completo — BlackBelt v2 — Academia "Guerreiros do Tatame"
 *
 * Usa dados EXISTENTES no banco (profiles, memberships, classes).
 * Cria: 100+ check-ins (60 dias), guardian_links (responsavel→kids/teen).
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/seed-complete.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Known academy
const ACADEMY_ID = '809f2763-0096-4cfa-8057-b5b029cbc62f';

// Belt names and class names for realistic check-in data
const BELTS = ['branca', 'cinza', 'amarela', 'laranja', 'verde', 'azul', 'roxa', 'marrom', 'preta'];
const PERSON_TYPES: Array<'aluno' | 'professor' | 'visitante'> = ['aluno', 'professor', 'visitante'];

async function seed() {
  console.log('Seed BlackBelt v2 — Guerreiros do Tatame\n');

  // ════════════════════════════════════════════
  // 1. VALIDAR ACADEMIA EXISTENTE
  // ════════════════════════════════════════════

  console.log('1. Validando academia...');
  const { data: academy, error: academyErr } = await supabase
    .from('academies')
    .select('id, name, slug')
    .eq('id', ACADEMY_ID)
    .single();

  if (academyErr || !academy) {
    console.error(`  ERRO: Academia ${ACADEMY_ID} nao encontrada: ${academyErr?.message}`);
    process.exit(1);
  }
  console.log(`  OK: ${academy.name} (${academy.id})`);

  // ════════════════════════════════════════════
  // 2. BUSCAR MEMBERSHIPS E PROFILES EXISTENTES
  // ════════════════════════════════════════════

  console.log('\n2. Buscando memberships existentes...');
  const { data: memberships, error: membErr } = await supabase
    .from('memberships')
    .select('id, profile_id, role, status')
    .eq('academy_id', ACADEMY_ID);

  if (membErr || !memberships || memberships.length === 0) {
    console.error(`  ERRO: Nenhuma membership encontrada: ${membErr?.message}`);
    process.exit(1);
  }
  console.log(`  OK: ${memberships.length} memberships encontradas`);

  // Separate by role
  const studentMemberships = memberships.filter(
    (m) => ['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(m.role)
  );
  const responsavelMemberships = memberships.filter((m) => m.role === 'responsavel');
  const professorMemberships = memberships.filter((m) => m.role === 'professor');
  const teenMemberships = memberships.filter((m) => m.role === 'aluno_teen');
  const kidsMemberships = memberships.filter((m) => m.role === 'aluno_kids');

  console.log(`  - Alunos: ${studentMemberships.length}`);
  console.log(`  - Responsaveis: ${responsavelMemberships.length}`);
  console.log(`  - Professores: ${professorMemberships.length}`);
  console.log(`  - Teens: ${teenMemberships.length}`);
  console.log(`  - Kids: ${kidsMemberships.length}`);

  // Fetch profile display_names for realistic check-in data
  const profileIds = memberships.map((m) => m.profile_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .in('id', profileIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  // ════════════════════════════════════════════
  // 3. BUSCAR TURMAS EXISTENTES
  // ════════════════════════════════════════════

  console.log('\n3. Buscando turmas existentes...');
  const { data: classes, error: classErr } = await supabase
    .from('classes')
    .select('id, name')
    .eq('academy_id', ACADEMY_ID);

  if (classErr) {
    console.log(`  AVISO: Erro buscando turmas: ${classErr.message}`);
  }
  const classNames = (classes || []).map((c) => c.name).filter(Boolean);
  console.log(`  OK: ${classes?.length || 0} turmas encontradas`);
  if (classNames.length > 0) {
    console.log(`  Nomes: ${classNames.join(', ')}`);
  }

  // ════════════════════════════════════════════
  // 4. CRIAR CHECK-INS (100+ nos ultimos 60 dias)
  // ════════════════════════════════════════════

  console.log('\n4. Criando check-ins dos ultimos 60 dias...');

  // Combine students + professors for check-ins
  const checkinCandidates = [
    ...studentMemberships.map((m) => ({ ...m, personType: 'aluno' as const })),
    ...professorMemberships.map((m) => ({ ...m, personType: 'professor' as const })),
  ];

  if (checkinCandidates.length === 0) {
    console.log('  AVISO: Nenhum candidato para check-ins');
  } else {
    const checkins: Array<{
      academy_id: string;
      profile_id: string;
      profile_name: string;
      class_name: string | null;
      belt: string | null;
      check_in_at: string;
      check_out_at: string | null;
      checkin_type: string;
      person_type: string;
    }> = [];

    const now = new Date();

    for (let d = 60; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dayOfWeek = date.getDay();

      // Skip Sundays
      if (dayOfWeek === 0) continue;

      for (const candidate of checkinCandidates) {
        // 65% attendance for students, 90% for professors
        const attendanceRate = candidate.personType === 'professor' ? 0.9 : 0.65;
        if (Math.random() > attendanceRate) continue;

        // Sometimes two sessions per day (20% chance)
        const sessions = Math.random() < 0.2 ? 2 : 1;

        for (let s = 0; s < sessions; s++) {
          // Morning (7-10) or evening (17-21) session
          const isMorning = s === 0 ? Math.random() < 0.4 : false;
          const hour = isMorning
            ? 7 + Math.floor(Math.random() * 3)
            : 17 + Math.floor(Math.random() * 4);
          const minute = Math.floor(Math.random() * 60);

          const checkInAt = new Date(date);
          checkInAt.setHours(hour, minute, 0, 0);

          // Check-out 60-120 minutes later
          const checkOutAt = new Date(checkInAt);
          checkOutAt.setMinutes(checkOutAt.getMinutes() + 60 + Math.floor(Math.random() * 60));

          const profile = profileMap.get(candidate.profile_id);
          const profileName = profile?.display_name || 'Aluno';

          // Pick a random class name if available
          const className = classNames.length > 0
            ? classNames[Math.floor(Math.random() * classNames.length)]
            : null;

          // Random belt
          const belt = candidate.personType === 'professor'
            ? 'preta'
            : BELTS[Math.floor(Math.random() * BELTS.length)];

          checkins.push({
            academy_id: ACADEMY_ID,
            profile_id: candidate.profile_id,
            profile_name: profileName,
            class_name: className,
            belt,
            check_in_at: checkInAt.toISOString(),
            check_out_at: checkOutAt.toISOString(),
            checkin_type: 'self',
            person_type: candidate.personType,
          });
        }
      }
    }

    console.log(`  Gerando ${checkins.length} check-ins...`);

    // Insert in batches of 50
    let insertedCheckins = 0;
    let checkinErrors = 0;
    for (let i = 0; i < checkins.length; i += 50) {
      const batch = checkins.slice(i, i + 50);
      const { error } = await supabase.from('checkins').insert(batch);
      if (error) {
        console.log(`  ERRO batch ${Math.floor(i / 50) + 1}: ${error.message}`);
        checkinErrors++;
      } else {
        insertedCheckins += batch.length;
      }
    }
    console.log(`  OK: ${insertedCheckins} check-ins inseridos (${checkinErrors} batches com erro)`);
  }

  // ════════════════════════════════════════════
  // 5. CRIAR GUARDIAN LINKS
  // ════════════════════════════════════════════

  console.log('\n5. Criando guardian_links...');

  if (responsavelMemberships.length === 0) {
    console.log('  AVISO: Nenhum responsavel encontrado');
  } else if (teenMemberships.length === 0 && kidsMemberships.length === 0) {
    console.log('  AVISO: Nenhum teen/kids encontrado');
  } else {
    let linksCreated = 0;

    // Link each responsavel to each teen and kids
    for (const guardian of responsavelMemberships) {
      for (const teen of teenMemberships) {
        const { error } = await supabase.from('guardian_links').upsert(
          {
            guardian_id: guardian.profile_id,
            child_id: teen.profile_id,
            relationship: 'parent',
            can_precheckin: true,
            can_view_grades: true,
            can_manage_payments: true,
          },
          { onConflict: 'guardian_id,child_id' }
        );
        if (error) {
          console.log(`  ERRO guardian ${guardian.profile_id} -> teen ${teen.profile_id}: ${error.message}`);
        } else {
          const guardianName = profileMap.get(guardian.profile_id)?.display_name || 'Responsavel';
          const childName = profileMap.get(teen.profile_id)?.display_name || 'Teen';
          console.log(`  OK: ${guardianName} -> ${childName} (teen)`);
          linksCreated++;
        }
      }

      for (const kid of kidsMemberships) {
        const { error } = await supabase.from('guardian_links').upsert(
          {
            guardian_id: guardian.profile_id,
            child_id: kid.profile_id,
            relationship: 'parent',
            can_precheckin: true,
            can_view_grades: true,
            can_manage_payments: true,
          },
          { onConflict: 'guardian_id,child_id' }
        );
        if (error) {
          console.log(`  ERRO guardian ${guardian.profile_id} -> kid ${kid.profile_id}: ${error.message}`);
        } else {
          const guardianName = profileMap.get(guardian.profile_id)?.display_name || 'Responsavel';
          const childName = profileMap.get(kid.profile_id)?.display_name || 'Kids';
          console.log(`  OK: ${guardianName} -> ${childName} (kids)`);
          linksCreated++;
        }
      }
    }

    console.log(`  Total links criados/atualizados: ${linksCreated}`);
  }

  // ════════════════════════════════════════════
  // 6. VERIFICACAO FINAL
  // ════════════════════════════════════════════

  console.log('\n════════════════════════════════');
  console.log('VERIFICACAO FINAL');
  console.log('════════════════════════════════\n');

  const tables = [
    'profiles',
    'academies',
    'memberships',
    'classes',
    'platform_plans',
    'checkins',
    'invoices',
    'guardian_links',
  ];

  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${t}: ERRO - ${error.message}`);
    } else {
      console.log(`  ${t}: ${count} registros`);
    }
  }

  // Test login
  console.log('\nTestando login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@guerreiros.com',
    password: 'BlackBelt@2026',
  });
  if (loginError) {
    console.log(`  Login admin: ERRO - ${loginError.message}`);
  } else {
    console.log(`  Login admin OK: ${loginData.user?.id.substring(0, 8)}...`);
  }

  console.log('\nSeed completo!');
  console.log('Login: admin@guerreiros.com / BlackBelt@2026');
}

seed().catch(console.error);
