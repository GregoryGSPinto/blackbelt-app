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
    // API not yet implemented — use mock
    const { mockGetPlatformRevenue } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPlatformRevenue(period);
  } catch (error) { handleServiceError(error, 'marketplacePayment.platformRevenue'); }
}

export async function getCreatorBalance(creatorId: string): Promise<BalanceDTO> {
  try {
    if (isMock()) {
      const { mockGetCreatorBalance } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetCreatorBalance(creatorId);
    }
    // API not yet implemented — use mock
    const { mockGetCreatorBalance } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetCreatorBalance(creatorId);
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
      console.warn('[marketplace-payment.requestWithdrawal] API not available, using mock fallback');
      const { mockRequestWithdrawal } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockRequestWithdrawal(creatorId, amount);
    }
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdraw'); }
}

export async function getWithdrawalHistory(creatorId: string): Promise<WithdrawalRecord[]> {
  try {
    if (isMock()) {
      const { mockGetWithdrawalHistory } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetWithdrawalHistory(creatorId);
    }
    // API not yet implemented — use mock
    const { mockGetWithdrawalHistory } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetWithdrawalHistory(creatorId);
  } catch (error) { handleServiceError(error, 'marketplacePayment.withdrawalHistory'); }
}

export async function getTopCreators(): Promise<TopCreator[]> {
  try {
    if (isMock()) {
      const { mockGetTopCreators } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetTopCreators();
    }
    // API not yet implemented — use mock
    const { mockGetTopCreators } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetTopCreators();
  } catch (error) { handleServiceError(error, 'marketplacePayment.topCreators'); }
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
  try {
    if (isMock()) {
      const { mockGetPendingApprovals } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPendingApprovals();
    }
    // API not yet implemented — use mock
    const { mockGetPendingApprovals } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPendingApprovals();
  } catch (error) { handleServiceError(error, 'marketplacePayment.pendingApprovals'); }
}
