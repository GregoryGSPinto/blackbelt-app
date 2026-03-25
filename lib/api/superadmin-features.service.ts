import { isMock } from '@/lib/env';

export type CategoriaFeature = 'core' | 'premium' | 'beta' | 'experimental';

export interface FeatureFlagRegras {
  planos: string[];
  academiasIncluidas: string[];
  academiasExcluidas: string[];
}

export interface FeatureFlag {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoria: CategoriaFeature;
  statusGlobal: boolean;
  regras: FeatureFlagRegras;
  rolloutPercentual: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FeatureUsageStats {
  featureSlug: string;
  totalAcademiasComAcesso: number;
  totalAcademiasUsando: number;
  taxaAdocao: number;
  ultimoUso: string;
}

export interface FeatureWithStats extends FeatureFlag {
  stats: FeatureUsageStats;
}

export async function listFeatureFlags(): Promise<FeatureWithStats[]> {
  try {
    if (isMock()) {
      const { mockListFeatureFlags } = await import('@/lib/mocks/superadmin-features.mock');
      return mockListFeatureFlags();
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('type', 'feature_flag')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) {
        console.error('[listFeatureFlags] Query failed or empty:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => {
        const value = (row.value as Record<string, unknown>) || {};
        return {
          id: (row.id as string) || '',
          nome: (value.nome as string) || (row.key as string) || '',
          slug: (row.key as string) || '',
          descricao: (value.descricao as string) || '',
          categoria: (value.categoria as CategoriaFeature) || 'core',
          statusGlobal: (value.enabled as boolean) || false,
          regras: (value.regras as FeatureFlagRegras) || { planos: [], academiasIncluidas: [], academiasExcluidas: [] },
          rolloutPercentual: (value.rollout as number) || 0,
          criadoEm: (row.created_at as string) || '',
          atualizadoEm: (row.updated_at as string) || '',
          stats: {
            featureSlug: (row.key as string) || '',
            totalAcademiasComAcesso: 0,
            totalAcademiasUsando: 0,
            taxaAdocao: 0,
            ultimoUso: '',
          },
        };
      });
    } catch {
      console.error('[superadmin-features.listFeatureFlags] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listFeatureFlags] Fallback:', error);
    return [];
  }
}

export async function toggleFeatureGlobal(featureId: string, enabled: boolean): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockToggleFeatureGlobal } = await import('@/lib/mocks/superadmin-features.mock');
      return mockToggleFeatureGlobal(featureId, enabled);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('id', featureId)
        .single();
      const currentValue = (existing?.value as Record<string, unknown>) || {};
      const { data: row, error } = await supabase
        .from('platform_settings')
        .update({ value: { ...currentValue, enabled }, updated_at: new Date().toISOString() })
        .eq('id', featureId)
        .select()
        .single();
      if (error || !row) {
        console.error('[toggleFeatureGlobal] Update failed:', error?.message);
        return { id: featureId, nome: '', slug: '', descricao: '', categoria: 'core', statusGlobal: enabled, regras: { planos: [], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 0, criadoEm: '', atualizadoEm: '' };
      }
      const value = (row.value as Record<string, unknown>) || {};
      return {
        id: (row.id as string) || featureId,
        nome: (value.nome as string) || '',
        slug: (row.key as string) || '',
        descricao: (value.descricao as string) || '',
        categoria: (value.categoria as CategoriaFeature) || 'core',
        statusGlobal: enabled,
        regras: (value.regras as FeatureFlagRegras) || { planos: [], academiasIncluidas: [], academiasExcluidas: [] },
        rolloutPercentual: (value.rollout as number) || 0,
        criadoEm: (row.created_at as string) || '',
        atualizadoEm: (row.updated_at as string) || '',
      };
    } catch {
      console.error('[superadmin-features.toggleFeatureGlobal] API not available, using mock fallback');
      const { mockToggleFeatureGlobal } = await import('@/lib/mocks/superadmin-features.mock');
      return mockToggleFeatureGlobal(featureId, enabled);
    }
  } catch (error) {
    console.error('[toggleFeatureGlobal] Fallback:', error);
    return { id: featureId, nome: '', slug: '', descricao: '', categoria: 'core', statusGlobal: enabled, regras: { planos: [], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 0, criadoEm: '', atualizadoEm: '' };
  }
}

export async function updateFeatureFlag(featureId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockUpdateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockUpdateFeatureFlag(featureId, data);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('id', featureId)
        .single();
      const currentValue = (existing?.value as Record<string, unknown>) || {};
      const { data: row, error } = await supabase
        .from('platform_settings')
        .update({ value: { ...currentValue, ...data }, updated_at: new Date().toISOString() })
        .eq('id', featureId)
        .select()
        .single();
      if (error || !row) {
        console.error('[updateFeatureFlag] Update failed:', error?.message);
        return { id: featureId, nome: '', slug: '', descricao: '', categoria: 'core', statusGlobal: false, regras: { planos: [], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 0, criadoEm: '', atualizadoEm: '' };
      }
      const value = (row.value as Record<string, unknown>) || {};
      return {
        id: (row.id as string) || featureId,
        nome: (value.nome as string) || '',
        slug: (row.key as string) || '',
        descricao: (value.descricao as string) || '',
        categoria: (value.categoria as CategoriaFeature) || 'core',
        statusGlobal: (value.enabled as boolean) || false,
        regras: (value.regras as FeatureFlagRegras) || { planos: [], academiasIncluidas: [], academiasExcluidas: [] },
        rolloutPercentual: (value.rollout as number) || 0,
        criadoEm: (row.created_at as string) || '',
        atualizadoEm: (row.updated_at as string) || '',
      };
    } catch {
      console.error('[superadmin-features.updateFeatureFlag] API not available, using mock fallback');
      const { mockUpdateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockUpdateFeatureFlag(featureId, data);
    }
  } catch (error) {
    console.error('[updateFeatureFlag] Fallback:', error);
    return { id: featureId, nome: '', slug: '', descricao: '', categoria: 'core', statusGlobal: false, regras: { planos: [], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 0, criadoEm: '', atualizadoEm: '' };
  }
}

export async function createFeatureFlag(data: Omit<FeatureFlag, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockCreateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockCreateFeatureFlag(data);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('platform_settings')
        .insert({
          key: data.slug,
          type: 'feature_flag',
          value: { nome: data.nome, descricao: data.descricao, categoria: data.categoria, enabled: data.statusGlobal, regras: data.regras, rollout: data.rolloutPercentual },
        })
        .select()
        .single();
      if (error || !row) {
        console.error('[createFeatureFlag] Insert failed:', error?.message);
        return { ...data, id: '', criadoEm: '', atualizadoEm: '' };
      }
      return {
        ...data,
        id: (row.id as string) || '',
        criadoEm: (row.created_at as string) || '',
        atualizadoEm: (row.updated_at as string) || '',
      };
    } catch {
      console.error('[superadmin-features.createFeatureFlag] API not available, using mock fallback');
      const { mockCreateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockCreateFeatureFlag(data);
    }
  } catch (error) {
    console.error('[createFeatureFlag] Fallback:', error);
    return { ...data, id: '', criadoEm: '', atualizadoEm: '' };
  }
}
