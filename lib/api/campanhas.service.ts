import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type CampaignStatus = 'draft' | 'active' | 'completed';
export type CampaignTemplate = 'volte_treinar' | 'traga_amigo' | 'upgrade_premium' | 'familia' | 'competicao';

export interface CampaignDTO {
  id: string;
  name: string;
  template: CampaignTemplate;
  status: CampaignStatus;
  target_audience: string;
  target_count: number;
  scheduled_at: string | null;
  created_at: string;
}

export interface CampaignMetricsDTO {
  campaign_id: string;
  sent: number;
  opened: number;
  open_rate: number;
  converted: number;
  conversion_rate: number;
}

export interface CreateCampaignInput {
  name: string;
  template: CampaignTemplate;
  target_audience: string;
  scheduled_at: string | null;
}

export const TEMPLATE_LABELS: Record<CampaignTemplate, string> = {
  volte_treinar: 'Volte a treinar',
  traga_amigo: 'Traga um amigo',
  upgrade_premium: 'Upgrade Premium',
  familia: 'Familia',
  competicao: 'Competicao',
};

export const TEMPLATE_ICONS: Record<CampaignTemplate, string> = {
  volte_treinar: '\uD83D\uDD04',
  traga_amigo: '\uD83E\uDD1D',
  upgrade_premium: '\u2B50',
  familia: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
  competicao: '\uD83C\uDFC6',
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  completed: 'Concluida',
};

export async function getCampaigns(academyId: string): Promise<CampaignDTO[]> {
  try {
    if (isMock()) {
      const { mockGetCampaigns } = await import('@/lib/mocks/campanhas.mock');
      return mockGetCampaigns(academyId);
    }
    try {
      const res = await fetch(`/api/campanhas?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'campanhas.list');
      return res.json();
    } catch {
      console.warn('[campanhas.getCampaigns] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'campanhas.list');
  }
}

export async function createCampaign(data: CreateCampaignInput): Promise<CampaignDTO> {
  try {
    if (isMock()) {
      const { mockCreateCampaign } = await import('@/lib/mocks/campanhas.mock');
      return mockCreateCampaign(data);
    }
    try {
      const res = await fetch('/api/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'campanhas.create');
      return res.json();
    } catch {
      console.warn('[campanhas.createCampaign] API not available, using fallback');
      return { id: '', name: '', template: 'volte_treinar', status: 'draft', target_audience: '', target_count: 0, scheduled_at: null, created_at: '' } as CampaignDTO;
    }
  } catch (error) {
    handleServiceError(error, 'campanhas.create');
  }
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetricsDTO> {
  try {
    if (isMock()) {
      const { mockGetCampaignMetrics } = await import('@/lib/mocks/campanhas.mock');
      return mockGetCampaignMetrics(campaignId);
    }
    try {
      const res = await fetch(`/api/campanhas/${campaignId}/metrics`);
      if (!res.ok) throw new ServiceError(res.status, 'campanhas.metrics');
      return res.json();
    } catch {
      console.warn('[campanhas.getCampaignMetrics] API not available, using fallback');
      return { campaign_id: '', sent: 0, opened: 0, open_rate: 0, converted: 0, conversion_rate: 0 } as CampaignMetricsDTO;
    }
  } catch (error) {
    handleServiceError(error, 'campanhas.metrics');
  }
}
