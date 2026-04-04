import type { NetworkDashboardDTO, ComparisonDTO, ConsolidatedFinancials } from '@/lib/api/network.service';

const delay = () => new Promise((r) => setTimeout(r, 500));

export async function mockGetNetworkDashboard(_ownerId: string): Promise<NetworkDashboardDTO> {
  await delay();
  return {
    totalAcademies: 3,
    totalStudents: 312,
    totalRevenue: 48750,
    avgAttendance: 78,
    academies: [
      { id: 'ac-1', name: 'BlackBelt Centro', slug: 'blackbelt-centro', city: 'São Paulo', totalStudents: 150, activeStudents: 142, monthlyRevenue: 22500, attendanceRate: 82 },
      { id: 'ac-2', name: 'BlackBelt Norte', slug: 'blackbelt-norte', city: 'São Paulo', totalStudents: 98, activeStudents: 88, monthlyRevenue: 14700, attendanceRate: 75 },
      { id: 'ac-3', name: 'BlackBelt Campinas', slug: 'blackbelt-campinas', city: 'Campinas', totalStudents: 64, activeStudents: 60, monthlyRevenue: 11550, attendanceRate: 79 },
    ],
  };
}

export async function mockGetAcademyComparison(_academyIds: string[], metric: string): Promise<ComparisonDTO> {
  await delay();
  return {
    metric,
    academies: [
      { id: 'ac-1', name: 'BlackBelt Centro', value: metric === 'students' ? 150 : metric === 'revenue' ? 22500 : 82 },
      { id: 'ac-2', name: 'BlackBelt Norte', value: metric === 'students' ? 98 : metric === 'revenue' ? 14700 : 75 },
      { id: 'ac-3', name: 'BlackBelt Campinas', value: metric === 'students' ? 64 : metric === 'revenue' ? 11550 : 79 },
    ],
  };
}

export async function mockGetNetworkFinancials(_ownerId: string): Promise<ConsolidatedFinancials> {
  await delay();
  return {
    totalMRR: 48750,
    totalOverdue: 3200,
    byAcademy: [
      { id: 'ac-1', name: 'BlackBelt Centro', mrr: 22500, overdue: 1200, churn: 3.2 },
      { id: 'ac-2', name: 'BlackBelt Norte', mrr: 14700, overdue: 1500, churn: 5.1 },
      { id: 'ac-3', name: 'BlackBelt Campinas', mrr: 11550, overdue: 500, churn: 2.8 },
    ],
  };
}

export async function mockTransferStudent(_studentId: string, _fromAcademy: string, _toAcademy: string): Promise<void> {
  await delay();
}
