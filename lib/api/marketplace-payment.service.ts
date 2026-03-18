import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface BalanceDTO {
  available: number;
  pending: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface WithdrawalRecord {
  id: string;
  creator_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  bank_info: string;
}

export interface PlatformRevenue {
  total_revenue: number;
  platform_commission: number;
  creator_payouts: number;
  commission_rate: number;
  monthly_data: { month: string; revenue: number; commission: number; payouts: number }[];
}

export interface TopCreator {
  creator_id: string;
  creator_name: string;
  academy: string;
  courses_count: number;
  total_sales: number;
  total_revenue: number;
}

export interface PendingApproval {
  course_id: string;
  title: string;
  creator_name: string;
  submitted_at: string;
  modality: string;
}

export async function getPlatformRevenue(period: string): Promise<PlatformRevenue> {
  try {
    if (isMock()) {
      const { mockGetPlatformRevenue } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPlatformRevenue(period);
    }
    try {
      const res = await fetch(`/api/marketplace/revenue?period=${period}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.platformRevenue');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.getPlatformRevenue] API not available, using fallback');
      return { total_revenue: 0, commission_earned: 0, pending_payouts: 0, top_creators: [], pending_approvals: [], monthly_data: [] } as unknown as PlatformRevenue;
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.platformRevenue'); }
}

export async function getCreatorBalance(creatorId: string): Promise<BalanceDTO> {
  try {
    if (isMock()) {
      const { mockGetCreatorBalance } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetCreatorBalance(creatorId);
    }
    try {
      const res = await fetch(`/api/marketplace/balance?creatorId=${creatorId}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.balance');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.getCreatorBalance] API not available, using fallback');
      return { available: 0, pending: 0, total_earned: 0, total_withdrawn: 0, currency: "BRL" } as BalanceDTO;
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.balance'); }
}

export async function requestWithdrawal(creatorId: string, amount: number): Promise<WithdrawalRecord> {
  try {
    if (isMock()) {
      const { mockRequestWithdrawal } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockRequestWithdrawal(creatorId, amount);
    }
    try {
      const res = await fetch(`/api/marketplace/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, amount }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.withdraw');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.requestWithdrawal] API not available, using fallback');
      return { id: "", creator_id: "", amount: 0, status: "pending", requested_at: "", processed_at: null, bank_account: "" } as unknown as WithdrawalRecord;
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdraw'); }
}

export async function getWithdrawalHistory(creatorId: string): Promise<WithdrawalRecord[]> {
  try {
    if (isMock()) {
      const { mockGetWithdrawalHistory } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetWithdrawalHistory(creatorId);
    }
    try {
      const res = await fetch(`/api/marketplace/withdrawals?creatorId=${creatorId}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.withdrawalHistory');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.getWithdrawalHistory] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdrawalHistory'); }
}

export async function getTopCreators(): Promise<TopCreator[]> {
  try {
    if (isMock()) {
      const { mockGetTopCreators } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetTopCreators();
    }
    try {
      const res = await fetch(`/api/marketplace/top-creators`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.topCreators');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.getTopCreators] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.topCreators'); }
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
  try {
    if (isMock()) {
      const { mockGetPendingApprovals } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPendingApprovals();
    }
    try {
      const res = await fetch(`/api/marketplace/pending-approvals`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.pendingApprovals');
      return res.json();
    } catch {
      console.warn('[marketplace-payment.getPendingApprovals] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.pendingApprovals'); }
}
