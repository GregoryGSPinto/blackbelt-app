import { isMock } from '@/lib/env';

export interface PipelineStage {
  nome: string;
  quantidade: number;
  valor: number;
}

export type LeadOrigem = 'site' | 'indicacao' | 'instagram' | 'google_ads' | 'evento' | 'cold_call';
export type LeadStatus = 'lead' | 'contato' | 'demo_agendada' | 'demo_realizada' | 'trial' | 'ativo' | 'perdido';

export interface LeadHistorico {
  data: string;
  acao: string;
  detalhe: string;
}

export interface LeadAcademia {
  id: string;
  nomeAcademia: string;
  contatoNome: string;
  contatoEmail: string;
  contatoTelefone: string;
  cidade: string;
  estado: string;
  modalidades: string[];
  quantidadeAlunos: number;
  origem: LeadOrigem;
  status: LeadStatus;
  planoInteresse: string;
  valorEstimado: number;
  observacoes: string;
  proximoContato?: string;
  responsavel: string;
  historico: LeadHistorico[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface PipelineMetrics {
  funil: PipelineStage[];
  taxaConversaoGeral: number;
  tempoMedioConversao: number;
  valorPipelineTotal: number;
  melhorOrigem: string;
  leadsEsteMes: number;
  conversaoEsteMes: number;
}

export interface CreateLeadPayload {
  nomeAcademia: string;
  contatoNome: string;
  contatoEmail: string;
  contatoTelefone: string;
  cidade: string;
  estado: string;
  modalidades: string[];
  quantidadeAlunos: number;
  origem: LeadOrigem;
  planoInteresse: string;
  valorEstimado: number;
  observacoes: string;
}

const emptyMetrics: PipelineMetrics = { funil: [], taxaConversaoGeral: 0, tempoMedioConversao: 0, valorPipelineTotal: 0, melhorOrigem: '', leadsEsteMes: 0, conversaoEsteMes: 0 };

function emptyLead(id: string = ''): LeadAcademia {
  return { id, nomeAcademia: '', contatoNome: '', contatoEmail: '', contatoTelefone: '', cidade: '', estado: '', modalidades: [], quantidadeAlunos: 0, origem: 'site', status: 'lead', planoInteresse: '', valorEstimado: 0, observacoes: '', responsavel: '', historico: [], criadoEm: '', atualizadoEm: '' };
}

export async function getPipelineMetrics(): Promise<PipelineMetrics> {
  try {
    if (isMock()) {
      const { mockGetPipelineMetrics } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockGetPipelineMetrics();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('prospects')
        .select('status');
      if (error || !data) {
        console.error('[getPipelineMetrics] Query failed:', error?.message);
        return emptyMetrics;
      }
      const counts: Record<string, number> = {};
      for (const row of data) {
        const s = (row.status as string) || 'unknown';
        counts[s] = (counts[s] || 0) + 1;
      }
      const funil = Object.entries(counts).map(([nome, quantidade]) => ({ nome, quantidade, valor: 0 }));
      return { ...emptyMetrics, funil, leadsEsteMes: data.length };
    } catch {
      console.error('[superadmin-pipeline.getPipelineMetrics] API not available, returning empty');
      return emptyMetrics;
    }
  } catch (error) {
    console.error('[getPipelineMetrics] Fallback:', error);
    return emptyMetrics;
  }
}

export async function listLeads(status?: LeadStatus): Promise<LeadAcademia[]> {
  try {
    if (isMock()) {
      const { mockListLeads } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockListLeads(status);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      let query = supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error || !data) {
        console.error('[listLeads] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: (row.id as string) || '',
        nomeAcademia: (row.business_name as string) || (row.name as string) || '',
        contatoNome: (row.contact_name as string) || '',
        contatoEmail: (row.email as string) || '',
        contatoTelefone: (row.phone as string) || '',
        cidade: (row.city as string) || '',
        estado: (row.state as string) || '',
        modalidades: (row.modalities as string[]) || [],
        quantidadeAlunos: (row.student_count as number) || 0,
        origem: (row.source as LeadOrigem) || 'site',
        status: (row.status as LeadStatus) || 'lead',
        planoInteresse: (row.plan_interest as string) || '',
        valorEstimado: (row.estimated_value as number) || 0,
        observacoes: (row.notes as string) || '',
        responsavel: (row.assigned_to as string) || '',
        historico: (row.history as LeadHistorico[]) || [],
        criadoEm: (row.created_at as string) || '',
        atualizadoEm: (row.updated_at as string) || '',
      }));
    } catch {
      console.error('[superadmin-pipeline.listLeads] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listLeads] Fallback:', error);
    return [];
  }
}

export async function createLead(data: CreateLeadPayload): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockCreateLead(data);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('prospects')
        .insert({
          business_name: data.nomeAcademia,
          contact_name: data.contatoNome,
          email: data.contatoEmail,
          phone: data.contatoTelefone,
          city: data.cidade,
          state: data.estado,
          modalities: data.modalidades,
          student_count: data.quantidadeAlunos,
          source: data.origem,
          status: 'lead',
          plan_interest: data.planoInteresse,
          estimated_value: data.valorEstimado,
          notes: data.observacoes,
        })
        .select()
        .single();
      if (error || !row) {
        console.error('[createLead] Insert failed:', error?.message);
        return emptyLead();
      }
      return { ...emptyLead((row.id as string) || ''), nomeAcademia: data.nomeAcademia, contatoNome: data.contatoNome, contatoEmail: data.contatoEmail, criadoEm: (row.created_at as string) || '' };
    } catch {
      console.error('[superadmin-pipeline.createLead] API not available, using mock fallback');
      const { mockCreateLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockCreateLead(data);
    }
  } catch (error) {
    console.error('[createLead] Fallback:', error);
    return emptyLead();
  }
}

export async function avancarLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockAvancarLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAvancarLead(leadId);
    }
    try {
      const statusOrder: LeadStatus[] = ['lead', 'contato', 'demo_agendada', 'demo_realizada', 'trial', 'ativo'];
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: current } = await supabase
        .from('prospects')
        .select('status')
        .eq('id', leadId)
        .single();
      const currentIdx = statusOrder.indexOf((current?.status as LeadStatus) || 'lead');
      const nextStatus = statusOrder[Math.min(currentIdx + 1, statusOrder.length - 1)];
      const { data: row, error } = await supabase
        .from('prospects')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();
      if (error || !row) {
        console.error('[avancarLead] Update failed:', error?.message);
        return emptyLead(leadId);
      }
      return { ...emptyLead(leadId), status: nextStatus };
    } catch {
      console.error('[superadmin-pipeline.avancarLead] API not available, returning fallback');
      return emptyLead(leadId);
    }
  } catch (error) {
    console.error('[avancarLead] Fallback:', error);
    return emptyLead(leadId);
  }
}

export async function perderLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockPerderLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockPerderLead(leadId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('prospects')
        .update({ status: 'perdido', updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();
      if (error || !row) {
        console.error('[perderLead] Update failed:', error?.message);
        return { ...emptyLead(leadId), status: 'perdido' };
      }
      return { ...emptyLead(leadId), status: 'perdido' };
    } catch {
      console.error('[superadmin-pipeline.perderLead] API not available, returning fallback');
      return { ...emptyLead(leadId), status: 'perdido' };
    }
  } catch (error) {
    console.error('[perderLead] Fallback:', error);
    return { ...emptyLead(leadId), status: 'perdido' };
  }
}

export async function addLeadNota(leadId: string, nota: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockAddLeadNota } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAddLeadNota(leadId, nota);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('prospects')
        .update({ notes: nota, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      if (error) {
        console.error('[addLeadNota] Update failed:', error.message);
      }
    } catch {
      console.error('[superadmin-pipeline.addLeadNota] API not available, using fallback');
    }
  } catch (error) {
    console.error('[addLeadNota] Fallback:', error);
  }
}
