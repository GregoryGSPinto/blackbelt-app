import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('store_rewards')
      .select('*')
      .eq('academy_id', academyId)
      .eq('status', 'available');

    if (error || !data) {
      logServiceError(error, 'rewards-store');
      return { rewards: [], user_points_balance: 0 };
    }

    return {
      rewards: (data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        description: String(row.description ?? ''),
        image_url: String(row.image_url ?? ''),
        cost_points: Number(row.cost_points ?? 0),
        category: (row.category ?? 'produto') as RewardCategory,
        stock: Number(row.stock ?? 0),
        status: (row.status ?? 'available') as RewardStatus,
      })),
      user_points_balance: 0,
    };
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return { rewards: [], user_points_balance: 0 };
  }
}

export async function redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string; redemption: RedemptionDTO }> {
  try {
    if (isMock()) {
      const { mockRedeemReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockRedeemReward(userId, rewardId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('reward_redemptions')
      .insert({ user_id: userId, reward_id: rewardId, status: 'pending', redeemed_at: new Date().toISOString() })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'rewards-store');
      return { success: false, message: error?.message ?? 'Error', redemption: { id: '', reward_id: rewardId, reward_name: '', cost_points: 0, redeemed_at: '', status: 'pending', user_id: userId } };
    }

    return {
      success: true,
      message: 'Resgatado com sucesso',
      redemption: {
        id: String(data.id),
        reward_id: String(data.reward_id),
        reward_name: '',
        cost_points: Number(data.cost_points ?? 0),
        redeemed_at: String(data.redeemed_at),
        status: 'pending',
        user_id: userId,
      },
    };
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return { success: false, message: 'Error', redemption: { id: '', reward_id: rewardId, reward_name: '', cost_points: 0, redeemed_at: '', status: 'pending', user_id: userId } };
  }
}

export async function getMyRedemptions(userId: string): Promise<RedemptionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyRedemptions } = await import('@/lib/mocks/rewards-store.mock');
      return mockGetMyRedemptions(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'rewards-store');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      reward_id: String(row.reward_id ?? ''),
      reward_name: String(row.reward_name ?? ''),
      cost_points: Number(row.cost_points ?? 0),
      redeemed_at: String(row.redeemed_at ?? ''),
      status: (row.status ?? 'pending') as RedemptionDTO['status'],
      user_id: String(row.user_id ?? ''),
      user_name: row.user_name ? String(row.user_name) : undefined,
    }));
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return [];
  }
}

// Admin endpoints
export async function createStoreReward(academyId: string, data: Omit<StoreReward, 'id' | 'status'>): Promise<StoreReward> {
  try {
    if (isMock()) {
      const { mockCreateStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockCreateStoreReward(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('store_rewards')
      .insert({ academy_id: academyId, ...data, status: 'available' })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'rewards-store');
      return { id: '', ...data, status: 'available' };
    }

    return {
      id: String(row.id),
      name: String(row.name ?? ''),
      description: String(row.description ?? ''),
      image_url: String(row.image_url ?? ''),
      cost_points: Number(row.cost_points ?? 0),
      category: (row.category ?? 'produto') as RewardCategory,
      stock: Number(row.stock ?? 0),
      status: (row.status ?? 'available') as RewardStatus,
    };
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return { id: '', ...data, status: 'available' };
  }
}

export async function updateStoreReward(rewardId: string, data: Partial<StoreReward>): Promise<StoreReward> {
  try {
    if (isMock()) {
      const { mockUpdateStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockUpdateStoreReward(rewardId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('store_rewards')
      .update(data)
      .eq('id', rewardId)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'rewards-store');
      return { id: rewardId, name: '', description: '', image_url: '', cost_points: 0, category: 'produto', stock: 0, status: 'available', ...data };
    }

    return {
      id: String(row.id),
      name: String(row.name ?? ''),
      description: String(row.description ?? ''),
      image_url: String(row.image_url ?? ''),
      cost_points: Number(row.cost_points ?? 0),
      category: (row.category ?? 'produto') as RewardCategory,
      stock: Number(row.stock ?? 0),
      status: (row.status ?? 'available') as RewardStatus,
    };
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return { id: rewardId, name: '', description: '', image_url: '', cost_points: 0, category: 'produto', stock: 0, status: 'available', ...data };
  }
}

export async function deleteStoreReward(rewardId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteStoreReward } = await import('@/lib/mocks/rewards-store.mock');
      return mockDeleteStoreReward(rewardId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('store_rewards')
      .delete()
      .eq('id', rewardId);

    if (error) {
      logServiceError(error, 'rewards-store');
    }
  } catch (error) {
    logServiceError(error, 'rewards-store');
  }
}

export async function getAllRedemptions(academyId: string): Promise<RedemptionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAllRedemptions } = await import('@/lib/mocks/rewards-store.mock');
      return mockGetAllRedemptions(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('academy_id', academyId)
      .order('redeemed_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'rewards-store');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      reward_id: String(row.reward_id ?? ''),
      reward_name: String(row.reward_name ?? ''),
      cost_points: Number(row.cost_points ?? 0),
      redeemed_at: String(row.redeemed_at ?? ''),
      status: (row.status ?? 'pending') as RedemptionDTO['status'],
      user_id: String(row.user_id ?? ''),
      user_name: row.user_name ? String(row.user_name) : undefined,
    }));
  } catch (error) {
    logServiceError(error, 'rewards-store');
    return [];
  }
}
