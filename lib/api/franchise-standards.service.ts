import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/standards`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.standards.list');
      return res.json();
    } catch {
      console.warn('[franchise-standards.getStandards] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'franchise.standards.list'); }
}

export async function createStandard(data: CreateStandardData): Promise<Standard> {
  try {
    if (isMock()) {
      const { mockCreateStandard } = await import('@/lib/mocks/franchise-standards.mock');
      return mockCreateStandard(data);
    }
    try {
      const res = await fetch(`/api/franchise/${data.franchise_id}/standards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.standards.create');
      return res.json();
    } catch {
      console.warn('[franchise-standards.createStandard] API not available, using fallback');
      return {} as Standard;
    }
  } catch (error) { handleServiceError(error, 'franchise.standards.create'); }
}

export async function checkCompliance(academyId: string): Promise<ComplianceReport> {
  try {
    if (isMock()) {
      const { mockCheckCompliance } = await import('@/lib/mocks/franchise-standards.mock');
      return mockCheckCompliance(academyId);
    }
    try {
      const res = await fetch(`/api/franchise/compliance/${academyId}`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.compliance.check');
      return res.json();
    } catch {
      console.warn('[franchise-standards.checkCompliance] API not available, using fallback');
      return {} as ComplianceReport;
    }
  } catch (error) { handleServiceError(error, 'franchise.compliance.check'); }
}

export async function getComplianceHistory(academyId: string): Promise<ComplianceHistoryEntry[]> {
  try {
    if (isMock()) {
      const { mockGetComplianceHistory } = await import('@/lib/mocks/franchise-standards.mock');
      return mockGetComplianceHistory(academyId);
    }
    try {
      const res = await fetch(`/api/franchise/compliance/${academyId}/history`);
      if (!res.ok) throw new ServiceError(res.status, 'franchise.compliance.history');
      return res.json();
    } catch {
      console.warn('[franchise-standards.getComplianceHistory] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'franchise.compliance.history'); }
}
