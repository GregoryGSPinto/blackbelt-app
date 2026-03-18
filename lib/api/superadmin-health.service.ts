import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface HealthFator {
  nome: string;
  peso: number;
  valor: number;
  detalhe: string;
}

export interface AcademiaHealthScore {
  academiaId: string;
  academiaNome: string;
  plano: string;
  score: number;
  tendencia: 'subindo' | 'estavel' | 'caindo';
  fatores: HealthFator[];
  ultimoLoginAdmin: string;
  alunosAtivos: number;
  alunosTotal: number;
  inadimplencia: number;
  featuresUsadas: string[];
  mesesNaPlataforma: number;
  recomendacao: string;
}

export interface HealthOverview {
  mediaGeral: number;
  distribuicao: { faixa: string; quantidade: number }[];
  academiasEmRisco: number;
  academiasSaudaveis: number;
  evolucaoMedia: { mes: string; score: number }[];
}

export async function getHealthOverview(): Promise<HealthOverview> {
  try {
    if (isMock()) {
      const { mockGetHealthOverview } = await import('@/lib/mocks/superadmin-health.mock');
      return mockGetHealthOverview();
    }
    // API not yet implemented — use mock
    const { mockGetHealthOverview } = await import('@/lib/mocks/superadmin-health.mock');
      return mockGetHealthOverview();
  } catch (error) { handleServiceError(error, 'superadmin-health.getOverview'); }
}

export async function listAcademiaHealthScores(filtro?: string): Promise<AcademiaHealthScore[]> {
  try {
    if (isMock()) {
      const { mockListAcademiaHealthScores } = await import('@/lib/mocks/superadmin-health.mock');
      return mockListAcademiaHealthScores(filtro);
    }
    // API not yet implemented — use mock
    const { mockListAcademiaHealthScores } = await import('@/lib/mocks/superadmin-health.mock');
      return mockListAcademiaHealthScores(filtro);
  } catch (error) { handleServiceError(error, 'superadmin-health.listScores'); }
}

export async function getAcademiaHealth(academiaId: string): Promise<AcademiaHealthScore> {
  try {
    if (isMock()) {
      const { mockGetAcademiaHealth } = await import('@/lib/mocks/superadmin-health.mock');
      return mockGetAcademiaHealth(academiaId);
    }
    // API not yet implemented — use mock
    const { mockGetAcademiaHealth } = await import('@/lib/mocks/superadmin-health.mock');
      return mockGetAcademiaHealth(academiaId);
  } catch (error) { handleServiceError(error, 'superadmin-health.getAcademia'); }
}
