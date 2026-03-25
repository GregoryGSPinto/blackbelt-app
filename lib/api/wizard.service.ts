import { isMock } from '@/lib/env';

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

const EMPTY_PROGRESS: WizardProgressDTO = {
  academyId: '', currentStep: 0, completedSteps: [], stepsData: {}, completed: false, completedAt: null,
};

export async function getWizardProgress(academyId: string): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetWizardProgress } = await import('@/lib/mocks/wizard.mock');
      return mockGetWizardProgress(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('wizard_progress')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (error || !data) {
      console.error('[getWizardProgress] Supabase error:', error?.message);
      return { ...EMPTY_PROGRESS, academyId };
    }

    return {
      academyId: String(data.academy_id ?? academyId),
      currentStep: Number(data.current_step ?? 0),
      completedSteps: (data.completed_steps ?? []) as number[],
      stepsData: (data.steps_data ?? {}) as Record<number, WizardStepData>,
      completed: Boolean(data.completed),
      completedAt: data.completed_at ? String(data.completed_at) : null,
    };
  } catch (error) {
    console.error('[getWizardProgress] Fallback:', error);
    return { ...EMPTY_PROGRESS, academyId };
  }
}

export async function saveWizardStep(academyId: string, step: number, data: WizardStepData): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockSaveWizardStep } = await import('@/lib/mocks/wizard.mock');
      return mockSaveWizardStep(academyId, step, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get current progress first
    const { data: current } = await supabase
      .from('wizard_progress')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    const completedSteps = [...new Set([...((current?.completed_steps ?? []) as number[]), step])];
    const stepsData = { ...((current?.steps_data ?? {}) as Record<number, WizardStepData>), [step]: data };

    const { data: row, error } = await supabase
      .from('wizard_progress')
      .upsert({
        academy_id: academyId,
        current_step: step + 1,
        completed_steps: completedSteps,
        steps_data: stepsData,
      })
      .select()
      .single();

    if (error || !row) {
      console.error('[saveWizardStep] Supabase error:', error?.message);
      return { ...EMPTY_PROGRESS, academyId };
    }

    return {
      academyId: String(row.academy_id ?? academyId),
      currentStep: Number(row.current_step ?? 0),
      completedSteps: (row.completed_steps ?? []) as number[],
      stepsData: (row.steps_data ?? {}) as Record<number, WizardStepData>,
      completed: Boolean(row.completed),
      completedAt: row.completed_at ? String(row.completed_at) : null,
    };
  } catch (error) {
    console.error('[saveWizardStep] Fallback:', error);
    return { ...EMPTY_PROGRESS, academyId };
  }
}

export async function completeWizard(academyId: string): Promise<WizardProgressDTO> {
  try {
    if (isMock()) {
      const { mockCompleteWizard } = await import('@/lib/mocks/wizard.mock');
      return mockCompleteWizard(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('wizard_progress')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('academy_id', academyId)
      .select()
      .single();

    if (error || !data) {
      console.error('[completeWizard] Supabase error:', error?.message);
      return { ...EMPTY_PROGRESS, academyId, completed: true, completedAt: new Date().toISOString() };
    }

    return {
      academyId: String(data.academy_id ?? academyId),
      currentStep: Number(data.current_step ?? 0),
      completedSteps: (data.completed_steps ?? []) as number[],
      stepsData: (data.steps_data ?? {}) as Record<number, WizardStepData>,
      completed: true,
      completedAt: data.completed_at ? String(data.completed_at) : new Date().toISOString(),
    };
  } catch (error) {
    console.error('[completeWizard] Fallback:', error);
    return { ...EMPTY_PROGRESS, academyId, completed: true, completedAt: new Date().toISOString() };
  }
}
