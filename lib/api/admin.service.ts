import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface AdminDashboardDTO {
  totalAlunos: number;
  alunosAtivos: number;
  novosEsteMes: number;
  totalTurmas: number;
  turmasHoje: number;
  receitaMensal: number;
  inadimplencia: number;
  presencaMedia: number;
  ultimosCheckins: RecentCheckin[];
  proximasAulas: UpcomingClass[];
  alertas: DashboardAlert[];
}

export interface RecentCheckin {
  student_name: string;
  class_name: string;
  time: string;
}

export interface UpcomingClass {
  class_name: string;
  professor_name: string;
  time: string;
  enrolled: number;
}

export interface DashboardAlert {
  type: 'payment' | 'capacity' | 'system';
  message: string;
  severity: 'warning' | 'error' | 'info';
}

export interface AdminMetrics {
  presencaPorDia: { date: string; count: number }[];
  receitaPorMes: { month: string; receita: number; inadimplencia: number }[];
  alunosPorFaixa: { belt: string; count: number }[];
  turmasLotacao: { name: string; percent: number }[];
}

export async function getAdminDashboard(academyId: string): Promise<AdminDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetAdminDashboard } = await import('@/lib/mocks/admin.mock');
      return mockGetAdminDashboard(academyId);
    }
    const res = await fetch(`/api/admin/dashboard?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'admin.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'admin.dashboard');
  }
}

export async function getAdminMetrics(academyId: string, period: string = '30d'): Promise<AdminMetrics> {
  try {
    if (isMock()) {
      const { mockGetAdminMetrics } = await import('@/lib/mocks/admin.mock');
      return mockGetAdminMetrics(academyId, period);
    }
    const res = await fetch(`/api/admin/metrics?academyId=${academyId}&period=${period}`);
    if (!res.ok) throw new ServiceError(res.status, 'admin.metrics');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'admin.metrics');
  }
}
