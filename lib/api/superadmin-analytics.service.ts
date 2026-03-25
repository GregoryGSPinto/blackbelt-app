import { isMock } from '@/lib/env';

export interface FeatureRanking {
  feature: string;
  slug: string;
  sessoesMes: number;
  usuariosUnicos: number;
  tempoMedioMinutos: number;
  tendencia: number;
}

export interface Engajamento {
  dau: number;
  wau: number;
  mau: number;
  dauMauRatio: number;
  sessoesMediaDia: number;
  tempoMedioSessao: number;
}

export interface NuncaUsaram {
  feature: string;
  slug: string;
  academias: { id: string; nome: string; plano: string; temAcesso: boolean }[];
}

export interface HorarioPico {
  hora: number;
  sessoes: number;
}

export interface Dispositivo {
  tipo: 'desktop' | 'mobile' | 'tablet';
  percentual: number;
}

export interface ProductAnalytics {
  featureRanking: FeatureRanking[];
  engajamento: Engajamento;
  nuncaUsaram: NuncaUsaram[];
  horariosPico: HorarioPico[];
  dispositivos: Dispositivo[];
}

export async function getProductAnalytics(): Promise<ProductAnalytics> {
  try {
    if (isMock()) {
      const { mockGetProductAnalytics } = await import('@/lib/mocks/superadmin-analytics.mock');
      return mockGetProductAnalytics();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'product_analytics')
        .single();
      if (error || !data) {
        console.error('[getProductAnalytics] Query failed:', error?.message);
        return { featureRanking: [], engajamento: { dau: 0, wau: 0, mau: 0, dauMauRatio: 0, sessoesMediaDia: 0, tempoMedioSessao: 0 }, nuncaUsaram: [], horariosPico: [], dispositivos: [] };
      }
      return (data.value as ProductAnalytics) || { featureRanking: [], engajamento: { dau: 0, wau: 0, mau: 0, dauMauRatio: 0, sessoesMediaDia: 0, tempoMedioSessao: 0 }, nuncaUsaram: [], horariosPico: [], dispositivos: [] };
    } catch {
      console.error('[superadmin-analytics.getProductAnalytics] API not available, returning empty');
      return { featureRanking: [], engajamento: { dau: 0, wau: 0, mau: 0, dauMauRatio: 0, sessoesMediaDia: 0, tempoMedioSessao: 0 }, nuncaUsaram: [], horariosPico: [], dispositivos: [] };
    }
  } catch (error) {
    console.error('[getProductAnalytics] Fallback:', error);
    return { featureRanking: [], engajamento: { dau: 0, wau: 0, mau: 0, dauMauRatio: 0, sessoesMediaDia: 0, tempoMedioSessao: 0 }, nuncaUsaram: [], horariosPico: [], dispositivos: [] };
  }
}
