import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
  try {
    if (isMock()) {
      const { mockGetBattlePass } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetBattlePass(seasonId);
    }
    try {
      const res = await fetch(`/api/battle-pass?seasonId=${seasonId}`);
      if (!res.ok) throw new ServiceError(res.status, 'battlePass.get');
      return res.json();
    } catch {
      console.warn('[battle-pass.getBattlePass] API not available, using mock fallback');
      const { mockGetBattlePass } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetBattlePass(seasonId);
    }
  } catch (error) { handleServiceError(error, 'battlePass.get'); }
}

export async function getMyBattlePassProgress(userId: string, seasonId: string): Promise<BattlePassProgress> {
  try {
    if (isMock()) {
      const { mockGetMyProgress } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetMyProgress(userId, seasonId);
    }
    try {
      const res = await fetch(`/api/battle-pass/progress?userId=${userId}&seasonId=${seasonId}`);
      if (!res.ok) throw new ServiceError(res.status, 'battlePass.myProgress');
      return res.json();
    } catch {
      console.warn('[battle-pass.getMyBattlePassProgress] API not available, using mock fallback');
      const { mockGetMyProgress } = await import('@/lib/mocks/battle-pass.mock');
      return mockGetMyProgress(userId, seasonId);
    }
  } catch (error) { handleServiceError(error, 'battlePass.myProgress'); }
}

export async function claimReward(userId: string, levelId: number): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockClaimReward } = await import('@/lib/mocks/battle-pass.mock');
      return mockClaimReward(userId, levelId);
    }
    try {
      const res = await fetch('/api/battle-pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, levelId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'battlePass.claim');
      return res.json();
    } catch {
      console.warn('[battle-pass.claimReward] API not available, using mock fallback');
      const { mockClaimReward } = await import('@/lib/mocks/battle-pass.mock');
      return mockClaimReward(userId, levelId);
    }
  } catch (error) { handleServiceError(error, 'battlePass.claim'); }
}

export async function upgradeToPremium(userId: string, seasonId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockUpgradeToPremium } = await import('@/lib/mocks/battle-pass.mock');
      return mockUpgradeToPremium(userId, seasonId);
    }
    try {
      const res = await fetch('/api/battle-pass/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, seasonId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'battlePass.upgrade');
      return res.json();
    } catch {
      console.warn('[battle-pass.upgradeToPremium] API not available, using mock fallback');
      const { mockUpgradeToPremium } = await import('@/lib/mocks/battle-pass.mock');
      return mockUpgradeToPremium(userId, seasonId);
    }
  } catch (error) { handleServiceError(error, 'battlePass.upgrade'); }
}
