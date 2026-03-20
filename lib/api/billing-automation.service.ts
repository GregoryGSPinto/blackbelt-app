import { isMock } from '@/lib/env';
import type { BillingConfig, BillingPreview } from '@/lib/types/payment';

export interface BillingCycleResult {
  invoicesGenerated: number;
  remindersSet: number;
  overdueMarked: number;
  alertsSent: number;
}

export async function getBillingCycleConfig(academyId: string): Promise<BillingConfig> {
  try {
    if (isMock()) {
      const { mockGetBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockGetBillingConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('billing_config')
      .select('*')
      .eq('academy_id', academyId)
      .single();
    if (error || !data) {
      console.warn('[getBillingCycleConfig] Supabase error:', error?.message);
      return {} as BillingConfig;
    }
    return data as unknown as BillingConfig;
  } catch (error) {
    console.warn('[getBillingCycleConfig] Fallback:', error);
    return {} as BillingConfig;
  }
}

export async function previewNextBillingCycle(academyId: string): Promise<BillingPreview> {
  try {
    if (isMock()) {
      const { mockPreviewBilling } = await import('@/lib/mocks/billing-config.mock');
      return mockPreviewBilling(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('billing_previews')
      .select('*')
      .eq('academy_id', academyId)
      .single();
    if (error || !data) {
      console.warn('[previewNextBillingCycle] Supabase error:', error?.message);
      return {} as BillingPreview;
    }
    return data as unknown as BillingPreview;
  } catch (error) {
    console.warn('[previewNextBillingCycle] Fallback:', error);
    return {} as BillingPreview;
  }
}

export async function runBillingCycle(academyId: string): Promise<BillingCycleResult> {
  const fallback: BillingCycleResult = { invoicesGenerated: 0, remindersSet: 0, overdueMarked: 0, alertsSent: 0 };
  try {
    if (isMock()) {
      const { mockRunBillingCycle } = await import('@/lib/mocks/billing-automation.mock');
      return mockRunBillingCycle(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('run_billing_cycle', { p_academy_id: academyId });
    if (error || !data) {
      console.warn('[runBillingCycle] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as BillingCycleResult;
  } catch (error) {
    console.warn('[runBillingCycle] Fallback:', error);
    return fallback;
  }
}
