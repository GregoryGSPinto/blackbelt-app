import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface WizardStepData {
  [key: string]: string | string[] | number | boolean | null | undefined | Record<string, string | number | boolean>;
}

export interface WizardProgressDTO {
  academyId: string;
  currentStep: number;
  completedSteps: number[];
  stepsData: Record<number, WizardStepData>;
  completed: boolean;
  completedAt: string | null;
}

export async function getWizardProgress(academyId: string): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetWizardProgress } = await import('@/lib/mocks/wizard.mock');
      return mockGetWizardProgress(academyId);
    }
    try {
      const res = await fetch(`/api/wizard/progress?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'wizard.getProgress');
      return res.json();
    } catch {
      console.warn('[wizard.getWizardProgress] API not available, using fallback');
      return { academyId: '', currentStep: 0, completedSteps: [], stepsData: {}, completed: false, completedAt: null } as WizardProgressDTO;
    }
  } catch (error) { handleServiceError(error, 'wizard.getProgress'); }
}

export async function saveWizardStep(academyId: string, step: number, data: WizardStepData): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockSaveWizardStep } = await import('@/lib/mocks/wizard.mock');
      return mockSaveWizardStep(academyId, step, data);
    }
    try {
      const res = await fetch(`/api/wizard/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, step, data }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'wizard.saveStep');
      return res.json();
    } catch {
      console.warn('[wizard.saveWizardStep] API not available, using fallback');
      return { academyId: '', currentStep: 0, completedSteps: [], stepsData: {}, completed: false, completedAt: null } as WizardProgressDTO;
    }
  } catch (error) { handleServiceError(error, 'wizard.saveStep'); }
}

export async function completeWizard(academyId: string): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockCompleteWizard } = await import('@/lib/mocks/wizard.mock');
      return mockCompleteWizard(academyId);
    }
    try {
      const res = await fetch(`/api/wizard/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'wizard.complete');
      return res.json();
    } catch {
      console.warn('[wizard.completeWizard] API not available, using fallback');
      return { academyId: '', currentStep: 0, completedSteps: [], stepsData: {}, completed: false, completedAt: null } as WizardProgressDTO;
    }
  } catch (error) { handleServiceError(error, 'wizard.complete'); }
}
