import { isMock } from '@/lib/env';

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
  if (isMock()) {
    const { mockListContracts } = await import('@/lib/mocks/contracts.mock');
    return mockListContracts(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.error('[listContracts] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as ContractDTO[];
}

export async function generateContract(templateId: ContractTemplate, studentId: string): Promise<ContractDTO> {
  if (isMock()) {
    const { mockGenerateContract } = await import('@/lib/mocks/contracts.mock');
    return mockGenerateContract(templateId, studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('contracts')
    .insert({ template_id: templateId, student_id: studentId, status: 'draft' })
    .select()
    .single();
  if (error || !data) {
    console.error('[generateContract] Supabase error:', error?.message);
    throw new Error(`[generateContract] Failed to generate contract: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as ContractDTO;
}

export async function sendForSignature(contractId: string): Promise<{ signatureUrl: string }> {
  if (isMock()) {
    const { mockSendForSignature } = await import('@/lib/mocks/contracts.mock');
    return mockSendForSignature(contractId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('contracts')
    .update({ status: 'sent' })
    .eq('id', contractId)
    .select('signature_url')
    .single();
  if (error || !data) {
    console.error('[sendForSignature] Supabase error:', error?.message);
    throw new Error(`[sendForSignature] Failed to send for signature: ${error?.message ?? 'no data'}`);
  }
  return { signatureUrl: data.signature_url ?? '' };
}
