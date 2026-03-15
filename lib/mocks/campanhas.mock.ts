import type {
  CampaignDTO,
  CampaignMetricsDTO,
  CreateCampaignInput,
} from '@/lib/api/campanhas.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const CAMPAIGNS: CampaignDTO[] = [
  {
    id: 'camp-1',
    name: 'Volte a treinar - Marco',
    template: 'volte_treinar',
    status: 'active',
    target_audience: 'Alunos inativos ha mais de 15 dias',
    target_count: 23,
    scheduled_at: '2026-03-10T09:00:00Z',
    created_at: '2026-03-08T14:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Traga um amigo - Verao',
    template: 'traga_amigo',
    status: 'completed',
    target_audience: 'Todos os alunos ativos',
    target_count: 85,
    scheduled_at: '2026-02-01T09:00:00Z',
    created_at: '2026-01-28T10:00:00Z',
  },
  {
    id: 'camp-3',
    name: 'Upgrade Premium Abril',
    template: 'upgrade_premium',
    status: 'draft',
    target_audience: 'Alunos no plano basico',
    target_count: 42,
    scheduled_at: null,
    created_at: '2026-03-14T16:00:00Z',
  },
  {
    id: 'camp-4',
    name: 'Campeonato Regional',
    template: 'competicao',
    status: 'active',
    target_audience: 'Faixa azul e acima',
    target_count: 31,
    scheduled_at: '2026-03-12T08:00:00Z',
    created_at: '2026-03-10T11:00:00Z',
  },
];

const METRICS: Record<string, CampaignMetricsDTO> = {
  'camp-1': {
    campaign_id: 'camp-1',
    sent: 23,
    opened: 18,
    open_rate: 78.3,
    converted: 7,
    conversion_rate: 30.4,
  },
  'camp-2': {
    campaign_id: 'camp-2',
    sent: 85,
    opened: 62,
    open_rate: 72.9,
    converted: 14,
    conversion_rate: 16.5,
  },
  'camp-3': {
    campaign_id: 'camp-3',
    sent: 0,
    opened: 0,
    open_rate: 0,
    converted: 0,
    conversion_rate: 0,
  },
  'camp-4': {
    campaign_id: 'camp-4',
    sent: 31,
    opened: 25,
    open_rate: 80.6,
    converted: 12,
    conversion_rate: 38.7,
  },
};

export async function mockGetCampaigns(_academyId: string): Promise<CampaignDTO[]> {
  await delay();
  return CAMPAIGNS;
}

export async function mockCreateCampaign(data: CreateCampaignInput): Promise<CampaignDTO> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `camp-${Date.now()}`,
    name: data.name,
    template: data.template,
    status: 'draft',
    target_audience: data.target_audience,
    target_count: 0,
    scheduled_at: data.scheduled_at,
    created_at: now,
  };
}

export async function mockGetCampaignMetrics(campaignId: string): Promise<CampaignMetricsDTO> {
  await delay();
  return METRICS[campaignId] ?? {
    campaign_id: campaignId,
    sent: 0,
    opened: 0,
    open_rate: 0,
    converted: 0,
    conversion_rate: 0,
  };
}
