import { isMock } from '@/lib/env';
import type { AutomationConfig } from '@/lib/types/notification';
import { logServiceError } from '@/lib/api/errors';

export async function listAutomations(academyId: string): Promise<AutomationConfig[]> {
  try {
    if (isMock()) {
      const { mockListAutomations } = await import('@/lib/mocks/automations.mock');
      return mockListAutomations(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('whatsapp_automations')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError(error, 'automations');
      return [];
    }
    return (data ?? []) as unknown as AutomationConfig[];
  } catch (error) {
    logServiceError(error, 'automations');
    return [];
  }
}

export async function toggleAutomation(id: string, enabled: boolean): Promise<AutomationConfig> {
  try {
    if (isMock()) {
      const { mockToggleAutomation } = await import('@/lib/mocks/automations.mock');
      return mockToggleAutomation(id, enabled);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('whatsapp_automations')
      .update({ is_active: enabled })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'automations');
      return { id, enabled } as unknown as AutomationConfig;
    }
    return data as unknown as AutomationConfig;
  } catch (error) {
    logServiceError(error, 'automations');
    return { id, enabled } as unknown as AutomationConfig;
  }
}
