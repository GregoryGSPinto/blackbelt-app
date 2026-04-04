import type { WizardProgressDTO, WizardStepData } from '@/lib/api/wizard.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

let WIZARD_PROGRESS: WizardProgressDTO = {
  academyId: 'academy-1',
  currentStep: 1,
  completedSteps: [0],
  stepsData: {
    0: {
      academyName: 'Academia Fight Club',
      primaryColor: '#DC2626',
      logoUrl: null,
    },
  },
  completed: false,
  completedAt: null,
};

export async function mockGetWizardProgress(_academyId: string): Promise<WizardProgressDTO> {
  await delay();
  return { ...WIZARD_PROGRESS, stepsData: { ...WIZARD_PROGRESS.stepsData } };
}

export async function mockSaveWizardStep(_academyId: string, step: number, data: WizardStepData): Promise<WizardProgressDTO> {
  await delay();
  WIZARD_PROGRESS = {
    ...WIZARD_PROGRESS,
    currentStep: step + 1,
    completedSteps: [...new Set([...WIZARD_PROGRESS.completedSteps, step])],
    stepsData: { ...WIZARD_PROGRESS.stepsData, [step]: data },
  };
  return { ...WIZARD_PROGRESS, stepsData: { ...WIZARD_PROGRESS.stepsData } };
}

export async function mockCompleteWizard(_academyId: string): Promise<WizardProgressDTO> {
  await delay();
  WIZARD_PROGRESS = {
    ...WIZARD_PROGRESS,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  return { ...WIZARD_PROGRESS, stepsData: { ...WIZARD_PROGRESS.stepsData } };
}
