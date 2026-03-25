import { isMock } from '@/lib/env';

export type TipoContrato = 'matricula' | 'termo_responsabilidade' | 'codigo_conduta' | 'cancelamento';
export type StatusContrato = 'rascunho' | 'enviado' | 'visualizado' | 'assinado' | 'expirado';

export interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: TipoContrato;
  conteudoHTML: string;
  variaveis: string[];
  ativo: boolean;
  criadoEm: string;
}

export interface Contrato {
  id: string;
  templateId: string;
  templateNome: string;
  alunoId: string;
  alunoNome: string;
  status: StatusContrato;
  enviadoPor?: 'email' | 'whatsapp';
  assinadoEm?: string;
  assinaturaBase64?: string;
  conteudoFinal: string;
  criadoEm: string;
}

export interface ContratosMetrics {
  contratosAtivos: number;
  pendentesAssinatura: number;
  taxaAssinatura: number;
}

export async function listContratosTemplates(academyId: string): Promise<ContratoTemplate[]> {
  try {
    if (isMock()) {
      const { mockListContratosTemplates } = await import('@/lib/mocks/contratos-v2.mock');
      return mockListContratosTemplates(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contrato_templates')
      .select('*')
      .eq('academy_id', academyId);
    if (error || !data) {
      console.error('[listContratosTemplates] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as ContratoTemplate[];
  } catch (error) {
    console.error('[listContratosTemplates] Fallback:', error);
    return [];
  }
}

export async function getContratoTemplate(id: string): Promise<ContratoTemplate> {
  try {
    if (isMock()) {
      const { mockGetContratoTemplate } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGetContratoTemplate(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contrato_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getContratoTemplate] Supabase error:', error?.message);
      return {} as ContratoTemplate;
    }
    return data as unknown as ContratoTemplate;
  } catch (error) {
    console.error('[getContratoTemplate] Fallback:', error);
    return {} as ContratoTemplate;
  }
}

export async function createContratoTemplate(data: Omit<ContratoTemplate, 'id' | 'criadoEm'>): Promise<ContratoTemplate> {
  try {
    if (isMock()) {
      const { mockCreateContratoTemplate } = await import('@/lib/mocks/contratos-v2.mock');
      return mockCreateContratoTemplate(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('contrato_templates')
      .insert(data)
      .select()
      .single();
    if (error || !row) {
      console.error('[createContratoTemplate] Supabase error:', error?.message);
      return {} as ContratoTemplate;
    }
    return row as unknown as ContratoTemplate;
  } catch (error) {
    console.error('[createContratoTemplate] Fallback:', error);
    return {} as ContratoTemplate;
  }
}

export async function gerarContrato(templateId: string, alunoId: string, dados: Record<string, string>): Promise<Contrato> {
  try {
    if (isMock()) {
      const { mockGerarContrato } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGerarContrato(templateId, alunoId, dados);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contratos')
      .insert({ template_id: templateId, aluno_id: alunoId, dados, status: 'rascunho' })
      .select()
      .single();
    if (error || !data) {
      console.error('[gerarContrato] Supabase error:', error?.message);
      return {} as Contrato;
    }
    return data as unknown as Contrato;
  } catch (error) {
    console.error('[gerarContrato] Fallback:', error);
    return {} as Contrato;
  }
}

export async function enviarParaAssinatura(contratoId: string, metodo: 'email' | 'whatsapp'): Promise<void> {
  try {
    if (isMock()) {
      const { mockEnviarParaAssinatura } = await import('@/lib/mocks/contratos-v2.mock');
      return mockEnviarParaAssinatura(contratoId, metodo);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('contratos')
      .update({ status: 'enviado', enviado_por: metodo })
      .eq('id', contratoId);
    if (error) {
      console.error('[enviarParaAssinatura] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[enviarParaAssinatura] Fallback:', error);
  }
}

export async function assinarContrato(contratoId: string, assinatura: string): Promise<Contrato> {
  try {
    if (isMock()) {
      const { mockAssinarContrato } = await import('@/lib/mocks/contratos-v2.mock');
      return mockAssinarContrato(contratoId, assinatura);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contratos')
      .update({ status: 'assinado', assinatura_base64: assinatura, assinado_em: new Date().toISOString() })
      .eq('id', contratoId)
      .select()
      .single();
    if (error || !data) {
      console.error('[assinarContrato] Supabase error:', error?.message);
      return {} as Contrato;
    }
    return data as unknown as Contrato;
  } catch (error) {
    console.error('[assinarContrato] Fallback:', error);
    return {} as Contrato;
  }
}

export async function listContratos(academyId: string, filters?: { status?: StatusContrato }): Promise<Contrato[]> {
  try {
    if (isMock()) {
      const { mockListContratos } = await import('@/lib/mocks/contratos-v2.mock');
      return mockListContratos(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('contratos').select('*').eq('academy_id', academyId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error || !data) {
      console.error('[listContratos] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as Contrato[];
  } catch (error) {
    console.error('[listContratos] Fallback:', error);
    return [];
  }
}

export async function getContratosMetrics(academyId: string): Promise<ContratosMetrics> {
  const fallback: ContratosMetrics = { contratosAtivos: 0, pendentesAssinatura: 0, taxaAssinatura: 0 };
  try {
    if (isMock()) {
      const { mockGetContratosMetrics } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGetContratosMetrics(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contratos')
      .select('status')
      .eq('academy_id', academyId);
    if (error || !data) {
      console.error('[getContratosMetrics] Supabase error:', error?.message);
      return fallback;
    }
    const ativos = data.filter((c: { status: string }) => c.status === 'assinado').length;
    const pendentes = data.filter((c: { status: string }) => c.status === 'enviado' || c.status === 'visualizado').length;
    const total = data.length;
    return { contratosAtivos: ativos, pendentesAssinatura: pendentes, taxaAssinatura: total > 0 ? ativos / total : 0 };
  } catch (error) {
    console.error('[getContratosMetrics] Fallback:', error);
    return fallback;
  }
}
