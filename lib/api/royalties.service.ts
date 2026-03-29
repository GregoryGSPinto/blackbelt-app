import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type RoyaltyStatus = 'pendente' | 'pago' | 'atrasado' | 'parcial';
export type RoyaltyModel = 'percentual_fixo' | 'valor_fixo' | 'escalonado';

export interface RoyaltyCalculation {
  id: string;
  academy_id: string;
  academy_name: string;
  month: string;
  gross_revenue: number;
  royalty_percentage: number;
  royalty_amount: number;
  marketing_fund_pct: number;
  marketing_fund_amount: number;
  total_due: number;
  status: RoyaltyStatus;
  due_date: string;
  paid_date: string | null;
  model: RoyaltyModel;
}

export interface RoyaltyInvoice {
  id: string;
  academy_id: string;
  academy_name: string;
  month: string;
  royalty_amount: number;
  marketing_fund_amount: number;
  total_due: number;
  status: RoyaltyStatus;
  due_date: string;
  generated_at: string;
}

export interface RoyaltyHistorySummary {
  total_collected: number;
  total_pending: number;
  total_overdue: number;
  calculations: RoyaltyCalculation[];
}

// --- Service Functions ---

export async function calculateRoyalties(academyId: string, month: string): Promise<RoyaltyCalculation> {
  try {
    if (isMock()) {
      const { mockCalculateRoyalties } = await import('@/lib/mocks/royalties.mock');
      return mockCalculateRoyalties(academyId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('royalty_calculations')
      .select('*')
      .eq('academy_id', academyId)
      .eq('month', month)
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'royalties');
      const { mockCalculateRoyalties } = await import('@/lib/mocks/royalties.mock');
      return mockCalculateRoyalties(academyId, month);
    }
    return data as RoyaltyCalculation;
  } catch (error) {
    logServiceError(error, 'royalties');
    const { mockCalculateRoyalties } = await import('@/lib/mocks/royalties.mock');
    return mockCalculateRoyalties(academyId, month);
  }
}

export async function getRoyaltyHistory(franchiseId: string, period?: string): Promise<RoyaltyHistorySummary> {
  try {
    if (isMock()) {
      const { mockGetRoyaltyHistory } = await import('@/lib/mocks/royalties.mock');
      return mockGetRoyaltyHistory(franchiseId, period);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('royalty_calculations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('month', { ascending: false });
    if (period) {
      query = query.gte('month', period);
    }
    const { data, error } = await query;
    if (error || !data) {
      logServiceError(error, 'royalties');
      const { mockGetRoyaltyHistory } = await import('@/lib/mocks/royalties.mock');
      return mockGetRoyaltyHistory(franchiseId, period);
    }
    const calculations = data as RoyaltyCalculation[];
    const total_collected = calculations.filter(c => c.status === 'pago').reduce((s, c) => s + c.total_due, 0);
    const total_pending = calculations.filter(c => c.status === 'pendente').reduce((s, c) => s + c.total_due, 0);
    const total_overdue = calculations.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.total_due, 0);
    return { total_collected, total_pending, total_overdue, calculations };
  } catch (error) {
    logServiceError(error, 'royalties');
    const { mockGetRoyaltyHistory } = await import('@/lib/mocks/royalties.mock');
    return mockGetRoyaltyHistory(franchiseId, period);
  }
}

export async function generateRoyaltyInvoice(academyId: string, month: string): Promise<RoyaltyInvoice> {
  try {
    if (isMock()) {
      const { mockGenerateRoyaltyInvoice } = await import('@/lib/mocks/royalties.mock');
      return mockGenerateRoyaltyInvoice(academyId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('royalty_invoices')
      .insert({ academy_id: academyId, month })
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'royalties');
      const { mockGenerateRoyaltyInvoice } = await import('@/lib/mocks/royalties.mock');
      return mockGenerateRoyaltyInvoice(academyId, month);
    }
    return data as RoyaltyInvoice;
  } catch (error) {
    logServiceError(error, 'royalties');
    const { mockGenerateRoyaltyInvoice } = await import('@/lib/mocks/royalties.mock');
    return mockGenerateRoyaltyInvoice(academyId, month);
  }
}

export async function payRoyalty(invoiceId: string): Promise<RoyaltyCalculation> {
  try {
    if (isMock()) {
      const { mockPayRoyalty } = await import('@/lib/mocks/royalties.mock');
      return mockPayRoyalty(invoiceId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('royalty_calculations')
      .update({ status: 'pago', paid_date: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'royalties');
      const { mockPayRoyalty } = await import('@/lib/mocks/royalties.mock');
      return mockPayRoyalty(invoiceId);
    }
    return data as RoyaltyCalculation;
  } catch (error) {
    logServiceError(error, 'royalties');
    const { mockPayRoyalty } = await import('@/lib/mocks/royalties.mock');
    return mockPayRoyalty(invoiceId);
  }
}
