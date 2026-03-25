import { isMock } from '@/lib/env';

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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: inserted, error } = await supabase
      .from('franchise_leads')
      .insert({ ...data, stage: 'lead' as PipelineStage })
      .select()
      .single();

    if (error) {
      console.error('[createLead] error:', error.message);
      return {} as FranchiseLead;
    }

    return inserted as unknown as FranchiseLead;
  } catch (error) {
    console.error('[createLead] Fallback:', error);
    return {} as FranchiseLead;
  }
}

export async function getLeads(franchiseId: string): Promise<FranchiseLead[]> {
  try {
    if (isMock()) {
      const { mockGetLeads } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockGetLeads(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_leads')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getLeads] error:', error.message);
      return [];
    }

    return (data ?? []) as unknown as FranchiseLead[];
  } catch (error) {
    console.error('[getLeads] Fallback:', error);
    return [];
  }
}

export async function updateLeadStatus(leadId: string, stage: PipelineStage): Promise<FranchiseLead> {
  try {
    if (isMock()) {
      const { mockUpdateLeadStatus } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockUpdateLeadStatus(leadId, stage);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_leads')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('[updateLeadStatus] error:', error.message);
      return {} as FranchiseLead;
    }

    return data as unknown as FranchiseLead;
  } catch (error) {
    console.error('[updateLeadStatus] Fallback:', error);
    return {} as FranchiseLead;
  }
}

export async function analyzeViability(location: string): Promise<ViabilityAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeViability } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockAnalyzeViability(location);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('analyze_franchise_viability', { p_location: location });

    if (error) {
      console.error('[analyzeViability] error:', error.message);
      return {
        location,
        population: 0,
        competitors: 0,
        avg_income: 0,
        score: 0,
        recommendation: 'arriscado',
        factors: [],
      };
    }

    return (data as unknown as ViabilityAnalysis) ?? {
      location,
      population: 0,
      competitors: 0,
      avg_income: 0,
      score: 0,
      recommendation: 'arriscado',
      factors: [],
    };
  } catch (error) {
    console.error('[analyzeViability] Fallback:', error);
    return {
      location,
      population: 0,
      competitors: 0,
      avg_income: 0,
      score: 0,
      recommendation: 'arriscado',
      factors: [],
    };
  }
}

export async function setupFranchise(leadId: string): Promise<FranchiseLead> {
  try {
    if (isMock()) {
      const { mockSetupFranchise } = await import('@/lib/mocks/franchise-expansion.mock');
      return mockSetupFranchise(leadId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_leads')
      .update({ stage: 'setup' as PipelineStage, onboarding_step: 'setup' as OnboardingStep, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('[setupFranchise] error:', error.message);
      return {} as FranchiseLead;
    }

    return data as unknown as FranchiseLead;
  } catch (error) {
    console.error('[setupFranchise] Fallback:', error);
    return {} as FranchiseLead;
  }
}
