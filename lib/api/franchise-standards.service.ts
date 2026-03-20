import { isMock } from '@/lib/env';

// --- DTOs ---

export type StandardCategory = 'visual' | 'operacional' | 'pedagogico' | 'financeiro' | 'qualidade';

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
}

export interface Standard {
  id: string;
  franchise_id: string;
  category: StandardCategory;
  name: string;
  description: string;
  required: boolean;
  checklist_items: ChecklistItem[];
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export type ComplianceStatus = 'conforme' | 'parcial' | 'nao_conforme' | 'pendente';

export interface ComplianceResult {
  standard_id: string;
  standard_name: string;
  category: StandardCategory;
  status: ComplianceStatus;
  completed_items: number;
  total_items: number;
  score: number;
  last_check: string;
}

export interface ComplianceReport {
  academy_id: string;
  academy_name: string;
  overall_score: number;
  results: ComplianceResult[];
  checked_at: string;
}

export interface ComplianceHistoryEntry {
  id: string;
  academy_id: string;
  overall_score: number;
  checked_at: string;
  checked_by: string;
}

export interface CreateStandardData {
  franchise_id: string;
  category: StandardCategory;
  name: string;
  description: string;
  required: boolean;
  checklist_items: string[];
  deadline: string | null;
}

// --- Service Functions ---

export async function getStandards(franchiseId: string): Promise<Standard[]> {
  try {
    if (isMock()) {
      const { mockGetStandards } = await import('@/lib/mocks/franchise-standards.mock');
      return mockGetStandards(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_standards')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('category', { ascending: true });

    if (error) {
      console.warn('[getStandards] error:', error.message);
      return [];
    }

    return (data ?? []) as unknown as Standard[];
  } catch (error) {
    console.warn('[getStandards] Fallback:', error);
    return [];
  }
}

export async function createStandard(data: CreateStandardData): Promise<Standard> {
  try {
    if (isMock()) {
      const { mockCreateStandard } = await import('@/lib/mocks/franchise-standards.mock');
      return mockCreateStandard(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const checklistItems: ChecklistItem[] = data.checklist_items.map((desc, i) => ({
      id: `item-${i}`,
      description: desc,
      completed: false,
    }));

    const { data: inserted, error } = await supabase
      .from('franchise_standards')
      .insert({
        franchise_id: data.franchise_id,
        category: data.category,
        name: data.name,
        description: data.description,
        required: data.required,
        checklist_items: checklistItems,
        deadline: data.deadline,
      })
      .select()
      .single();

    if (error) {
      console.warn('[createStandard] error:', error.message);
      return {} as Standard;
    }

    return inserted as unknown as Standard;
  } catch (error) {
    console.warn('[createStandard] Fallback:', error);
    return {} as Standard;
  }
}

export async function checkCompliance(academyId: string): Promise<ComplianceReport> {
  try {
    if (isMock()) {
      const { mockCheckCompliance } = await import('@/lib/mocks/franchise-standards.mock');
      return mockCheckCompliance(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_compliance_checks')
      .select('*')
      .eq('academy_id', academyId)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('[checkCompliance] error:', error.message);
      return { academy_id: academyId, academy_name: '', overall_score: 0, results: [], checked_at: '' };
    }

    return data as unknown as ComplianceReport;
  } catch (error) {
    console.warn('[checkCompliance] Fallback:', error);
    return { academy_id: academyId, academy_name: '', overall_score: 0, results: [], checked_at: '' };
  }
}

export async function getComplianceHistory(academyId: string): Promise<ComplianceHistoryEntry[]> {
  try {
    if (isMock()) {
      const { mockGetComplianceHistory } = await import('@/lib/mocks/franchise-standards.mock');
      return mockGetComplianceHistory(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_compliance_checks')
      .select('id, academy_id, overall_score, checked_at, checked_by')
      .eq('academy_id', academyId)
      .order('checked_at', { ascending: false });

    if (error) {
      console.warn('[getComplianceHistory] error:', error.message);
      return [];
    }

    return (data ?? []) as unknown as ComplianceHistoryEntry[];
  } catch (error) {
    console.warn('[getComplianceHistory] Fallback:', error);
    return [];
  }
}
