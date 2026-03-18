import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ────────────────────────────────────────────────────
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
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Resolve academy dynamically ────────────────────────────────────────
let ACADEMY_ID = '';

async function resolveAcademy() {
  const { data } = await supabase
    .from('academies')
    .select('id')
    .eq('slug', 'guerreiros-tatame')
    .maybeSingle();
  if (data) {
    ACADEMY_ID = data.id;
    console.log(`  Academy resolved: ${ACADEMY_ID}`);
  } else {
    console.warn('  ⚠️ Academy guerreiros-tatame not found — run seed-full-academy.ts first');
  }
}

// ── Helpers ────────────────────────────────────────────────────────────
async function createUserIfNotExists(
  email: string,
  password: string,
  displayName: string,
  role: string,
  academyId: string | null,
) {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`  User ${email} already exists (${userId})`);
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error(`  ❌ Error creating ${email}:`, error.message);
      return null;
    }
    userId = newUser.user.id;
    console.log(`  ✅ Created user ${email} (${userId})`);
  }

  // Set app_metadata
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      role,
      academy_id: academyId,
    },
  });
  console.log(`  📋 Set app_metadata: role=${role}, academy_id=${academyId}`);

  return userId;
}

async function ensureProfile(
  userId: string,
  role: string,
  displayName: string,
) {
  // Check if profile exists for this user+role
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();

  if (existing) {
    console.log(`  Profile ${role} already exists for user ${userId}`);
    return existing.id;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      role,
      display_name: displayName,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`  ❌ Error creating profile:`, error.message);
    return null;
  }
  console.log(`  ✅ Created profile ${role} (${profile.id})`);
  return profile.id;
}

async function ensureMembership(
  profileId: string,
  academyId: string,
  role: string,
) {
  const { data: existing } = await supabase
    .from('memberships')
    .select('id')
    .eq('profile_id', profileId)
    .eq('academy_id', academyId)
    .eq('role', role)
    .maybeSingle();

  if (existing) {
    console.log(`  Membership ${role} already exists`);
    return;
  }

  const { error } = await supabase.from('memberships').insert({
    profile_id: profileId,
    academy_id: academyId,
    role,
    status: 'active',
  });

  if (error) {
    console.error(`  ❌ Error creating membership:`, error.message);
  } else {
    console.log(`  ✅ Created membership ${role}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log('═══ BLACKBELT GO LIVE SEED ═══\n');

  await resolveAcademy();
  if (!ACADEMY_ID) {
    console.error('Cannot proceed without academy. Run seed-full-academy.ts first.');
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────
  // A. SUPER ADMIN — Gregory
  // ─────────────────────────────────────────────────────────────────
  console.log('🔑 Creating Super Admin...');
  const gregoryUserId = await createUserIfNotExists(
    'gregoryguimaraes12@gmail.com',
    '@Greg1994',
    'Gregory Guimarães',
    'superadmin',
    null, // superadmin is global
  );

  if (gregoryUserId) {
    const profileId = await ensureProfile(gregoryUserId, 'superadmin', 'Gregory Guimarães');
    if (profileId) {
      // Superadmin gets membership to ALL academies
      await ensureMembership(profileId, ACADEMY_ID, 'superadmin');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // B. RECEPCAO — Julia Santos
  // ─────────────────────────────────────────────────────────────────
  console.log('\n📋 Creating Receptionist...');
  const juliaUserId = await createUserIfNotExists(
    'julia@guerreiros.com',
    'BlackBelt@2026',
    'Julia Santos',
    'recepcao',
    ACADEMY_ID,
  );

  if (juliaUserId) {
    const profileId = await ensureProfile(juliaUserId, 'recepcao', 'Julia Santos');
    if (profileId) {
      await ensureMembership(profileId, ACADEMY_ID, 'recepcao');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // C. Set app_metadata on ALL existing users
  // ─────────────────────────────────────────────────────────────────
  console.log('\n🔄 Setting app_metadata on all existing users...');

  // Get all profiles with their user_ids
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, user_id, role, display_name');

  // Get all memberships
  const { data: allMemberships } = await supabase
    .from('memberships')
    .select('profile_id, academy_id, role');

  if (allProfiles) {
    for (const profile of allProfiles) {
      // Find this profile's membership to get academy_id
      const membership = allMemberships?.find(
        m => m.profile_id === profile.id
      );
      const academyId = membership?.academy_id ?? null;

      const { error } = await supabase.auth.admin.updateUserById(profile.user_id, {
        app_metadata: {
          role: profile.role,
          academy_id: academyId,
        },
      });

      if (error) {
        console.log(`  ❌ Failed to update ${profile.display_name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${profile.display_name} → role=${profile.role}, academy=${academyId ? academyId.slice(0, 8) + '...' : 'null'}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // D. Summary
  // ─────────────────────────────────────────────────────────────────
  console.log('\n═══ SEED COMPLETE ═══');

  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: membershipCount } = await supabase.from('memberships').select('*', { count: 'exact', head: true });
  const { count: attendanceCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true });
  const { count: invoiceCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });

  console.log(`Users: ${finalUsers?.users?.length}`);
  console.log(`Profiles: ${profileCount}`);
  console.log(`Memberships: ${membershipCount}`);
  console.log(`Attendance: ${attendanceCount}`);
  console.log(`Invoices: ${invoiceCount}`);

  console.log('\n📧 Login credentials:');
  console.log('  SuperAdmin: gregoryguimaraes12@gmail.com / @Greg1994');
  console.log('  Admin: roberto@guerreiros.com / BlackBelt@2026');
  console.log('  Professor: andre@guerreiros.com / BlackBelt@2026');
  console.log('  Recepcao: julia@guerreiros.com / BlackBelt@2026');
  console.log('  Aluno: joao@email.com / BlackBelt@2026');
  console.log('  Responsavel: patricia@email.com / BlackBelt@2026');
}

main().catch(console.error);
