import type { ContractDTO, ContractTemplate } from '@/lib/api/contracts.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const CONTRACTS: ContractDTO[] = [
  { id: 'ctr-1', templateId: 'matricula_adulto', studentId: 'student-1', studentName: 'João Silva', status: 'signed', createdAt: '2026-01-15T10:00:00Z', signedAt: '2026-01-16T14:00:00Z' },
  { id: 'ctr-2', templateId: 'matricula_menor', studentId: 'student-5', studentName: 'Pedro Santos', status: 'signed', createdAt: '2026-02-01T10:00:00Z', signedAt: '2026-02-02T09:00:00Z' },
  { id: 'ctr-3', templateId: 'matricula_adulto', studentId: 'student-3', studentName: 'Maria Oliveira', status: 'sent', createdAt: '2026-03-10T10:00:00Z' },
  { id: 'ctr-4', templateId: 'professor', studentId: 'prof-1', studentName: 'Prof. Silva', status: 'signed', createdAt: '2025-12-01T10:00:00Z', signedAt: '2025-12-01T15:00:00Z' },
];

export async function mockListContracts(_academyId: string): Promise<ContractDTO[]> {
  await delay();
  return CONTRACTS.map((c) => ({ ...c }));
}

export async function mockGenerateContract(templateId: ContractTemplate, studentId: string): Promise<ContractDTO> {
  await delay();
  const contract: ContractDTO = {
    id: `ctr-${Date.now()}`,
    templateId,
    studentId,
    studentName: 'Novo Aluno',
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  CONTRACTS.push(contract);
  return contract;
}

export async function mockSendForSignature(contractId: string): Promise<{ signatureUrl: string }> {
  await delay();
  const contract = CONTRACTS.find((c) => c.id === contractId);
  if (contract) contract.status = 'sent';
  return { signatureUrl: `https://app.blackbelt.com/sign/${contractId}` };
}
