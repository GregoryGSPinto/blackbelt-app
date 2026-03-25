import { isMock } from '@/lib/env';

export interface OnboardingAcademyData {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
}

export interface OnboardingAdminData {
  name: string;
  email: string;
  password: string;
}

export interface OnboardingResult {
  academyId: string;
  slug: string;
  adminProfileId: string;
}

export interface SetupWizardStep {
  step: number;
  completed: boolean;
}

export async function createAcademy(
  academy: OnboardingAcademyData,
  admin: OnboardingAdminData,
  _platformPlan: string,
): Promise<OnboardingResult> {
  if (isMock()) {
    const { mockCreateAcademy } = await import('@/lib/mocks/onboarding.mock');
    return mockCreateAcademy(academy, admin, _platformPlan);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // 1. Sign up the admin user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: admin.email,
    password: admin.password,
    options: { data: { name: admin.name } },
  });
  if (authError || !authData.user) {
    throw new Error(`[createAcademy] Auth error: ${authError?.message ?? 'User not created'}`);
  }

  // 2. The trigger auto-creates a profile; fetch it
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authData.user.id)
    .limit(1);
  if (profileError) {
    throw new Error(`[createAcademy] Error fetching profile: ${profileError.message}`);
  }
  const profileId = profiles?.[0]?.id ?? authData.user.id;

  // 3. Create the academy
  const slug = academy.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: academyData, error: academyError } = await supabase
    .from('academies')
    .insert({
      name: academy.name,
      slug,
      owner_id: authData.user.id,
    })
    .select()
    .single();
  if (academyError || !academyData) {
    throw new Error(`[createAcademy] Error creating academy: ${academyError?.message ?? 'No data returned'}`);
  }

  // 4. Create unit
  const { error: unitError } = await supabase
    .from('units')
    .insert({
      academy_id: academyData.id,
      name: 'Sede',
      address: academy.address,
    });
  if (unitError) {
    throw new Error(`[createAcademy] Error creating unit: ${unitError.message}`);
  }

  // 5. Create admin membership
  const { error: memberError } = await supabase
    .from('memberships')
    .insert({
      profile_id: profileId,
      academy_id: academyData.id,
      role: 'admin',
      status: 'active',
    });
  if (memberError) {
    throw new Error(`[createAcademy] Error creating membership: ${memberError.message}`);
  }

  // Set academy ID cookie
  if (typeof document !== 'undefined') {
    document.cookie = `bb-academy-id=${academyData.id};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  }

  // Set active role cookie
  if (typeof document !== 'undefined') {
    document.cookie = `bb-active-role=admin;path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  }

  return {
    academyId: academyData.id,
    slug: academyData.slug,
    adminProfileId: profileId,
  };
}

export async function getSetupProgress(_academyId: string): Promise<SetupWizardStep[]> {
  if (isMock()) {
    const { mockGetSetupProgress } = await import('@/lib/mocks/onboarding.mock');
    return mockGetSetupProgress(_academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Check which entities exist for this academy
  const [modalities, units, classes, students] = await Promise.all([
    supabase.from('modalities').select('id', { count: 'exact', head: true }).eq('academy_id', _academyId),
    supabase.from('units').select('id', { count: 'exact', head: true }).eq('academy_id', _academyId),
    supabase.from('classes').select('id, units!inner(academy_id)', { count: 'exact', head: true }).eq('units.academy_id', _academyId),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', _academyId),
  ]);

  return [
    { step: 1, completed: true }, // Academy created
    { step: 2, completed: (units.count ?? 0) > 0 }, // Unit created
    { step: 3, completed: (modalities.count ?? 0) > 0 }, // Modality created
    { step: 4, completed: (classes.count ?? 0) > 0 }, // Class created
    { step: 5, completed: (students.count ?? 0) > 0 }, // Student enrolled
  ];
}

export async function completeSetupStep(_academyId: string, _step: number): Promise<void> {
  if (isMock()) {
    const { mockCompleteStep } = await import('@/lib/mocks/onboarding.mock');
    return mockCompleteStep(_academyId, _step);
  }
  // In real mode, setup progress is derived from actual data, no explicit marking needed
}
