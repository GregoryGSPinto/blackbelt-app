import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type PipelineStage = 'lead' | 'analise' | 'aprovado' | 'setup' | 'operando';

export type OnboardingStep =
  | 'dados'
  | 'localizacao'
  | 'viabilidade'
  | 'contrato'
  | 'setup'
  | 'treinamento'
  | 'inauguracao';

export interface FranchiseLead {
  id: string;
  franchise_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  investment_capacity: number;
  experience: string;
  stage: PipelineStage;
  viability_score: number | null;
  onboarding_step: OnboardingStep | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ViabilityAnalysis {
  location: string;
  population: number;
  competitors: number;
  avg_income: number;
  score: number;
  recommendation: 'recomendado' | 'viavel' | 'arriscado' | 'nao_recomendado';
  factors: { name: string; score: number; weight: number }[];
}

export interface CreateLeadData {
  franchise_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  investment_capacity: number;
  experience: string;
  notes?: string;
}

// --- Service Functions ---

export async function createLead(data: CreateLeadData): Promise<FranchiseLead> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockCreateLead(data);
    }
    try {
      const res = await fetch(`/api/franchise/${data.franchise_id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.expansion.create');
      return res.json();
    } catch {
      console.warn('[franchise-expansion.createLead] API not available, using fallback');
      return { id: "", name: "", email: "", phone: "", city: "", state: "", status: "new", interest_level: "", notes: "", created_at: "" } as unknown as FranchiseLead;
    }
  } catch (error) { handleServiceError(error, 'franchise.expansion.create'); }
}

export async function getLeads(franchiseId: string): Promise<FranchiseLead[]> {
  try {
    if (isMock()) {
      const { mockGetLeads } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockGetLeads(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/leads`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.expansion.list');
      return res.json();
    } catch {
      console.warn('[franchise-expansion.getLeads] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'franchise.expansion.list'); }
}

export async function updateLeadStatus(leadId: string, stage: PipelineStage): Promise<FranchiseLead> {
  try {
    if (isMock()) {
      const { mockUpdateLeadStatus } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockUpdateLeadStatus(leadId, stage);
    }
    try {
      const res = await fetch(`/api/franchise/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.expansion.update');
      return res.json();
    } catch {
      console.warn('[franchise-expansion.updateLeadStatus] API not available, using fallback');
      return { id: "", name: "", email: "", phone: "", city: "", state: "", status: "new", interest_level: "", notes: "", created_at: "" } as unknown as FranchiseLead;
    }
  } catch (error) { handleServiceError(error, 'franchise.expansion.update'); }
}

export async function analyzeViability(location: string): Promise<ViabilityAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeViability } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockAnalyzeViability(location);
    }
    try {
      const res = await fetch(`/api/franchise/viability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.expansion.viability');
      return res.json();
    } catch {
      console.warn('[franchise-expansion.analyzeViability] API not available, using fallback');
      return { score: 0, population: 0, competition: 0, income_level: "", recommendation: "", factors: [] } as unknown as ViabilityAnalysis;
    }
  } catch (error) { handleServiceError(error, 'franchise.expansion.viability'); }
}

export async function setupFranchise(leadId: string): Promise<FranchiseLead> {
  try {
    if (isMock()) {
      const { mockSetupFranchise } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockSetupFranchise(leadId);
    }
    try {
      const res = await fetch(`/api/franchise/leads/${leadId}/setup`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.expansion.setup');
      return res.json();
    } catch {
      console.warn('[franchise-expansion.setupFranchise] API not available, using fallback');
      return { id: "", name: "", email: "", phone: "", city: "", state: "", status: "new", interest_level: "", notes: "", created_at: "" } as unknown as FranchiseLead;
    }
  } catch (error) { handleServiceError(error, 'franchise.expansion.setup'); }
}
