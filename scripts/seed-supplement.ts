/**
 * seed-supplement.ts
 *
 * Adds missing data: nps_responses, feed_posts, and extra attendance records.
 * Run with: npx tsx scripts/seed-supplement.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (process.env[key] === undefined) process.env[key] = val;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

interface ScheduleEntry {
  day: string;
  start: string;
  end: string;
}

function parseSchedule(schedule: unknown): { weekdays: string[]; startTime: string } {
  if (Array.isArray(schedule) && schedule.length > 0) {
    const entries = schedule as ScheduleEntry[];
    return {
      weekdays: entries.map(e => (e.day || '').toLowerCase()).filter(Boolean),
      startTime: entries[0]?.start || '18:00',
    };
  }
  return { weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], startTime: '18:00' };
}

async function supplement() {
  console.log('=== SEED SUPPLEMENT ===\n');

  // Get existing data
  const { data: students } = await supabase.from('students').select('id');
  const { data: academies } = await supabase.from('academies').select('id');
  const { data: profiles } = await supabase.from('profiles').select('id, role');
  const { data: classes } = await supabase.from('classes').select('id, schedule, name');
  const { data: enrollments } = await supabase.from('class_enrollments').select('id, student_id, class_id');

  if (students === null || academies === null || profiles === null || classes === null || enrollments === null) {
    console.error('Failed to fetch data');
    process.exit(1);
  }

  console.log(`Students: ${students.length}, Classes: ${classes.length}, Enrollments: ${enrollments.length}, Profiles: ${profiles.length}`);

  const academyId = academies[0].id;
  let totalAdded = 0;

  // ── 1. NPS Responses ─────────────────────────────────────────────────
  // Schema: academy_id, student_id, score (0-10), feedback (text), created_at
  console.log('\n1. NPS Responses...');
  const { count: existingNps } = await supabase.from('nps_responses').select('*', { count: 'exact', head: true });
  if (existingNps && existingNps > 0) {
    console.log(`   Already has ${existingNps} records, skipping`);
  } else {
    const feedbacks = [
      'Excelente academia, professores muito dedicados!',
      'Gosto muito das aulas, ambiente acolhedor.',
      'Poderia ter mais horarios disponiveis.',
      'Treinos muito bons, evolui bastante.',
      'Otima infraestrutura e organizacao.',
      'Os professores sao muito atenciosos.',
      'Recomendo para quem quer treinar artes marciais.',
      'Ambiente familiar, me sinto em casa.',
    ];
    const npsRows = students.slice(0, 20).map(student => ({
      academy_id: academyId,
      student_id: student.id,
      score: randomBetween(6, 10),
      feedback: Math.random() > 0.3 ? randomPick(feedbacks) : null,
      created_at: daysAgoISO(randomBetween(1, 90)),
    }));
    const { error } = await supabase.from('nps_responses').insert(npsRows);
    if (error) {
      console.log(`   ERROR: ${error.message}`);
    } else {
      console.log(`   ${npsRows.length} NPS responses added`);
      totalAdded += npsRows.length;
    }
  }

  // ── 2. Feed Posts ────────────────────────────────────────────────────
  // Schema: academy_id, author_id (profiles.id), type (manual|promocao|conquista|milestone|comunicado|sistema),
  //         content, image_url, likes_count, comments_count, pinned, created_at
  console.log('\n2. Feed Posts...');
  const { count: existingFeed } = await supabase.from('feed_posts').select('*', { count: 'exact', head: true });
  if (existingFeed && existingFeed > 0) {
    console.log(`   Already has ${existingFeed} posts, skipping`);
  } else {
    const validTypes = ['manual', 'promocao', 'conquista', 'milestone', 'comunicado', 'sistema'] as const;
    const postContents: Array<{ type: typeof validTypes[number]; content: string }> = [
      { type: 'manual', content: 'Treino pesado hoje! Quem mais veio?' },
      { type: 'conquista', content: 'Consegui minha faixa azul finalmente!' },
      { type: 'manual', content: 'Primeira semana de treino, amando!' },
      { type: 'comunicado', content: 'Seminario neste sabado, nao percam!' },
      { type: 'milestone', content: 'Streak de 30 dias! Sem parar!' },
      { type: 'manual', content: 'A turma kids esta incrivel, meu filho ama.' },
      { type: 'manual', content: 'Valeu professor Andre pela aula de hoje!' },
      { type: 'comunicado', content: 'Novo mes, novas metas. Bora treinar!' },
      { type: 'manual', content: 'Dica: treinem o basico. Sempre.' },
      { type: 'manual', content: 'Gratidao por essa academia e essa equipe.' },
      { type: 'comunicado', content: 'Open mat domingo as 10h. Todos convidados!' },
      { type: 'promocao', content: 'Parabens ao aluno Joao pela promocao de faixa!' },
      { type: 'conquista', content: 'Hoje foi dia de sparring! Nivel alto!' },
      { type: 'sistema', content: 'Bem-vindo ao feed da academia Guerreiros do Tatame!' },
      { type: 'milestone', content: '100 alunos ativos! Obrigado a todos!' },
    ];

    const feedPosts = postContents.map(post => ({
      academy_id: academyId,
      author_id: randomPick(profiles).id,
      type: post.type,
      content: post.content,
      likes_count: randomBetween(0, 15),
      comments_count: randomBetween(0, 5),
      pinned: false,
      created_at: daysAgoISO(randomBetween(0, 60)),
    }));

    const { error } = await supabase.from('feed_posts').insert(feedPosts);
    if (error) {
      console.log(`   ERROR: ${error.message}`);
    } else {
      console.log(`   ${feedPosts.length} feed posts added`);
      totalAdded += feedPosts.length;
    }
  }

  // ── 3. Extra Attendance ──────────────────────────────────────────────
  // Schema: student_id, class_id, checked_at, method (NO academy_id)
  console.log('\n3. Attendance supplement...');
  const { count: currentAttendance } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true });
  console.log(`   Current: ${currentAttendance}`);

  const target = 3500;
  const needed = Math.max(0, target - (currentAttendance ?? 0));

  if (needed > 0) {
    console.log(`   Need ${needed} more to reach ${target}...`);

    const attendanceBatch: Array<{
      student_id: string;
      class_id: string;
      checked_at: string;
      method: string;
    }> = [];

    const weekdayMap: Record<number, string> = {
      1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday',
    };

    // Portuguese to English mapping
    const ptToEn: Record<string, string> = {
      'segunda': 'monday', 'terca': 'tuesday', 'quarta': 'wednesday',
      'quinta': 'thursday', 'sexta': 'friday', 'sabado': 'saturday',
      'seg': 'monday', 'ter': 'tuesday', 'qua': 'wednesday',
      'qui': 'thursday', 'sex': 'friday', 'sab': 'saturday',
    };

    for (let dayOffset = 1; dayOffset < 500 && attendanceBatch.length < needed; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dow = date.getDay();

      if (dow === 0) continue; // skip Sundays

      const dayName = weekdayMap[dow];

      for (const cls of classes) {
        if (attendanceBatch.length >= needed) break;

        const { weekdays, startTime } = parseSchedule(cls.schedule);

        // Check if class runs this weekday
        if (weekdays.length > 0) {
          const hasDay = weekdays.some(w => {
            const wl = w.toLowerCase();
            return wl === dayName || ptToEn[wl] === dayName;
          });
          if (!hasDay) continue;
        }

        const classEnrollments = enrollments.filter(e => e.class_id === cls.id);

        for (const enrollment of classEnrollments) {
          if (attendanceBatch.length >= needed) break;
          if (Math.random() > 0.70) continue; // 70% attendance rate

          const timeParts = startTime.split(':').map(Number);
          const h = timeParts[0] || 18;
          const mn = timeParts[1] || 0;
          const checkedAt = new Date(date);
          checkedAt.setHours(h, mn + randomBetween(-5, 15), randomBetween(0, 59));

          attendanceBatch.push({
            student_id: enrollment.student_id,
            class_id: cls.id,
            checked_at: checkedAt.toISOString(),
            method: randomPick(['qr_code', 'manual']),
          });
        }
      }
    }

    console.log(`   Generated ${attendanceBatch.length} records, inserting...`);

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < attendanceBatch.length; i += 500) {
      const batch = attendanceBatch.slice(i, i + 500);
      const { error } = await supabase.from('attendance').upsert(batch, {
        onConflict: 'student_id,class_id,checked_at',
        ignoreDuplicates: true,
      });
      if (error) {
        // Fall back to individual inserts
        for (const record of batch) {
          const { error: singleErr } = await supabase.from('attendance').insert(record);
          if (singleErr) {
            skipped++;
          } else {
            inserted++;
          }
        }
      } else {
        inserted += batch.length;
      }
      process.stdout.write(`   Progress: ${inserted} inserted, ${skipped} skipped\r`);
    }
    console.log(`\n   Attendance: ${inserted} records added`);
    totalAdded += inserted;
  } else {
    console.log(`   Already at ${currentAttendance}, skip`);
  }

  // Final verification
  const { count: finalAtt } = await supabase.from('attendance').select('*', { count: 'exact', head: true });
  const { count: finalNps } = await supabase.from('nps_responses').select('*', { count: 'exact', head: true });
  const { count: finalFeed } = await supabase.from('feed_posts').select('*', { count: 'exact', head: true });

  console.log(`\n=== FINAL COUNTS ===`);
  console.log(`attendance: ${finalAtt}`);
  console.log(`nps_responses: ${finalNps}`);
  console.log(`feed_posts: ${finalFeed}`);
  console.log(`\n=== Supplement complete: ${totalAdded} records added ===`);
}

supplement().catch(console.error);
