import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type RewardTransactionType = 'checkin' | 'purchase' | 'redemption' | 'bonus';

export interface RewardBalance {
  points: number;
  value_brl: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  type: RewardTransactionType;
  points: number;
  description: string;
  reference_id?: string;
  created_at: string;
}

export async function getBalance(userId: string): Promise<RewardBalance> {
  try {
    if (isMock()) {
      const { mockGetBalance } = await import('@/lib/mocks/store-rewards.mock');
      return mockGetBalance(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reward_balances')
      .select('points, value_brl')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'store-rewards');
      return { points: 0, value_brl: 0 };
    }
    return data as RewardBalance;
  } catch (error) {
    logServiceError(error, 'store-rewards');
    return { points: 0, value_brl: 0 };
  }
}

export async function getHistory(userId: string): Promise<RewardTransaction[]> {
  try {
    if (isMock()) {
      const { mockGetHistory } = await import('@/lib/mocks/store-rewards.mock');
      return mockGetHistory(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'store-rewards');
      return [];
    }
    return (data ?? []) as RewardTransaction[];
  } catch (error) {
    logServiceError(error, 'store-rewards');
    return [];
  }
}

export async function redeemPoints(userId: string, amount: number, orderId: string): Promise<RewardTransaction> {
  try {
    if (isMock()) {
      const { mockRedeemPoints } = await import('@/lib/mocks/store-rewards.mock');
      return mockRedeemPoints(userId, amount, orderId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reward_transactions')
      .insert({ user_id: userId, type: 'redemption', points: -amount, description: `Resgate pedido ${orderId}`, reference_id: orderId })
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'store-rewards');
      const { mockRedeemPoints } = await import('@/lib/mocks/store-rewards.mock');
      return mockRedeemPoints(userId, amount, orderId);
    }
    return data as RewardTransaction;
  } catch (error) {
    logServiceError(error, 'store-rewards');
    const { mockRedeemPoints } = await import('@/lib/mocks/store-rewards.mock');
    return mockRedeemPoints(userId, amount, orderId);
  }
}
