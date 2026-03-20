import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_transactions')
      .select('amount, commission, created_at')
      .gte('created_at', period);

    if (error || !data) {
      console.warn('[getPlatformRevenue] error:', error?.message);
      return { total_revenue: 0, platform_commission: 0, creator_payouts: 0, commission_rate: 0, monthly_data: [] };
    }

    let total_revenue = 0;
    let platform_commission = 0;
    for (const row of data as Array<Record<string, unknown>>) {
      total_revenue += (row.amount as number) ?? 0;
      platform_commission += (row.commission as number) ?? 0;
    }
    return { total_revenue, platform_commission, creator_payouts: total_revenue - platform_commission, commission_rate: total_revenue > 0 ? platform_commission / total_revenue : 0, monthly_data: [] };
  } catch (error) {
    console.warn('[getPlatformRevenue] Fallback:', error);
    return { total_revenue: 0, platform_commission: 0, creator_payouts: 0, commission_rate: 0, monthly_data: [] };
  }
}

export async function getCreatorBalance(creatorId: string): Promise<BalanceDTO> {
  try {
    if (isMock()) {
      const { mockGetCreatorBalance } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetCreatorBalance(creatorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_balances')
      .select('available, pending, total_earned, total_withdrawn')
      .eq('creator_id', creatorId)
      .single();

    if (error || !data) {
      console.warn('[getCreatorBalance] error:', error?.message);
      return { available: 0, pending: 0, total_earned: 0, total_withdrawn: 0 };
    }
    return data as unknown as BalanceDTO;
  } catch (error) {
    console.warn('[getCreatorBalance] Fallback:', error);
    return { available: 0, pending: 0, total_earned: 0, total_withdrawn: 0 };
  }
}

export async function requestWithdrawal(creatorId: string, amount: number): Promise<WithdrawalRecord> {
  try {
    if (isMock()) {
      const { mockRequestWithdrawal } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockRequestWithdrawal(creatorId, amount);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_withdrawals')
      .insert({ creator_id: creatorId, amount, status: 'pending' })
      .select()
      .single();

    if (error || !data) {
      console.warn('[requestWithdrawal] error:', error?.message);
      return { id: '', creator_id: creatorId, amount, status: 'pending', requested_at: new Date().toISOString(), bank_info: '' };
    }
    return data as unknown as WithdrawalRecord;
  } catch (error) {
    console.warn('[requestWithdrawal] Fallback:', error);
    return { id: '', creator_id: creatorId, amount, status: 'pending', requested_at: new Date().toISOString(), bank_info: '' };
  }
}

export async function getWithdrawalHistory(creatorId: string): Promise<WithdrawalRecord[]> {
  try {
    if (isMock()) {
      const { mockGetWithdrawalHistory } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetWithdrawalHistory(creatorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_withdrawals')
      .select('*')
      .eq('creator_id', creatorId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[getWithdrawalHistory] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as WithdrawalRecord[];
  } catch (error) {
    console.warn('[getWithdrawalHistory] Fallback:', error);
    return [];
  }
}

export async function getTopCreators(): Promise<TopCreator[]> {
  try {
    if (isMock()) {
      const { mockGetTopCreators } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetTopCreators();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_creators')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('[getTopCreators] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as TopCreator[];
  } catch (error) {
    console.warn('[getTopCreators] Fallback:', error);
    return [];
  }
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
  try {
    if (isMock()) {
      const { mockGetPendingApprovals } = await import('@/lib/mocks/marketplace-payment.mock');
      return mockGetPendingApprovals();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('marketplace_courses')
      .select('id, title, creator_name, submitted_at, modality')
      .eq('status', 'pending_approval')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.warn('[getPendingApprovals] error:', error.message);
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      course_id: row.id as string,
      title: row.title as string,
      creator_name: row.creator_name as string,
      submitted_at: row.submitted_at as string,
      modality: row.modality as string,
    }));
  } catch (error) {
    console.warn('[getPendingApprovals] Fallback:', error);
    return [];
  }
}
