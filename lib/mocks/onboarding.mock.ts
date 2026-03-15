import type { OnboardingAcademyData, OnboardingAdminData, OnboardingResult, SetupWizardStep } from '@/lib/api/onboarding.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function mockCreateAcademy(
  academy: OnboardingAcademyData,
  _admin: OnboardingAdminData,
  _platformPlan: string,
): Promise<OnboardingResult> {
  await delay();
  return {
    academyId: `academy-${Date.now()}`,
    slug: toSlug(academy.name),
    adminProfileId: `profile-${Date.now()}`,
  };
}

export async function mockGetSetupProgress(_academyId: string): Promise<SetupWizardStep[]> {
  await delay();
  return [
    { step: 1, completed: false },
    { step: 2, completed: false },
    { step: 3, completed: false },
    { step: 4, completed: false },
    { step: 5, completed: false },
  ];
}

export async function mockCompleteStep(_academyId: string, _step: number): Promise<void> {
  await delay();
}
