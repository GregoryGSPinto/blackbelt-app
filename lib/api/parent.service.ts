import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

export interface ParentDashboardDTO {
  filhos: FilhoResumoDTO[];
  notificacoes: NotificacaoParentDTO[];
}

export interface FilhoResumoDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  idade: number;
  presenca_mes: { total: number; presentes: number };
  ultima_aula: string | null;
  proxima_aula: string | null;
  pagamento_status: 'em_dia' | 'pendente' | 'atrasado';
}

export interface NotificacaoParentDTO {
  id: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
}

export async function getParentDashboard(parentId: string): Promise<ParentDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetParentDashboard } = await import('@/lib/mocks/parent.mock');
      return mockGetParentDashboard(parentId);
    }
    try {
      const res = await fetch(`/api/parent/dashboard?parentId=${parentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'parent.dashboard');
      return res.json();
    } catch {
      console.warn('[parent.getParentDashboard] API not available, using mock fallback');
      const { mockGetParentDashboard } = await import('@/lib/mocks/parent.mock');
      return mockGetParentDashboard(parentId);
    }
  } catch (error) {
    handleServiceError(error, 'parent.dashboard');
  }
}
