import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      const res = await fetch('/api/superadmin/features');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-features.listFeatureFlags] API not available, using mock fallback');
      const { mockListFeatureFlags } = await import('@/lib/mocks/superadmin-features.mock');
      return mockListFeatureFlags();
    }
  } catch (error) { handleServiceError(error, 'superadmin-features.list'); }
}

export async function toggleFeatureGlobal(featureId: string, enabled: boolean): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockToggleFeatureGlobal } = await import('@/lib/mocks/superadmin-features.mock');
      return mockToggleFeatureGlobal(featureId, enabled);
    }
    try {
      const res = await fetch(`/api/superadmin/features/${featureId}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-features.toggleFeatureGlobal] API not available, using mock fallback');
      const { mockToggleFeatureGlobal } = await import('@/lib/mocks/superadmin-features.mock');
      return mockToggleFeatureGlobal(featureId, enabled);
    }
  } catch (error) { handleServiceError(error, 'superadmin-features.toggle'); }
}

export async function updateFeatureFlag(featureId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockUpdateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockUpdateFeatureFlag(featureId, data);
    }
    try {
      const res = await fetch(`/api/superadmin/features/${featureId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-features.updateFeatureFlag] API not available, using mock fallback');
      const { mockUpdateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockUpdateFeatureFlag(featureId, data);
    }
  } catch (error) { handleServiceError(error, 'superadmin-features.update'); }
}

export async function createFeatureFlag(data: Omit<FeatureFlag, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<FeatureFlag> {
  try {
    if (isMock()) {
      const { mockCreateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockCreateFeatureFlag(data);
    }
    try {
      const res = await fetch('/api/superadmin/features', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-features.createFeatureFlag] API not available, using mock fallback');
      const { mockCreateFeatureFlag } = await import('@/lib/mocks/superadmin-features.mock');
      return mockCreateFeatureFlag(data);
    }
  } catch (error) { handleServiceError(error, 'superadmin-features.create'); }
}
