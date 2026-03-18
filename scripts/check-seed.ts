import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Check auth users
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log('Auth users:', users?.users?.length);
  users?.users?.forEach(u => console.log(`  - ${u.email} | role: ${u.app_metadata?.role || 'none'} | academy: ${u.app_metadata?.academy_id || 'none'}`));

  // Check profiles
  const { data: profiles } = await supabase.from('profiles').select('id, display_name, user_id');
  console.log('\nProfiles:', profiles?.length);
  profiles?.forEach(p => console.log(`  - ${p.display_name} (${p.id})`));

  // Check memberships
  const { data: memberships } = await supabase.from('memberships').select('id, profile_id, academy_id, role, status');
  console.log('\nMemberships:', memberships?.length);
  memberships?.forEach(m => console.log(`  - ${m.role} | profile: ${m.profile_id} | academy: ${m.academy_id} | ${m.status}`));

  // Check academies
  const { data: acads } = await supabase.from('academies').select('id, name, slug, status');
  console.log('\nAcademies:', acads?.length);
  acads?.forEach(a => console.log(`  - ${a.name} (${a.slug}) | ${a.status}`));

  // Check plans
  const { data: plans } = await supabase.from('plans').select('id, name, slug');
  console.log('\nPlans:', plans?.length);
  plans?.forEach(p => console.log(`  - ${p.name} (${p.slug})`));

  // Check students
  const { data: students } = await supabase.from('students').select('id, profile_id, academy_id, belt, status');
  console.log('\nStudents:', students?.length);

  // Check classes
  const { data: classes } = await supabase.from('classes').select('id, name, academy_id');
  console.log('\nClasses:', classes?.length);
  classes?.forEach(c => console.log(`  - ${c.name}`));

  // Check attendance
  const { data: attendance, count } = await supabase.from('attendance').select('*', { count: 'exact', head: true });
  console.log('\nAttendance records:', count);

  // Check invoices
  const { data: inv, count: invCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
  console.log('Invoice records:', invCount);

  // Check modalities
  const { data: mods } = await supabase.from('modalities').select('id, name, academy_id');
  console.log('\nModalities:', mods?.length);
  mods?.forEach(m => console.log(`  - ${m.name}`));
}

main().catch(console.error);
