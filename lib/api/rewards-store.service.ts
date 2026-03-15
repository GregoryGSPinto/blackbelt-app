import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type RewardCategory = 'desconto' | 'experiencia' | 'produto' | 'digital' | 'prioridade';
export type RewardStatus = 'available' | 'out_of_stock' | 'expired';

export interface StoreReward {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cost_points: number;
  category: RewardCategory;
  stock: number;
  status: RewardStatus;
}

export interface RedemptionDTO {
  id: string;
  reward_id: string;
  reward_name: string;
  cost_points: number;
  redeemed_at: string;
  status: 'pending' | 'delivered' | 'cancelled';
  user_id: string;
  user_name?: string;
}

export interface RewardsStoreData {
  rewards: StoreReward[];
  user_points_balance: number;
}

export async function getRewardsStore(academyId: string): Promise<RewardsStoreData> {
  try {
    if (isMock()) {
      const { mockGetRewardsStore } = await import('@/lib/mocks/rewards-store.mock');
      return mockGetRewardsStore(academyId);
    }
    const res = await fetch(`/api/rewards-store?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.get');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.get'); }
}

export async function redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string; redemption: RedemptionDTO }> {
  try {
    if (isMock()) {
      const { mockRedeemReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockRedeemReward(userId, rewardId);
    }
    const res = await fetch('/api/rewards-store/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rewardId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.redeem');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.redeem'); }
}

export async function getMyRedemptions(userId: string): Promise<RedemptionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyRedemptions } = await import('@/lib/mocks/rewards-store.mock');
      return mockGetMyRedemptions(userId);
    }
    const res = await fetch(`/api/rewards-store/redemptions?userId=${userId}`);
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.redemptions');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.redemptions'); }
}

// Admin endpoints
export async function createStoreReward(academyId: string, data: Omit<StoreReward, 'id' | 'status'>): Promise<StoreReward> {
  try {
    if (isMock()) {
      const { mockCreateStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockCreateStoreReward(academyId, data);
    }
    const res = await fetch('/api/rewards-store/admin/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, ...data }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.create'); }
}

export async function updateStoreReward(rewardId: string, data: Partial<StoreReward>): Promise<StoreReward> {
  try {
    if (isMock()) {
      const { mockUpdateStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockUpdateStoreReward(rewardId, data);
    }
    const res = await fetch(`/api/rewards-store/admin/rewards/${rewardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.update');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.update'); }
}

export async function deleteStoreReward(rewardId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockDeleteStoreReward(rewardId);
    }
    const res = await fetch(`/api/rewards-store/admin/rewards/${rewardId}`, { method: 'DELETE' });
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.delete');
  } catch (error) { handleServiceError(error, 'rewardsStore.delete'); }
}

export async function getAllRedemptions(academyId: string): Promise<RedemptionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAllRedemptions } = await import('@/lib/mocks/rewards-store.mock');
      return mockGetAllRedemptions(academyId);
    }
    const res = await fetch(`/api/rewards-store/admin/redemptions?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'rewardsStore.allRedemptions');
    return res.json();
  } catch (error) { handleServiceError(error, 'rewardsStore.allRedemptions'); }
}
