import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type LeadStatus = 'novo' | 'contatado' | 'agendado' | 'compareceu' | 'matriculou' | 'desistiu';

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  source: string;
  referralCode?: string;
  status: LeadStatus;
  createdAt: string;
}

export async function listLeads(academyId: string): Promise<LeadDTO[]> {
  try {
    if (isMock()) {
      const { mockListLeads } = await import('@/lib/mocks/leads.mock');
      return mockListLeads(academyId);
    }
    try {
      const res = await fetch(`/api/leads?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'leads.list');
      return res.json();
    } catch {
      console.warn('[leads.listLeads] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'leads.list'); }
}

export async function createLead(data: Omit<LeadDTO, 'id' | 'status' | 'createdAt'>): Promise<LeadDTO> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/leads.mock');
      return mockCreateLead(data);
    }
    try {
      const res = await fetch(`/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new ServiceError(res.status, 'leads.create');
      return res.json();
    } catch {
      console.warn('[leads.createLead] API not available, using fallback');
      return {} as LeadDTO;
    }
  } catch (error) { handleServiceError(error, 'leads.create'); }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateLeadStatus } = await import('@/lib/mocks/leads.mock');
      return mockUpdateLeadStatus(leadId, status);
    }
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new ServiceError(res.status, 'leads.updateStatus');
    } catch {
      console.warn('[leads.updateLeadStatus] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'leads.updateStatus'); }
}
