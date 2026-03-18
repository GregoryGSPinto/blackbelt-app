import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

export async function getPipelineMetrics(): Promise<PipelineMetrics> {
  try {
    if (isMock()) {
      const { mockGetPipelineMetrics } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockGetPipelineMetrics();
    }
    // API not yet implemented — use mock
    const { mockGetPipelineMetrics } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockGetPipelineMetrics();
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.getMetrics'); }
}

export async function listLeads(status?: LeadStatus): Promise<LeadAcademia[]> {
  try {
    if (isMock()) {
      const { mockListLeads } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockListLeads(status);
    }
    // API not yet implemented — use mock
    const { mockListLeads } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockListLeads(status);
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.listLeads'); }
}

export async function createLead(data: CreateLeadPayload): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockCreateLead(data);
    }
    try {
      const res = await fetch('/api/superadmin/pipeline/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-pipeline.createLead] API not available, using mock fallback');
      const { mockCreateLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockCreateLead(data);
    }
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.createLead'); }
}

export async function avancarLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockAvancarLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAvancarLead(leadId);
    }
    // API not yet implemented — use mock
    const { mockAvancarLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAvancarLead(leadId);
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.avancarLead'); }
}

export async function perderLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockPerderLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockPerderLead(leadId);
    }
    // API not yet implemented — use mock
    const { mockPerderLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockPerderLead(leadId);
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.perderLead'); }
}

export async function addLeadNota(leadId: string, nota: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockAddLeadNota } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAddLeadNota(leadId, nota);
    }
    try {
      const res = await fetch(`/api/superadmin/pipeline/leads/${leadId}/notas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nota }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[superadmin-pipeline.addLeadNota] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.addNota'); }
}
