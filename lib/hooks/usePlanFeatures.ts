'use client';

import { useState, useEffect, useCallback } from 'react';
import { isMock } from '@/lib/env';
import { useAuth } from '@/lib/hooks/useAuth';

// ── Feature keys (from platform_plans.features jsonb) ──────────────────────

export type PlanFeature =
  | 'gestao_alunos'
  | 'checkin'
  | 'financeiro_basico'
  | 'agenda'
  | 'notificacoes'
  | 'biblioteca_videos'
  | 'pedagogico'
  | 'ia'
  | 'compete'
  | 'api'
  | 'franquia'
  | 'whatsapp';

// ── Resource keys for limit checks ─────────────────────────────────────────

export type PlanLimitResource = 'alunos' | 'professores' | 'turmas';

// ── Response shape from /api/academy/plan ───────────────────────────────────

interface PlanAPIResponse {
  plan: {
    id: string;
    tier: string;
    name: string;
    price_monthly: number;
    is_custom_price: boolean;
    max_alunos: number;
    max_professores: number;
    max_unidades: number;
    max_storage_gb: number;
    max_turmas: number;
    features: string[];
    trial_days: number;
  } | null;
  subscription: {
    id: string;
    academy_id: string;
    tier_id: string;
    status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    discovery_ends_at: string | null;
    plan_started_at: string | null;
    total_price: number;
    billing_cycle: string;
  } | null;
  usage: {
    id: string;
    academy_id: string;
    plan: string;
    students_active: number;
    units: number;
    classes: number;
    usage_percent: number;
  } | null;
}

// ── Hook return type ────────────────────────────────────────────────────────

export interface PlanFeaturesData {
  planName: string;
  planTier: string;
  status: string;
  maxAlunos: number;
  maxProfessores: number;
  maxTurmas: number;
  features: string[];
  trialDaysLeft: number;
  isTrialActive: boolean;
  loading: boolean;
  canAccess: (feature: string) => boolean;
  isAtLimit: (resource: PlanLimitResource) => boolean;
}

// ── Mock defaults (Pro plan, all features unlocked) ─────────────────────────

const ALL_FEATURES: PlanFeature[] = [
  'gestao_alunos',
  'checkin',
  'financeiro_basico',
  'agenda',
  'notificacoes',
  'biblioteca_videos',
  'pedagogico',
  'ia',
  'compete',
  'api',
  'franquia',
  'whatsapp',
];

const MOCK_DEFAULTS: Omit<PlanFeaturesData, 'canAccess' | 'isAtLimit'> = {
  planName: 'Pro',
  planTier: 'pro',
  status: 'discovery',
  maxAlunos: 200,
  maxProfessores: 10,
  maxTurmas: 9999,
  features: [...ALL_FEATURES],
  trialDaysLeft: 0,
  isTrialActive: false,
  loading: false,
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function usePlanFeatures(): PlanFeaturesData {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<Omit<PlanFeaturesData, 'canAccess' | 'isAtLimit'>>(
    isMock() ? MOCK_DEFAULTS : { ...MOCK_DEFAULTS, loading: true },
  );

  // Usage counters for limit checks
  const [usage, setUsage] = useState<{
    studentsActive: number;
    units: number;
    classes: number;
  }>({ studentsActive: 0, units: 0, classes: 0 });

  useEffect(() => {
    // ── Mock mode: return Pro defaults with all features ──
    if (isMock()) {
      setData(MOCK_DEFAULTS);
      setUsage({ studentsActive: 45, units: 1, classes: 5 });
      return;
    }

    if (authLoading) {
      setData((prev) => ({ ...prev, loading: true }));
      return;
    }

    if (!isAuthenticated) {
      setData({ ...MOCK_DEFAULTS, loading: false });
      return;
    }

    let cancelled = false;

    async function fetchPlan() {
      try {
        const response = await fetch('/api/academy/plan', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch plan (${response.status})`);
        }

        const json: PlanAPIResponse = await response.json();

        if (cancelled) return;

        const plan = json.plan;
        const sub = json.subscription;
        const usageData = json.usage;

        // Calculate trial days left
        const now = new Date();
        const trialEnd = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
        const trialDaysLeft = trialEnd
          ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        const isTrialActive = sub?.status === 'trial' && trialEnd !== null && now < trialEnd;

        setData({
          planName: plan?.name ?? 'Free',
          planTier: plan?.tier ?? 'free',
          status: sub?.status ?? 'cancelled',
          maxAlunos: plan?.max_alunos ?? 30,
          maxProfessores: plan?.max_professores ?? 1,
          maxTurmas: plan?.max_turmas ?? 3,
          features: plan?.features ?? [],
          trialDaysLeft,
          isTrialActive,
          loading: false,
        });

        if (usageData) {
          setUsage({
            studentsActive: usageData.students_active ?? 0,
            units: usageData.units ?? 0,
            classes: usageData.classes ?? 0,
          });
        }
      } catch {
        console.warn('[usePlanFeatures] Falha ao carregar plano');
        if (!cancelled) {
          setData({ ...MOCK_DEFAULTS, loading: false });
        }
      }
    }

    fetchPlan();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated]);

  // ── canAccess: feature is in the features array OR trial is active ──
  const canAccess = useCallback(
    (feature: string): boolean => {
      if (data.isTrialActive) return true;
      return data.features.includes(feature);
    },
    [data.features, data.isTrialActive],
  );

  // ── isAtLimit: current usage >= plan max for the resource ──
  const isAtLimit = useCallback(
    (resource: PlanLimitResource): boolean => {
      switch (resource) {
        case 'alunos':
          return usage.studentsActive >= data.maxAlunos;
        case 'professores':
          return false; // Professor count not tracked in usage yet
        case 'turmas':
          return usage.classes >= data.maxTurmas;
        default:
          return false;
      }
    },
    [usage, data.maxAlunos, data.maxTurmas],
  );

  return {
    ...data,
    canAccess,
    isAtLimit,
  };
}
