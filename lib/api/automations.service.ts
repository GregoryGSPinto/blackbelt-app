import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { AutomationConfig } from '@/lib/types/notification';

export async function listAutomations(academyId: string): Promise<AutomationConfig[]> {
  try {
    if (isMock()) {
      const { mockListAutomations } = await import('@/lib/mocks/automations.mock');
      return mockListAutomations(academyId);
    }
    try {
      const res = await fetch(`/api/automations?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'automations.list');
      return res.json();
    } catch {
      console.warn('[automations.listAutomations] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'automations.list'); }
}

export async function toggleAutomation(id: string, enabled: boolean): Promise<AutomationConfig> {
  try {
    if (isMock()) {
      const { mockToggleAutomation } = await import('@/lib/mocks/automations.mock');
      return mockToggleAutomation(id, enabled);
    }
    try {
      const res = await fetch(`/api/automations/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'automations.toggle');
      return res.json();
    } catch {
      console.warn('[automations.toggleAutomation] API not available, using fallback');
      return {} as AutomationConfig;
    }
  } catch (error) { handleServiceError(error, 'automations.toggle'); }
}
