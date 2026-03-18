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
    try {
      const res = await fetch('/api/superadmin/pipeline/metrics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-pipeline.getPipelineMetrics] API not available, using fallback');
      return { funil: [], taxaConversaoGeral: 0, tempoMedioConversao: 0, valorPipelineTotal: 0, melhorOrigem: '', leadsEsteMes: 0, conversaoEsteMes: 0 } as PipelineMetrics;
    }
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.getMetrics'); }
}

export async function listLeads(status?: LeadStatus): Promise<LeadAcademia[]> {
  try {
    if (isMock()) {
      const { mockListLeads } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockListLeads(status);
    }
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/superadmin/pipeline/leads${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-pipeline.listLeads] API not available, using fallback');
      return [];
    }
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
      console.warn('[superadmin-pipeline.createLead] API not available, using fallback');
      return { id: '', nomeAcademia: '', contatoNome: '', contatoEmail: '', contatoTelefone: '', cidade: '', estado: '', modalidades: [], quantidadeAlunos: 0, origem: 'site', status: 'lead', planoInteresse: '', valorEstimado: 0, observacoes: '', responsavel: '', historico: [], criadoEm: '', atualizadoEm: '' } as LeadAcademia;
    }
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.createLead'); }
}

export async function avancarLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockAvancarLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockAvancarLead(leadId);
    }
    try {
      const res = await fetch(`/api/superadmin/pipeline/leads/${leadId}/avancar`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-pipeline.avancarLead] API not available, using fallback');
      return { id: '', nomeAcademia: '', contatoNome: '', contatoEmail: '', contatoTelefone: '', cidade: '', estado: '', modalidades: [], quantidadeAlunos: 0, origem: 'site', status: 'lead', planoInteresse: '', valorEstimado: 0, observacoes: '', responsavel: '', historico: [], criadoEm: '', atualizadoEm: '' } as LeadAcademia;
    }
  } catch (error) { handleServiceError(error, 'superadmin-pipeline.avancarLead'); }
}

export async function perderLead(leadId: string): Promise<LeadAcademia> {
  try {
    if (isMock()) {
      const { mockPerderLead } = await import('@/lib/mocks/superadmin-pipeline.mock');
      return mockPerderLead(leadId);
    }
    try {
      const res = await fetch(`/api/superadmin/pipeline/leads/${leadId}/perder`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-pipeline.perderLead] API not available, using fallback');
      return { id: '', nomeAcademia: '', contatoNome: '', contatoEmail: '', contatoTelefone: '', cidade: '', estado: '', modalidades: [], quantidadeAlunos: 0, origem: 'site', status: 'lead', planoInteresse: '', valorEstimado: 0, observacoes: '', responsavel: '', historico: [], criadoEm: '', atualizadoEm: '' } as LeadAcademia;
    }
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
