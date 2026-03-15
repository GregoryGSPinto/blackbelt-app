import type { LeadDTO, LeadStatus } from '@/lib/api/leads.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const LEADS: LeadDTO[] = [
  { id: 'lead-1', name: 'Gabriel Souza', email: 'gabriel@email.com', phone: '(11) 98765-4321', interest: 'BJJ', source: 'Instagram', status: 'novo', createdAt: '2026-03-14T10:00:00Z' },
  { id: 'lead-2', name: 'Fernanda Lima', email: 'fer@email.com', phone: '(11) 98765-1234', interest: 'Muay Thai', source: 'Indicação', referralCode: 'REF-JOAO', status: 'contatado', createdAt: '2026-03-13T14:00:00Z' },
  { id: 'lead-3', name: 'Ricardo Mendes', email: 'ricardo@email.com', phone: '(11) 91234-5678', interest: 'BJJ', source: 'Google', status: 'agendado', createdAt: '2026-03-12T09:00:00Z' },
  { id: 'lead-4', name: 'Juliana Costa', email: 'ju@email.com', phone: '(11) 94567-8901', interest: 'Judô', source: 'Indicação', referralCode: 'REF-ANA', status: 'compareceu', createdAt: '2026-03-10T11:00:00Z' },
  { id: 'lead-5', name: 'Marcos Santos', email: 'marcos@email.com', phone: '(11) 92345-6789', interest: 'BJJ', source: 'Facebook', status: 'matriculou', createdAt: '2026-03-08T16:00:00Z' },
];

export async function mockListLeads(_academyId: string): Promise<LeadDTO[]> {
  await delay();
  return LEADS.map((l) => ({ ...l }));
}

export async function mockCreateLead(data: Omit<LeadDTO, 'id' | 'status' | 'createdAt'>): Promise<LeadDTO> {
  await delay();
  const lead: LeadDTO = { ...data, id: `lead-${Date.now()}`, status: 'novo', createdAt: new Date().toISOString() };
  LEADS.push(lead);
  return lead;
}

export async function mockUpdateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  await delay();
  const lead = LEADS.find((l) => l.id === leadId);
  if (lead) lead.status = status;
}
