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
    const res = await fetch(`/api/marketplace/revenue?period=${period}`);
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.platformRevenue');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.platformRevenue'); }
}

export async function getCreatorBalance(creatorId: string): Promise<BalanceDTO> {
  try {
    if (isMock()) {
      const { mockGetCreatorBalance } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetCreatorBalance(creatorId);
    }
    const res = await fetch(`/api/marketplace/balance?creatorId=${creatorId}`);
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.balance');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.balance'); }
}

export async function requestWithdrawal(creatorId: string, amount: number): Promise<WithdrawalRecord> {
  try {
    if (isMock()) {
      const { mockRequestWithdrawal } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockRequestWithdrawal(creatorId, amount);
    }
    const res = await fetch(`/api/marketplace/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, amount }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.withdraw');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdraw'); }
}

export async function getWithdrawalHistory(creatorId: string): Promise<WithdrawalRecord[]> {
  try {
    if (isMock()) {
      const { mockGetWithdrawalHistory } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetWithdrawalHistory(creatorId);
    }
    const res = await fetch(`/api/marketplace/withdrawals?creatorId=${creatorId}`);
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.withdrawalHistory');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdrawalHistory'); }
}

export async function getTopCreators(): Promise<TopCreator[]> {
  try {
    if (isMock()) {
      const { mockGetTopCreators } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetTopCreators();
    }
    const res = await fetch(`/api/marketplace/top-creators`);
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.topCreators');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.topCreators'); }
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
  try {
    if (isMock()) {
      const { mockGetPendingApprovals } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPendingApprovals();
    }
    const res = await fetch(`/api/marketplace/pending-approvals`);
    if (!res.ok) throw new ServiceError(res.status, 'marketplacePayment.pendingApprovals');
    return res.json();
  } catch (error) { handleServiceError(error, 'marketplacePayment.pendingApprovals'); }
}
