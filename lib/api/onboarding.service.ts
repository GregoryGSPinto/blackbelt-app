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
  platformPlan: string,
): Promise<OnboardingResult> {
  if (isMock()) {
    const { mockCreateAcademy } = await import('@/lib/mocks/onboarding.mock');
    return mockCreateAcademy(academy, admin, platformPlan);
  }

  const response = await fetch('/api/register-academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      academy,
      admin,
      platformPlan,
    }),
  });
  const payload = (await response.json()) as {
    error?: string;
    academyId?: string;
    slug?: string;
    adminProfileId?: string;
  };

  if (!response.ok || !payload.academyId || !payload.slug || !payload.adminProfileId) {
    throw new Error(payload.error ?? 'Falha ao criar academia.');
  }

  // Set academy ID cookie
  if (typeof document !== 'undefined') {
    document.cookie = `bb-academy-id=${payload.academyId};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  }

  // Set active role cookie
  if (typeof document !== 'undefined') {
    document.cookie = `bb-active-role=admin;path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  }

  return {
    academyId: payload.academyId,
    slug: payload.slug,
    adminProfileId: payload.adminProfileId,
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
