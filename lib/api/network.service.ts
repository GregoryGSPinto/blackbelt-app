import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface NetworkAcademy {
  id: string;
  name: string;
  slug: string;
  city: string;
  totalStudents: number;
  activeStudents: number;
  monthlyRevenue: number;
  attendanceRate: number;
}

export interface NetworkDashboardDTO {
  totalAcademies: number;
  totalStudents: number;
  totalRevenue: number;
  avgAttendance: number;
  academies: NetworkAcademy[];
}

export interface ComparisonDTO {
  metric: string;
  academies: { id: string; name: string; value: number }[];
}

export interface ConsolidatedFinancials {
  totalMRR: number;
  totalOverdue: number;
  byAcademy: { id: string; name: string; mrr: number; overdue: number; churn: number }[];
}

export async function getNetworkDashboard(ownerId: string): Promise<NetworkDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkDashboard(ownerId);
    }
    try {
      const res = await fetch(`/api/network/dashboard?ownerId=${ownerId}`);
      return res.json();
    } catch {
      console.warn('[network.getNetworkDashboard] API not available, using mock fallback');
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkDashboard(ownerId);
    }
  } catch (error) { handleServiceError(error, 'network.dashboard'); }
}

export async function getAcademyComparison(academyIds: string[], metric: string): Promise<ComparisonDTO> {
  try {
    if (isMock()) {
      const { mockGetAcademyComparison } = await import('@/lib/mocks/network.mock');
      return mockGetAcademyComparison(academyIds, metric);
    }
    try {
      const res = await fetch('/api/network/comparison', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyIds, metric }) });
      return res.json();
    } catch {
      console.warn('[network.getAcademyComparison] API not available, using mock fallback');
      const { mockGetAcademyComparison } = await import('@/lib/mocks/network.mock');
      return mockGetAcademyComparison(academyIds, metric);
    }
  } catch (error) { handleServiceError(error, 'network.comparison'); }
}

export async function getNetworkFinancials(ownerId: string): Promise<ConsolidatedFinancials> {
  try {
    if (isMock()) {
      const { mockGetNetworkFinancials } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkFinancials(ownerId);
    }
    try {
      const res = await fetch(`/api/network/financials?ownerId=${ownerId}`);
      return res.json();
    } catch {
      console.warn('[network.getNetworkFinancials] API not available, using mock fallback');
      const { mockGetNetworkFinancials } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkFinancials(ownerId);
    }
  } catch (error) { handleServiceError(error, 'network.financials'); }
}

export async function transferStudent(studentId: string, fromAcademy: string, toAcademy: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockTransferStudent } = await import('@/lib/mocks/network.mock');
      return mockTransferStudent(studentId, fromAcademy, toAcademy);
    }
    try {
      await fetch('/api/network/transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, fromAcademy, toAcademy }) });
    } catch {
      console.warn('[network.transferStudent] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'network.transfer'); }
}
