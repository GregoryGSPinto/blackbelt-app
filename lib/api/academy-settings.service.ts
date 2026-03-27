import { isMock } from '@/lib/env';
import type { TeenAutonomyConfig } from '@/lib/types/domain';

// ────────────────────────────────────────────────────────────
// Defaults
// ────────────────────────────────────────────────────────────

export const DEFAULT_TEEN_CONFIG: TeenAutonomyConfig = {
  teenCanViewSchedule: true,
  teenCanSelfCheckin: true,
  teenCanReceiveDirectNotifications: true,
  teenCanViewPayments: false,
  teenCanEditPersonalData: false,
  teenCanParticipateGeneralRanking: false,
};

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getTeenConfig(academyId: string): Promise<TeenAutonomyConfig> {
  if (isMock()) {
    return { ...DEFAULT_TEEN_CONFIG };
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_settings')
      .select('teen_config')
      .eq('academy_id', academyId)
      .maybeSingle();

    if (error) {
      console.error('[getTeenConfig] error:', error.message);
      return { ...DEFAULT_TEEN_CONFIG };
    }

    if (!data?.teen_config) return { ...DEFAULT_TEEN_CONFIG };

    const raw = data.teen_config as Record<string, unknown>;
    return {
      teenCanViewSchedule: (raw.teenCanViewSchedule as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanViewSchedule,
      teenCanSelfCheckin: (raw.teenCanSelfCheckin as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanSelfCheckin,
      teenCanReceiveDirectNotifications: (raw.teenCanReceiveDirectNotifications as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanReceiveDirectNotifications,
      teenCanViewPayments: (raw.teenCanViewPayments as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanViewPayments,
      teenCanEditPersonalData: (raw.teenCanEditPersonalData as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanEditPersonalData,
      teenCanParticipateGeneralRanking: (raw.teenCanParticipateGeneralRanking as boolean) ?? DEFAULT_TEEN_CONFIG.teenCanParticipateGeneralRanking,
    };
  } catch (err) {
    console.error('[getTeenConfig] fallback:', err);
    return { ...DEFAULT_TEEN_CONFIG };
  }
}

export async function updateTeenConfig(
  academyId: string,
  config: Partial<TeenAutonomyConfig>,
): Promise<TeenAutonomyConfig> {
  const current = await getTeenConfig(academyId);
  const merged = { ...current, ...config };

  if (isMock()) {
    return merged;
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('academy_settings')
      .upsert({ academy_id: academyId, teen_config: merged }, { onConflict: 'academy_id' });

    if (error) {
      console.error('[updateTeenConfig] error:', error.message);
      throw new Error(error.message);
    }
    return merged;
  } catch (err) {
    console.error('[updateTeenConfig] fallback:', err);
    throw err;
  }
}
