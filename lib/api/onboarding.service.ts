import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
  try {
    if (isMock()) {
      const { mockCreateAcademy } = await import('@/lib/mocks/onboarding.mock');
      return mockCreateAcademy(academy, admin, platformPlan);
    }
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academy, admin, platformPlan }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'onboarding.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'onboarding.create'); }
}

export async function getSetupProgress(academyId: string): Promise<SetupWizardStep[]> {
  try {
    if (isMock()) {
      const { mockGetSetupProgress } = await import('@/lib/mocks/onboarding.mock');
      return mockGetSetupProgress(academyId);
    }
    const res = await fetch(`/api/onboarding/progress?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'onboarding.progress');
    return res.json();
  } catch (error) { handleServiceError(error, 'onboarding.progress'); }
}

export async function completeSetupStep(academyId: string, step: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockCompleteStep } = await import('@/lib/mocks/onboarding.mock');
      return mockCompleteStep(academyId, step);
    }
    const res = await fetch('/api/onboarding/complete-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, step }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'onboarding.completeStep');
  } catch (error) { handleServiceError(error, 'onboarding.completeStep'); }
}
