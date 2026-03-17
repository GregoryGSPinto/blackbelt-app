import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/contratos-v2/templates?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.listTemplates');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.listTemplates'); }
}

export async function getContratoTemplate(id: string): Promise<ContratoTemplate> {
  try {
    if (isMock()) {
      const { mockGetContratoTemplate } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGetContratoTemplate(id);
    }
    const res = await fetch(`/api/contratos-v2/templates/${id}`);
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.getTemplate');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.getTemplate'); }
}

export async function createContratoTemplate(data: Omit<ContratoTemplate, 'id' | 'criadoEm'>): Promise<ContratoTemplate> {
  try {
    if (isMock()) {
      const { mockCreateContratoTemplate } = await import('@/lib/mocks/contratos-v2.mock');
      return mockCreateContratoTemplate(data);
    }
    const res = await fetch(`/api/contratos-v2/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.createTemplate');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.createTemplate'); }
}

export async function gerarContrato(templateId: string, alunoId: string, dados: Record<string, string>): Promise<Contrato> {
  try {
    if (isMock()) {
      const { mockGerarContrato } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGerarContrato(templateId, alunoId, dados);
    }
    const res = await fetch(`/api/contratos-v2`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId, alunoId, dados }) });
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.gerar');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.gerar'); }
}

export async function enviarParaAssinatura(contratoId: string, metodo: 'email' | 'whatsapp'): Promise<void> {
  try {
    if (isMock()) {
      const { mockEnviarParaAssinatura } = await import('@/lib/mocks/contratos-v2.mock');
      return mockEnviarParaAssinatura(contratoId, metodo);
    }
    const res = await fetch(`/api/contratos-v2/${contratoId}/enviar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metodo }) });
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.enviar');
  } catch (error) { handleServiceError(error, 'contratos-v2.enviar'); }
}

export async function assinarContrato(contratoId: string, assinatura: string): Promise<Contrato> {
  try {
    if (isMock()) {
      const { mockAssinarContrato } = await import('@/lib/mocks/contratos-v2.mock');
      return mockAssinarContrato(contratoId, assinatura);
    }
    const res = await fetch(`/api/contratos-v2/${contratoId}/assinar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assinatura }) });
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.assinar');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.assinar'); }
}

export async function listContratos(academyId: string, filters?: { status?: StatusContrato }): Promise<Contrato[]> {
  try {
    if (isMock()) {
      const { mockListContratos } = await import('@/lib/mocks/contratos-v2.mock');
      return mockListContratos(academyId, filters);
    }
    const params = new URLSearchParams({ academyId });
    if (filters?.status) params.set('status', filters.status);
    const res = await fetch(`/api/contratos-v2?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.list'); }
}

export async function getContratosMetrics(academyId: string): Promise<ContratosMetrics> {
  try {
    if (isMock()) {
      const { mockGetContratosMetrics } = await import('@/lib/mocks/contratos-v2.mock');
      return mockGetContratosMetrics(academyId);
    }
    const res = await fetch(`/api/contratos-v2/metrics?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'contratos-v2.metrics');
    return res.json();
  } catch (error) { handleServiceError(error, 'contratos-v2.metrics'); }
}
