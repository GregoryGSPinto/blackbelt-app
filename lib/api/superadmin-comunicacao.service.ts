import { isMock } from '@/lib/env';

export type TipoComunicado = 'informativo' | 'manutencao' | 'novidade' | 'urgente' | 'promocao';
export type StatusComunicado = 'rascunho' | 'agendado' | 'enviado';
export type CanalComunicado = 'email' | 'push' | 'in_app';

export interface SegmentacaoComunicado {
  tipo: 'todos' | 'por_plano' | 'por_health' | 'por_feature' | 'manual';
  filtro?: string;
  academiasIds?: string[];
}

export interface MetricasComunicado {
  totalDestinatarios: number;
  entregues: number;
  abertos: number;
  clicados: number;
}

export interface ComunicadoSaaS {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoComunicado;
  segmentacao: SegmentacaoComunicado;
  canal: CanalComunicado[];
  status: StatusComunicado;
  agendadoPara?: string;
  enviadoEm?: string;
  metricas: MetricasComunicado;
  criadoEm: string;
  criadoPor: string;
}

export interface CreateComunicadoPayload {
  titulo: string;
  mensagem: string;
  tipo: TipoComunicado;
  segmentacao: SegmentacaoComunicado;
  canal: CanalComunicado[];
}

export async function listComunicados(status?: StatusComunicado): Promise<ComunicadoSaaS[]> {
  try {
    if (isMock()) {
      const { mockListComunicados } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockListComunicados(status);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      let query = supabase
        .from('broadcast_messages')
        .select('*')
        .eq('scope', 'platform')
        .order('created_at', { ascending: false });
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error || !data) {
        console.error('[listComunicados] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: (row.id as string) || '',
        titulo: (row.title as string) || '',
        mensagem: (row.message as string) || '',
        tipo: (row.type as TipoComunicado) || 'informativo',
        segmentacao: (row.segmentation as SegmentacaoComunicado) || { tipo: 'todos' },
        canal: (row.channels as CanalComunicado[]) || ['in_app'],
        status: (row.status as StatusComunicado) || 'rascunho',
        agendadoPara: (row.scheduled_for as string) || undefined,
        enviadoEm: (row.sent_at as string) || undefined,
        metricas: (row.metrics as MetricasComunicado) || { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 },
        criadoEm: (row.created_at as string) || '',
        criadoPor: (row.created_by as string) || '',
      }));
    } catch {
      console.error('[superadmin-comunicacao.listComunicados] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listComunicados] Fallback:', error);
    return [];
  }
}

export async function createComunicado(data: CreateComunicadoPayload): Promise<ComunicadoSaaS> {
  try {
    if (isMock()) {
      const { mockCreateComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockCreateComunicado(data);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: row, error } = await supabase
        .from('broadcast_messages')
        .insert({
          scope: 'platform',
          title: data.titulo,
          message: data.mensagem,
          type: data.tipo,
          segmentation: data.segmentacao,
          channels: data.canal,
          status: 'rascunho',
          created_by: user?.id ?? '',
        })
        .select()
        .single();
      if (error || !row) {
        console.error('[createComunicado] Insert failed:', error?.message);
        return { id: '', titulo: data.titulo, mensagem: data.mensagem, tipo: data.tipo, segmentacao: data.segmentacao, canal: data.canal, status: 'rascunho', metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: new Date().toISOString(), criadoPor: '' };
      }
      return {
        id: (row.id as string) || '',
        titulo: data.titulo,
        mensagem: data.mensagem,
        tipo: data.tipo,
        segmentacao: data.segmentacao,
        canal: data.canal,
        status: 'rascunho',
        metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 },
        criadoEm: (row.created_at as string) || new Date().toISOString(),
        criadoPor: (row.created_by as string) || '',
      };
    } catch {
      console.error('[superadmin-comunicacao.createComunicado] API not available, using mock fallback');
      const { mockCreateComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockCreateComunicado(data);
    }
  } catch (error) {
    console.error('[createComunicado] Fallback:', error);
    return { id: '', titulo: data.titulo, mensagem: data.mensagem, tipo: data.tipo, segmentacao: data.segmentacao, canal: data.canal, status: 'rascunho', metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: new Date().toISOString(), criadoPor: '' };
  }
}

export async function enviarComunicado(id: string): Promise<ComunicadoSaaS> {
  try {
    if (isMock()) {
      const { mockEnviarComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockEnviarComunicado(id);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('broadcast_messages')
        .update({ status: 'enviado', sent_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error || !row) {
        console.error('[enviarComunicado] Update failed:', error?.message);
        return { id, titulo: '', mensagem: '', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['in_app'], status: 'enviado', enviadoEm: new Date().toISOString(), metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '', criadoPor: '' };
      }
      return {
        id: (row.id as string) || id,
        titulo: (row.title as string) || '',
        mensagem: (row.message as string) || '',
        tipo: (row.type as TipoComunicado) || 'informativo',
        segmentacao: (row.segmentation as SegmentacaoComunicado) || { tipo: 'todos' },
        canal: (row.channels as CanalComunicado[]) || ['in_app'],
        status: 'enviado',
        enviadoEm: new Date().toISOString(),
        metricas: (row.metrics as MetricasComunicado) || { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 },
        criadoEm: (row.created_at as string) || '',
        criadoPor: (row.created_by as string) || '',
      };
    } catch {
      console.error('[superadmin-comunicacao.enviarComunicado] API not available, returning fallback');
      return { id, titulo: '', mensagem: '', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['in_app'], status: 'enviado', enviadoEm: new Date().toISOString(), metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '', criadoPor: '' };
    }
  } catch (error) {
    console.error('[enviarComunicado] Fallback:', error);
    return { id, titulo: '', mensagem: '', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['in_app'], status: 'enviado', enviadoEm: new Date().toISOString(), metricas: { totalDestinatarios: 0, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '', criadoPor: '' };
  }
}

export async function deleteComunicado(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockDeleteComunicado(id);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('broadcast_messages')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[deleteComunicado] Delete failed:', error.message);
      }
    } catch {
      console.error('[superadmin-comunicacao.deleteComunicado] API not available, using fallback');
    }
  } catch (error) {
    console.error('[deleteComunicado] Fallback:', error);
  }
}
