import { isMock } from '@/lib/env';

export type TrialOrigin = 'site' | 'indicacao' | 'instagram' | 'whatsapp' | 'presencial';
export type TrialStatus = 'agendada' | 'confirmada' | 'compareceu' | 'nao_compareceu' | 'matriculou' | 'desistiu';

export interface TrialClass {
  id: string;
  leadNome: string;
  leadEmail: string;
  leadTelefone: string;
  leadOrigem: TrialOrigin;
  turmaId: string;
  turmaNome: string;
  dataAgendada: string;
  status: TrialStatus;
  professorId: string;
  professorNome: string;
  observacoes?: string;
  followUpEnviado: boolean;
  createdAt: string;
}

export interface TrialMetrics {
  agendadas: number;
  confirmadas: number;
  compareceram: number;
  matricularam: number;
  taxaConversao: number;
}

export interface CreateTrialRequest {
  leadNome: string;
  leadEmail: string;
  leadTelefone: string;
  leadOrigem: TrialOrigin;
  turmaId: string;
  dataAgendada: string;
}

export interface TrialFilters {
  status?: TrialStatus;
  origem?: TrialOrigin;
}

export async function createTrialClass(academyId: string, data: CreateTrialRequest): Promise<TrialClass> {
  try {
    if (isMock()) {
      const { mockCreateTrialClass } = await import('@/lib/mocks/aula-experimental.mock');
      return mockCreateTrialClass(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('trial_classes')
      .insert({ academy_id: academyId, lead_nome: data.leadNome, lead_email: data.leadEmail, lead_telefone: data.leadTelefone, lead_origem: data.leadOrigem, turma_id: data.turmaId, data_agendada: data.dataAgendada, status: 'agendada' })
      .select()
      .single();
    if (error || !row) {
      console.error('[createTrialClass] Supabase error:', error?.message);
      return {} as TrialClass;
    }
    return row as unknown as TrialClass;
  } catch (error) {
    console.error('[createTrialClass] Fallback:', error);
    return {} as TrialClass;
  }
}

export async function listTrialClasses(academyId: string, filters?: TrialFilters): Promise<TrialClass[]> {
  try {
    if (isMock()) {
      const { mockListTrialClasses } = await import('@/lib/mocks/aula-experimental.mock');
      return mockListTrialClasses(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('trial_classes').select('*').eq('academy_id', academyId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.origem) query = query.eq('lead_origem', filters.origem);
    const { data, error } = await query;
    if (error || !data) {
      console.error('[listTrialClasses] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as TrialClass[];
  } catch (error) {
    console.error('[listTrialClasses] Fallback:', error);
    return [];
  }
}

export async function updateTrialStatus(id: string, status: TrialStatus): Promise<TrialClass> {
  try {
    if (isMock()) {
      const { mockUpdateTrialStatus } = await import('@/lib/mocks/aula-experimental.mock');
      return mockUpdateTrialStatus(id, status);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('trial_classes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) {
      console.error('[updateTrialStatus] Supabase error:', error?.message);
      return {} as TrialClass;
    }
    return data as unknown as TrialClass;
  } catch (error) {
    console.error('[updateTrialStatus] Fallback:', error);
    return {} as TrialClass;
  }
}

export async function getTrialMetrics(academyId: string): Promise<TrialMetrics> {
  const fallback: TrialMetrics = { agendadas: 0, confirmadas: 0, compareceram: 0, matricularam: 0, taxaConversao: 0 };
  try {
    if (isMock()) {
      const { mockGetTrialMetrics } = await import('@/lib/mocks/aula-experimental.mock');
      return mockGetTrialMetrics(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('trial_classes')
      .select('status')
      .eq('academy_id', academyId);
    if (error || !data) {
      console.error('[getTrialMetrics] Supabase error:', error?.message);
      return fallback;
    }
    const agendadas = data.length;
    const confirmadas = data.filter((r: { status: string }) => r.status === 'confirmada' || r.status === 'compareceu' || r.status === 'matriculou').length;
    const compareceram = data.filter((r: { status: string }) => r.status === 'compareceu' || r.status === 'matriculou').length;
    const matricularam = data.filter((r: { status: string }) => r.status === 'matriculou').length;
    return { agendadas, confirmadas, compareceram, matricularam, taxaConversao: agendadas > 0 ? matricularam / agendadas : 0 };
  } catch (error) {
    console.error('[getTrialMetrics] Fallback:', error);
    return fallback;
  }
}
