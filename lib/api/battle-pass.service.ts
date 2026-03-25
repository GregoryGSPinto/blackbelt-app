import { isMock } from '@/lib/env';

export type BattlePassRewardType =
  | 'xp_bonus'
  | 'badge'
  | 'store_discount'
  | 'private_lesson'
  | 'exclusive_gi'
  | 'ranking_highlight'
  | 'special_title';

export interface BattlePassReward {
  type: BattlePassRewardType;
  label: string;
  icon: string;
}

export interface BattlePassLevel {
  level: number;
  xp_required: number;
  free_reward: BattlePassReward | null;
  premium_reward: BattlePassReward | null;
  claimed_free: boolean;
  claimed_premium: boolean;
}

export interface BattlePassDTO {
  season_id: string;
  levels: BattlePassLevel[];
  is_premium: boolean;
  premium_price: number;
}

export interface BattlePassProgress {
  user_id: string;
  season_id: string;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  is_premium: boolean;
  total_rewards_claimed: number;
}

export async function getBattlePass(seasonId: string): Promise<BattlePassDTO> {
  const fallback: BattlePassDTO = { season_id: '', levels: [], is_premium: false, premium_price: 0 };
  try {
    if (isMock()) {
      const { mockGetBattlePass } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetBattlePass(seasonId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('battle_pass_seasons')
      .select('*, battle_pass_levels(*)')
      .eq('id', seasonId)
      .single();
    if (error || !data) {
      console.error('[getBattlePass] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as BattlePassDTO;
  } catch (error) {
    console.error('[getBattlePass] Fallback:', error);
    return fallback;
  }
}

export async function getMyBattlePassProgress(userId: string, seasonId: string): Promise<BattlePassProgress> {
  const fallback: BattlePassProgress = { user_id: '', season_id: '', current_level: 0, current_xp: 0, xp_to_next_level: 0, is_premium: false, total_rewards_claimed: 0 };
  try {
    if (isMock()) {
      const { mockGetMyProgress } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetMyProgress(userId, seasonId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('battle_pass_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('season_id', seasonId)
      .single();
    if (error || !data) {
      console.error('[getMyBattlePassProgress] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as BattlePassProgress;
  } catch (error) {
    console.error('[getMyBattlePassProgress] Fallback:', error);
    return fallback;
  }
}

export async function claimReward(userId: string, levelId: number): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockClaimReward } = await import('@/lib/mocks/battle-pass.mock');
      return mockClaimReward(userId, levelId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('claim_battle_pass_reward', { p_user_id: userId, p_level_id: levelId });
    if (error || !data) {
      console.error('[claimReward] Supabase error:', error?.message);
      return { success: false, message: error?.message ?? 'Unknown error' };
    }
    return data as unknown as { success: boolean; message: string };
  } catch (error) {
    console.error('[claimReward] Fallback:', error);
    return { success: false, message: 'Fallback error' };
  }
}

export async function upgradeToPremium(userId: string, seasonId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockUpgradeToPremium } = await import('@/lib/mocks/battle-pass.mock');
      return mockUpgradeToPremium(userId, seasonId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('battle_pass_progress')
      .update({ is_premium: true })
      .eq('user_id', userId)
      .eq('season_id', seasonId);
    if (error) {
      console.error('[upgradeToPremium] Supabase error:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Premium ativado com sucesso!' };
  } catch (error) {
    console.error('[upgradeToPremium] Fallback:', error);
    return { success: false, message: 'Fallback error' };
  }
}
