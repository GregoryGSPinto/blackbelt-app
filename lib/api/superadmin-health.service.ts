import { isMock } from '@/lib/env';

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
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'health_overview')
        .single();
      if (error || !data) {
        console.error('[getHealthOverview] Query failed:', error?.message);
        return { mediaGeral: 0, distribuicao: [], academiasEmRisco: 0, academiasSaudaveis: 0, evolucaoMedia: [] };
      }
      return (data.value as HealthOverview) || { mediaGeral: 0, distribuicao: [], academiasEmRisco: 0, academiasSaudaveis: 0, evolucaoMedia: [] };
    } catch {
      console.error('[superadmin-health.getHealthOverview] API not available, returning empty');
      return { mediaGeral: 0, distribuicao: [], academiasEmRisco: 0, academiasSaudaveis: 0, evolucaoMedia: [] };
    }
  } catch (error) {
    console.error('[getHealthOverview] Fallback:', error);
    return { mediaGeral: 0, distribuicao: [], academiasEmRisco: 0, academiasSaudaveis: 0, evolucaoMedia: [] };
  }
}

export async function listAcademiaHealthScores(filtro?: string): Promise<AcademiaHealthScore[]> {
  try {
    if (isMock()) {
      const { mockListAcademiaHealthScores } = await import('@/lib/mocks/superadmin-health.mock');
      return mockListAcademiaHealthScores(filtro);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      let query = supabase
        .from('academies')
        .select('id, name, plan, health_score, student_count, status')
        .order('health_score', { ascending: true });
      if (filtro) {
        query = query.ilike('name', `%${filtro}%`);
      }
      const { data, error } = await query;
      if (error || !data) {
        console.error('[listAcademiaHealthScores] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        academiaId: (row.id as string) || '',
        academiaNome: (row.name as string) || '',
        plano: (row.plan as string) || '',
        score: (row.health_score as number) || 0,
        tendencia: 'estavel' as const,
        fatores: [],
        ultimoLoginAdmin: '',
        alunosAtivos: (row.student_count as number) || 0,
        alunosTotal: (row.student_count as number) || 0,
        inadimplencia: 0,
        featuresUsadas: [],
        mesesNaPlataforma: 0,
        recomendacao: '',
      }));
    } catch {
      console.error('[superadmin-health.listAcademiaHealthScores] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listAcademiaHealthScores] Fallback:', error);
    return [];
  }
}

export async function getAcademiaHealth(academiaId: string): Promise<AcademiaHealthScore> {
  try {
    if (isMock()) {
      const { mockGetAcademiaHealth } = await import('@/lib/mocks/superadmin-health.mock');
      return mockGetAcademiaHealth(academiaId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('academies')
        .select('id, name, plan, health_score, student_count')
        .eq('id', academiaId)
        .single();
      if (error || !data) {
        console.error('[getAcademiaHealth] Query failed:', error?.message);
        return { academiaId, academiaNome: '', plano: '', score: 0, tendencia: 'estavel', fatores: [], ultimoLoginAdmin: '', alunosAtivos: 0, alunosTotal: 0, inadimplencia: 0, featuresUsadas: [], mesesNaPlataforma: 0, recomendacao: '' };
      }
      return {
        academiaId: (data.id as string) || academiaId,
        academiaNome: (data.name as string) || '',
        plano: (data.plan as string) || '',
        score: (data.health_score as number) || 0,
        tendencia: 'estavel',
        fatores: [],
        ultimoLoginAdmin: '',
        alunosAtivos: (data.student_count as number) || 0,
        alunosTotal: (data.student_count as number) || 0,
        inadimplencia: 0,
        featuresUsadas: [],
        mesesNaPlataforma: 0,
        recomendacao: '',
      };
    } catch {
      console.error('[superadmin-health.getAcademiaHealth] API not available, returning empty');
      return { academiaId, academiaNome: '', plano: '', score: 0, tendencia: 'estavel', fatores: [], ultimoLoginAdmin: '', alunosAtivos: 0, alunosTotal: 0, inadimplencia: 0, featuresUsadas: [], mesesNaPlataforma: 0, recomendacao: '' };
    }
  } catch (error) {
    console.error('[getAcademiaHealth] Fallback:', error);
    return { academiaId, academiaNome: '', plano: '', score: 0, tendencia: 'estavel', fatores: [], ultimoLoginAdmin: '', alunosAtivos: 0, alunosTotal: 0, inadimplencia: 0, featuresUsadas: [], mesesNaPlataforma: 0, recomendacao: '' };
  }
}
