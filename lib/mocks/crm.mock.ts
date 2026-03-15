import type { Lead, CRMMetrics } from '@/lib/api/crm.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const MOCK_LEADS: Lead[] = [
  {
    id: 'crm-lead-1',
    name: 'Marina Silva',
    email: 'marina@email.com',
    phone: '(11) 99876-5432',
    modality: 'BJJ',
    origin: 'Instagram',
    status: 'lead',
    notes: 'Viu story do campeonato',
    experimental_date: null,
    referred_by_name: null,
    created_at: '2026-03-13T10:00:00Z',
  },
  {
    id: 'crm-lead-2',
    name: 'Carlos Eduardo',
    email: 'carlos.edu@email.com',
    phone: '(11) 98765-1111',
    modality: 'Muay Thai',
    origin: 'Google',
    status: 'contatado',
    notes: 'Quer começar semana que vem',
    experimental_date: null,
    referred_by_name: null,
    created_at: '2026-03-12T14:30:00Z',
  },
  {
    id: 'crm-lead-3',
    name: 'Beatriz Almeida',
    email: 'bia@email.com',
    phone: '(11) 97654-2222',
    modality: 'BJJ',
    origin: 'Indicação',
    status: 'experimental',
    notes: 'Indicada pela Ana Costa',
    experimental_date: '2026-03-17T19:00:00Z',
    referred_by_name: 'Ana Costa',
    created_at: '2026-03-11T09:00:00Z',
  },
  {
    id: 'crm-lead-4',
    name: 'Thiago Nascimento',
    email: 'thiago.n@email.com',
    phone: '(11) 96543-3333',
    modality: 'Judô',
    origin: 'Facebook',
    status: 'compareceu',
    notes: 'Gostou muito, pediu para ver planos',
    experimental_date: '2026-03-10T10:00:00Z',
    referred_by_name: null,
    created_at: '2026-03-08T11:00:00Z',
  },
  {
    id: 'crm-lead-5',
    name: 'Larissa Monteiro',
    email: 'larissa.m@email.com',
    phone: '(11) 95432-4444',
    modality: 'BJJ',
    origin: 'Indicação',
    status: 'matriculou',
    notes: 'Matriculou no plano mensal',
    experimental_date: '2026-03-05T19:00:00Z',
    referred_by_name: 'Rafael Pereira',
    created_at: '2026-03-03T08:00:00Z',
  },
  {
    id: 'crm-lead-6',
    name: 'Felipe Duarte',
    email: 'felipe.d@email.com',
    phone: '(11) 94321-5555',
    modality: 'MMA',
    origin: 'TikTok',
    status: 'lead',
    notes: null,
    experimental_date: null,
    referred_by_name: null,
    created_at: '2026-03-14T16:00:00Z',
  },
  {
    id: 'crm-lead-7',
    name: 'Amanda Rocha',
    email: 'amanda.r@email.com',
    phone: '(11) 93210-6666',
    modality: 'BJJ',
    origin: 'Google',
    status: 'contatado',
    notes: 'Perguntou sobre horários para iniciantes',
    experimental_date: null,
    referred_by_name: null,
    created_at: '2026-03-12T18:00:00Z',
  },
  {
    id: 'crm-lead-8',
    name: 'Bruno Carvalho',
    email: 'bruno.c@email.com',
    phone: '(11) 92109-7777',
    modality: 'Karatê',
    origin: 'Indicação',
    status: 'experimental',
    notes: 'Quer trazer o filho também',
    experimental_date: '2026-03-18T14:00:00Z',
    referred_by_name: 'João Mendes',
    created_at: '2026-03-10T13:00:00Z',
  },
];

export async function mockGetLeads(_academyId: string): Promise<Lead[]> {
  await delay();
  return MOCK_LEADS.map((l) => ({ ...l }));
}

export async function mockGetCRMMetrics(_academyId: string): Promise<CRMMetrics> {
  await delay();
  const total = MOCK_LEADS.length;
  const contacted = MOCK_LEADS.filter((l) => l.status !== 'lead').length;
  const scheduled = MOCK_LEADS.filter((l) => ['experimental', 'compareceu', 'matriculou'].includes(l.status)).length;
  const attended = MOCK_LEADS.filter((l) => ['compareceu', 'matriculou'].includes(l.status)).length;
  const converted = MOCK_LEADS.filter((l) => l.status === 'matriculou').length;
  return {
    total_leads: total,
    contacted,
    experimental_scheduled: scheduled,
    attended,
    converted,
    conversion_rate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
}

export async function mockUpdateLeadStatus(leadId: string, status: string): Promise<void> {
  await delay();
  const lead = MOCK_LEADS.find((l) => l.id === leadId);
  if (lead) lead.status = status;
}

export async function mockCreateLead(data: Omit<Lead, 'id' | 'created_at' | 'referred_by_name'>): Promise<Lead> {
  await delay();
  const lead: Lead = {
    ...data,
    id: `crm-lead-${Date.now()}`,
    referred_by_name: null,
    created_at: new Date().toISOString(),
  };
  MOCK_LEADS.push(lead);
  return lead;
}
