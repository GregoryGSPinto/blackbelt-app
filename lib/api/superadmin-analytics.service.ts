import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      const res = await fetch('/api/superadmin/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-analytics.getProductAnalytics] API not available, using mock fallback');
      const { mockGetProductAnalytics } = await import('@/lib/mocks/superadmin-analytics.mock');
      return mockGetProductAnalytics();
    }
  } catch (error) { handleServiceError(error, 'superadmin-analytics.get'); }
}
