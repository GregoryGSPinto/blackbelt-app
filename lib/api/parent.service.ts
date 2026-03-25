import { isMock } from '@/lib/env';
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
  if (isMock()) {
    const { mockGetParentDashboard } = await import('@/lib/mocks/parent.mock');
    return mockGetParentDashboard(parentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Fetch children linked to this parent
  const { data: children, error: childrenError } = await supabase
    .from('guardian_students')
    .select('student_id, students!inner(id, display_name, avatar_url, belt, birth_date)')
    .eq('guardian_id', parentId);

  if (childrenError) {
    console.error('[getParentDashboard] error fetching children:', childrenError.message);
    return { filhos: [], notificacoes: [] };
  }

  const filhos: FilhoResumoDTO[] = (children ?? []).map((row: Record<string, unknown>) => {
    const student = row.students as Record<string, unknown> | null;
    const birthDate = student?.birth_date ? new Date(student.birth_date as string) : null;
    const age = birthDate
      ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    return {
      student_id: row.student_id as string,
      display_name: (student?.display_name as string) ?? '',
      avatar: (student?.avatar_url as string) ?? null,
      belt: (student?.belt as BeltLevel) ?? 'branca',
      idade: age,
      presenca_mes: { total: 0, presentes: 0 },
      ultima_aula: null,
      proxima_aula: null,
      pagamento_status: 'em_dia' as const,
    };
  });

  // Fetch notifications for this parent
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('id, message, type, created_at, read')
    .eq('profile_id', parentId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (notifError) {
    console.error('[getParentDashboard] error fetching notifications:', notifError.message);
  }

  const notificacoes: NotificacaoParentDTO[] = (notifications ?? []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    message: n.message as string,
    type: n.type as string,
    time: n.created_at as string,
    read: n.read as boolean,
  }));

  return { filhos, notificacoes };
}
