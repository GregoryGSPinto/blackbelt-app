import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/store/rewards/balance?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'storeRewards.getBalance');
      return res.json();
    } catch {
      console.warn('[store-rewards.getBalance] API not available, using fallback');
      return { points: 0, value_brl: 0 } as RewardBalance;
    }
  } catch (error) { handleServiceError(error, 'storeRewards.getBalance'); }
}

export async function getHistory(userId: string): Promise<RewardTransaction[]> {
  try {
    if (isMock()) {
      const { mockGetHistory } = await import('@/lib/mocks/store-rewards.mock');
      return mockGetHistory(userId);
    }
    try {
      const res = await fetch(`/api/store/rewards/history?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'storeRewards.getHistory');
      return res.json();
    } catch {
      console.warn('[store-rewards.getHistory] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'storeRewards.getHistory'); }
}

export async function redeemPoints(userId: string, amount: number, orderId: string): Promise<RewardTransaction> {
  try {
    if (isMock()) {
      const { mockRedeemPoints } = await import('@/lib/mocks/store-rewards.mock');
      return mockRedeemPoints(userId, amount, orderId);
    }
    try {
      const res = await fetch('/api/store/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, orderId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'storeRewards.redeemPoints');
      return res.json();
    } catch {
      console.warn('[store-rewards.redeemPoints] API not available, using fallback');
      return { id: '', user_id: '', type: 'checkin', points: 0, description: '', created_at: '' } as RewardTransaction;
    }
  } catch (error) { handleServiceError(error, 'storeRewards.redeemPoints'); }
}
