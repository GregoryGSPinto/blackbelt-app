import type {
  FranchiseLead,
  PipelineStage,
  ViabilityAnalysis,
  CreateLeadData,
} from '@/lib/api/franchise-expansion.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const LEADS: FranchiseLead[] = [
  {
    id: 'lead-1', franchise_id: 'franchise-1', name: 'Ricardo Mendes', email: 'ricardo@email.com', phone: '(11) 99876-5432',
    city: 'Campinas', state: 'SP', investment_capacity: 250000, experience: '5 anos como praticante, faixa roxa',
    stage: 'lead', viability_score: null, onboarding_step: null,
    notes: 'Interesse via Instagram', created_at: '2026-02-28T10:00:00Z', updated_at: '2026-02-28T10:00:00Z',
  },
  {
    id: 'lead-2', franchise_id: 'franchise-1', name: 'Fernanda Oliveira', email: 'fernanda@email.com', phone: '(21) 98765-4321',
    city: 'Niteroi', state: 'RJ', investment_capacity: 180000, experience: 'Empresaria, faixa azul',
    stage: 'lead', viability_score: null, onboarding_step: null,
    notes: 'Indicacao de franqueado existente', created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'lead-3', franchise_id: 'franchise-1', name: 'Marcos Tavares', email: 'marcos@email.com', phone: '(31) 97654-3210',
    city: 'Uberlandia', state: 'MG', investment_capacity: 200000, experience: 'Professor de jiu-jitsu ha 8 anos',
    stage: 'analise', viability_score: 78, onboarding_step: null,
    notes: 'Ja tem ponto comercial em vista', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'lead-4', franchise_id: 'franchise-1', name: 'Patricia Souza', email: 'patricia@email.com', phone: '(41) 96543-2109',
    city: 'Curitiba', state: 'PR', investment_capacity: 300000, experience: 'Gestora de academia de musculacao',
    stage: 'analise', viability_score: 85, onboarding_step: null,
    notes: 'Quer converter academia existente', created_at: '2026-01-10T10:00:00Z', updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'lead-5', franchise_id: 'franchise-1', name: 'Andre Lima', email: 'andre@email.com', phone: '(48) 95432-1098',
    city: 'Florianopolis', state: 'SC', investment_capacity: 220000, experience: 'Faixa preta, competidor ativo',
    stage: 'aprovado', viability_score: 92, onboarding_step: 'contrato',
    notes: 'Aprovado na entrevista, aguardando contrato', created_at: '2025-11-20T10:00:00Z', updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'lead-6', franchise_id: 'franchise-1', name: 'Juliana Ferreira', email: 'juliana@email.com', phone: '(62) 94321-0987',
    city: 'Goiania', state: 'GO', investment_capacity: 190000, experience: 'Medica, praticante ha 3 anos',
    stage: 'setup', viability_score: 88, onboarding_step: 'treinamento',
    notes: 'Ponto comercial locado, reforma em andamento', created_at: '2025-09-05T10:00:00Z', updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'lead-7', franchise_id: 'franchise-1', name: 'Thiago Costa', email: 'thiago@email.com', phone: '(71) 93210-9876',
    city: 'Salvador', state: 'BA', investment_capacity: 280000, experience: 'Ex-atleta profissional de BJJ',
    stage: 'setup', viability_score: 60, onboarding_step: 'setup',
    notes: 'Equipamentos sendo instalados', created_at: '2025-08-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'lead-8', franchise_id: 'franchise-1', name: 'Carolina Santos', email: 'carolina@email.com', phone: '(85) 92109-8765',
    city: 'Fortaleza', state: 'CE', investment_capacity: 260000, experience: 'Investidora, faixa branca',
    stage: 'operando', viability_score: 95, onboarding_step: 'inauguracao',
    notes: 'Inaugurou em jan/2026, operando normalmente', created_at: '2025-06-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
  },
];

export async function mockGetLeads(_franchiseId: string): Promise<FranchiseLead[]> {
  await delay();
  return LEADS;
}

export async function mockCreateLead(data: CreateLeadData): Promise<FranchiseLead> {
  await delay();
  return {
    id: `lead-${Date.now()}`,
    franchise_id: data.franchise_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    investment_capacity: data.investment_capacity,
    experience: data.experience,
    stage: 'lead',
    viability_score: null,
    onboarding_step: null,
    notes: data.notes ?? '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function mockUpdateLeadStatus(leadId: string, stage: PipelineStage): Promise<FranchiseLead> {
  await delay();
  const lead = LEADS.find((l) => l.id === leadId) ?? LEADS[0];
  return { ...lead, stage, updated_at: new Date().toISOString() };
}

export async function mockAnalyzeViability(location: string): Promise<ViabilityAnalysis> {
  await delay();
  const score = 60 + Math.floor(Math.random() * 35);
  let recommendation: ViabilityAnalysis['recommendation'] = 'viavel';
  if (score >= 85) recommendation = 'recomendado';
  else if (score < 70) recommendation = 'arriscado';
  if (score < 55) recommendation = 'nao_recomendado';

  return {
    location,
    population: 200000 + Math.floor(Math.random() * 800000),
    competitors: 1 + Math.floor(Math.random() * 6),
    avg_income: 3000 + Math.floor(Math.random() * 5000),
    score,
    recommendation,
    factors: [
      { name: 'Densidade populacional', score: 60 + Math.floor(Math.random() * 35), weight: 0.25 },
      { name: 'Concorrencia', score: 50 + Math.floor(Math.random() * 40), weight: 0.20 },
      { name: 'Renda media', score: 55 + Math.floor(Math.random() * 40), weight: 0.20 },
      { name: 'Acessibilidade / localizacao', score: 60 + Math.floor(Math.random() * 35), weight: 0.15 },
      { name: 'Potencial de crescimento', score: 65 + Math.floor(Math.random() * 30), weight: 0.10 },
      { name: 'Infraestrutura da regiao', score: 70 + Math.floor(Math.random() * 25), weight: 0.10 },
    ],
  };
}

export async function mockSetupFranchise(leadId: string): Promise<FranchiseLead> {
  await delay();
  const lead = LEADS.find((l) => l.id === leadId) ?? LEADS[0];
  return { ...lead, stage: 'setup', onboarding_step: 'setup', updated_at: new Date().toISOString() };
}
