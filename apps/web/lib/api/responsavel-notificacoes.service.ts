import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface NotificacaoResponsavel {
  id: string;
  type: 'presenca' | 'pagamento' | 'avaliacao' | 'evento' | 'mensagem' | 'alerta';
  title: string;
  body: string;
  student_name: string;
  read: boolean;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getNotificacoes(guardianId: string): Promise<NotificacaoResponsavel[]> {
  try {
    if (isMock()) {
      const { mockGetNotificacoes } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockGetNotificacoes(guardianId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('guardian_notifications')
      .select('*')
      .eq('guardian_id', guardianId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'responsavel-notificacoes');
      return [];
    }

    return data as unknown as NotificacaoResponsavel[];
  } catch (error) {
    logServiceError(error, 'responsavel-notificacoes');
    return [];
  }
}

export async function marcarLida(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLida } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockMarcarLida(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('guardian_notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      logServiceError(error, 'responsavel-notificacoes');
    }
  } catch (error) {
    logServiceError(error, 'responsavel-notificacoes');
  }
}

export async function marcarTodasLidas(guardianId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarTodasLidas } = await import('@/lib/mocks/responsavel-notificacoes.mock');
      return mockMarcarTodasLidas(guardianId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('guardian_notifications')
      .update({ read: true })
      .eq('guardian_id', guardianId)
      .eq('read', false);

    if (error) {
      logServiceError(error, 'responsavel-notificacoes');
    }
  } catch (error) {
    logServiceError(error, 'responsavel-notificacoes');
  }
}
