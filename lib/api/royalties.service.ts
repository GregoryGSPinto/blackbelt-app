import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/royalties/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, month }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'royalties.calculate');
      return res.json();
    } catch {
      console.warn('[royalties.calculateRoyalties] API not available, using fallback');
      return { academy_id: "", academy_name: "", period: "", gross_revenue: 0, royalty_rate: 0, royalty_amount: 0, adjustments: 0, net_amount: 0 } as unknown as RoyaltyCalculation;
    }
  } catch (error) { handleServiceError(error, 'royalties.calculate'); }
}

export async function getRoyaltyHistory(franchiseId: string, period?: string): Promise<RoyaltyHistorySummary> {
  try {
    if (isMock()) {
      const { mockGetRoyaltyHistory } = await import('@/lib/mocks/royalties.mock');
      return mockGetRoyaltyHistory(franchiseId, period);
    }
    try {
      const params = new URLSearchParams({ franchiseId });
      if (period) params.set('period', period);
      const res = await fetch(`/api/royalties/history?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'royalties.history');
      return res.json();
    } catch {
      console.warn('[royalties.getRoyaltyHistory] API not available, using fallback');
      return { total_collected: 0, total_pending: 0, average_monthly: 0, history: [] } as unknown as RoyaltyHistorySummary;
    }
  } catch (error) { handleServiceError(error, 'royalties.history'); }
}

export async function generateRoyaltyInvoice(academyId: string, month: string): Promise<RoyaltyInvoice> {
  try {
    if (isMock()) {
      const { mockGenerateRoyaltyInvoice } = await import('@/lib/mocks/royalties.mock');
      return mockGenerateRoyaltyInvoice(academyId, month);
    }
    try {
      const res = await fetch(`/api/royalties/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, month }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'royalties.invoice');
      return res.json();
    } catch {
      console.warn('[royalties.generateRoyaltyInvoice] API not available, using fallback');
      return { id: "", academy_id: "", period: "", amount: 0, status: "pending", due_date: "", paid_at: null } as unknown as RoyaltyInvoice;
    }
  } catch (error) { handleServiceError(error, 'royalties.invoice'); }
}

export async function payRoyalty(invoiceId: string): Promise<RoyaltyCalculation> {
  try {
    if (isMock()) {
      const { mockPayRoyalty } = await import('@/lib/mocks/royalties.mock');
      return mockPayRoyalty(invoiceId);
    }
    try {
      const res = await fetch(`/api/royalties/${invoiceId}/pay`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'royalties.pay');
      return res.json();
    } catch {
      console.warn('[royalties.payRoyalty] API not available, using fallback');
      return { academy_id: "", academy_name: "", period: "", gross_revenue: 0, royalty_rate: 0, royalty_amount: 0, adjustments: 0, net_amount: 0 } as unknown as RoyaltyCalculation;
    }
  } catch (error) { handleServiceError(error, 'royalties.pay'); }
}
