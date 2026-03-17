import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type AcademyStatus = 'ativa' | 'inadimplente' | 'suspensa' | 'em_setup';

export interface FranchiseAcademy {
  id: string;
  name: string;
  city: string;
  students: number;
  revenue: number;
  attendance_rate: number;
  nps: number;
  status: AcademyStatus;
}

export interface NetworkKPIs {
  total_academies: number;
  total_students: number;
  total_revenue: number;
  total_royalties: number;
  avg_nps: number;
  avg_attendance: number;
}

export interface NetworkAlert {
  id: string;
  type: 'high_churn' | 'overdue' | 'attendance_drop' | 'low_nps';
  academy_id: string;
  academy_name: string;
  message: string;
  severity: 'warning' | 'critical';
  created_at: string;
}

export interface MonthlyRevenueByAcademy {
  month: string;
  academies: { academy_id: string; academy_name: string; revenue: number }[];
  total: number;
}

export interface NetworkFinancials {
  monthly_data: MonthlyRevenueByAcademy[];
  total_revenue: number;
  total_royalties: number;
  growth_pct: number;
}

export interface NetworkDashboard {
  kpis: NetworkKPIs;
  academies: FranchiseAcademy[];
  alerts: NetworkAlert[];
  financials: NetworkFinancials;
}

export interface NetworkMessage {
  subject: string;
  body: string;
  recipients: string[];
  channel: 'email' | 'push' | 'sms';
}

// --- Service Functions ---

export async function getNetworkDashboard(franchiseId: string): Promise<NetworkDashboard> {
  try {
    if (isMock()) {
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/franchise.mock');
      return mockGetNetworkDashboard(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/dashboard`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.dashboard');
      return res.json();
    } catch {
      console.warn('[franchise.getNetworkDashboard] API not available, using fallback');
      return {} as NetworkDashboard;
    }
  } catch (error) { handleServiceError(error, 'franchise.dashboard'); }
}

export async function getAcademies(franchiseId: string): Promise<FranchiseAcademy[]> {
  try {
    if (isMock()) {
      const { mockGetAcademies } = await import('@/lib/mocks/franchise.mock');
      return mockGetAcademies(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/academies`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.academies');
      return res.json();
    } catch {
      console.warn('[franchise.getAcademies] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'franchise.academies'); }
}

export async function getFinancials(franchiseId: string): Promise<NetworkFinancials> {
  try {
    if (isMock()) {
      const { mockGetFinancials } = await import('@/lib/mocks/franchise.mock');
      return mockGetFinancials(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/financials`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.financials');
      return res.json();
    } catch {
      console.warn('[franchise.getFinancials] API not available, using fallback');
      return {} as NetworkFinancials;
    }
  } catch (error) { handleServiceError(error, 'franchise.financials'); }
}

export async function sendNetworkMessage(franchiseId: string, message: NetworkMessage): Promise<{ sent: number }> {
  try {
    if (isMock()) {
      const { mockSendNetworkMessage } = await import('@/lib/mocks/franchise.mock');
      return mockSendNetworkMessage(franchiseId, message);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.message');
      return res.json();
    } catch {
      console.warn('[franchise.sendNetworkMessage] API not available, using fallback');
      return {} as { sent: number };
    }
  } catch (error) { handleServiceError(error, 'franchise.message'); }
}
