import { isMock } from '@/lib/env';
import type { BillingConfig, BillingPreview, WebhookLog } from '@/lib/types/payment';

export async function getBillingConfig(academyId: string): Promise<BillingConfig> {
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
      console.warn('[getBillingConfig] Supabase error:', error?.message);
      return {} as BillingConfig;
    }
    return data as unknown as BillingConfig;
  } catch (error) {
    console.warn('[getBillingConfig] Fallback:', error);
    return {} as BillingConfig;
  }
}

export async function updateBillingConfig(config: Partial<BillingConfig> & { academyId: string }): Promise<BillingConfig> {
  try {
    if (isMock()) {
      const { mockUpdateBillingConfig } = await import('@/lib/mocks/billing-config.mock');
      return mockUpdateBillingConfig(config);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { academyId, ...rest } = config;
    const { data, error } = await supabase
      .from('billing_config')
      .update(rest)
      .eq('academy_id', academyId)
      .select()
      .single();
    if (error || !data) {
      console.warn('[updateBillingConfig] Supabase error:', error?.message);
      return config as unknown as BillingConfig;
    }
    return data as unknown as BillingConfig;
  } catch (error) {
    console.warn('[updateBillingConfig] Fallback:', error);
    return config as unknown as BillingConfig;
  }
}

export async function getWebhookLogs(academyId: string): Promise<WebhookLog[]> {
  try {
    if (isMock()) {
      const { mockGetWebhookLogs } = await import('@/lib/mocks/billing-config.mock');
      return mockGetWebhookLogs(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[getWebhookLogs] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as WebhookLog[];
  } catch (error) {
    console.warn('[getWebhookLogs] Fallback:', error);
    return [];
  }
}

export async function previewNextBilling(academyId: string): Promise<BillingPreview> {
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
      console.warn('[previewNextBilling] Supabase error:', error?.message);
      return {} as BillingPreview;
    }
    return data as unknown as BillingPreview;
  } catch (error) {
    console.warn('[previewNextBilling] Fallback:', error);
    return {} as BillingPreview;
  }
}
