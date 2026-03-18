import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    // API not yet implemented — use mock
    const { mockGetParentDashboard } = await import('@/lib/mocks/parent.mock');
      return mockGetParentDashboard(parentId);
  } catch (error) {
    handleServiceError(error, 'parent.dashboard');
  }
}
