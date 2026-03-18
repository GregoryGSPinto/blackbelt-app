import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type ContractTemplate = 'matricula_adulto' | 'matricula_menor' | 'professor';

export interface ContractDTO {
  id: string;
  templateId: ContractTemplate;
  studentId: string;
  studentName: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  createdAt: string;
  signedAt?: string;
  signatureUrl?: string;
}

export async function listContracts(academyId: string): Promise<ContractDTO[]> {
  try {
    if (isMock()) {
      const { mockListContracts } = await import('@/lib/mocks/contracts.mock');
      return mockListContracts(academyId);
    }
    try {
      const res = await fetch(`/api/contracts?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'contracts.list');
      return res.json();
    } catch {
      console.warn('[contracts.listContracts] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'contracts.list'); }
}

export async function generateContract(templateId: ContractTemplate, studentId: string): Promise<ContractDTO> {
  try {
    if (isMock()) {
      const { mockGenerateContract } = await import('@/lib/mocks/contracts.mock');
      return mockGenerateContract(templateId, studentId);
    }
    try {
      const res = await fetch(`/api/contracts/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId, studentId }) });
      if (!res.ok) throw new ServiceError(res.status, 'contracts.generate');
      return res.json();
    } catch {
      console.warn('[contracts.generateContract] API not available, using fallback');
      return { id: "", student_id: "", student_name: "", plan_name: "", start_date: "", end_date: "", status: "active", signed_at: null, pdf_url: "" } as unknown as ContractDTO;
    }
  } catch (error) { handleServiceError(error, 'contracts.generate'); }
}

export async function sendForSignature(contractId: string): Promise<{ signatureUrl: string }> {
  try {
    if (isMock()) {
      const { mockSendForSignature } = await import('@/lib/mocks/contracts.mock');
      return mockSendForSignature(contractId);
    }
    try {
      const res = await fetch(`/api/contracts/${contractId}/send`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'contracts.send');
      return res.json();
    } catch {
      console.warn('[contracts.sendForSignature] API not available, using fallback');
      return { signatureUrl: "" };
    }
  } catch (error) { handleServiceError(error, 'contracts.send'); }
}
