'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuthContext } from './AuthContext';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { getAssinatura, type AssinaturaSaaS } from '@/lib/api/pricing.service';
import { PLANS, type ModuleId, type PlanDefinition } from '@/lib/plans/module-access';
import {
  checkAccess,
  checkPageAccess,
  type AccessStatus,
  type AcademySubscription,
} from '@/lib/plans/access-control';

// ── Mock subscription (Guerreiros do Tatame — Pro + discovery) ──

const MOCK_SUBSCRIPTION: AcademySubscription = {
  academyId: 'academy-1',
  planSlug: 'pro',
  status: 'discovery',
  createdAt: '2026-03-10T00:00:00Z',
  trialEndsAt: '2026-03-17T00:00:00Z',
  discoveryEndsAt: '2026-06-08T00:00:00Z',
  paidModules: [],
};

function assinaturaSaaSToSubscription(a: AssinaturaSaaS): AcademySubscription {
  const statusMap: Record<AssinaturaSaaS['status'], AcademySubscription['status']> = {
    trial: 'trial',
    discovery: 'discovery',
    full: 'active',
    suspended: 'cancelled',
    cancelled: 'cancelled',
    past_due: 'past_due',
  };
  return {
    academyId: a.academyId,
    planSlug: mapTierToSlug(a.tierId),
    status: statusMap[a.status],
    createdAt: a.trialStartedAt,
    trialEndsAt: a.trialEndsAt,
    discoveryEndsAt: a.discoveryEndsAt,
    paidModules: a.modulosAtivos as ModuleId[],
  };
}

function mapTierToSlug(tierId: string): string {
  const map: Record<string, string> = {
    'tier-1': 'starter',
    'tier-2': 'essencial',
    'tier-3': 'pro',
    'tier-4': 'blackbelt',
    'tier-5': 'enterprise',
  };
  return map[tierId] || 'pro';
}

// ── Context ──

interface PlanContextValue {
  subscription: AcademySubscription | null;
  plan: PlanDefinition | null;
  loading: boolean;

  isTrial: boolean;
  isDiscovery: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCancelled: boolean;

  trialDaysLeft: number;
  discoveryDaysLeft: number;

  hasAccess: (module: ModuleId) => boolean;
  getAccessStatus: (module: ModuleId) => AccessStatus;
  checkPage: (pathname: string) => AccessStatus;

  maxStudents: number;
  currentStudents: number;
  studentsUsagePercent: number;
  isAtStudentLimit: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuthContext();
  const [subscription, setSubscription] = useState<AcademySubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // SuperAdmin bypass — never blocked
  const isSuperAdmin = profile?.role === 'superadmin';

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        if (!academyId) {
          setSubscription(MOCK_SUBSCRIPTION);
          setLoading(false);
          return;
        }
        const assinatura = await getAssinatura(academyId);
        if (assinatura) {
          setSubscription(assinaturaSaaSToSubscription(assinatura));
        } else {
          setSubscription(MOCK_SUBSCRIPTION);
        }
      } catch {
        setSubscription(MOCK_SUBSCRIPTION);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const plan = subscription
    ? PLANS.find((p) => p.slug === subscription.planSlug) || PLANS[0]
    : null;

  const now = new Date();
  const trialEnd = subscription ? new Date(subscription.trialEndsAt) : now;
  const discoveryEnd = subscription ? new Date(subscription.discoveryEndsAt) : now;

  const trialDaysLeft = subscription
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const discoveryDaysLeft = subscription
    ? Math.max(0, Math.ceil((discoveryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrial = subscription?.status === 'trial' && now < trialEnd;
  const isDiscovery = (subscription?.status === 'discovery' || subscription?.status === 'active') && now < discoveryEnd && !isTrial;
  const isActive = subscription?.status === 'active' && now >= discoveryEnd;
  const isPastDue = subscription?.status === 'past_due';
  const isCancelled = subscription?.status === 'cancelled';

  const hasAccess = useCallback(
    (module: ModuleId): boolean => {
      if (isSuperAdmin) return true;
      if (!subscription) return true;
      return checkAccess(subscription, module).allowed;
    },
    [subscription, isSuperAdmin],
  );

  const getAccessStatusCb = useCallback(
    (module: ModuleId): AccessStatus => {
      if (isSuperAdmin) {
        return {
          allowed: true,
          reason: 'superadmin_bypass',
          currentPlan: plan,
          requiredPlan: null,
          trialEndsAt: null,
          discoveryEndsAt: null,
          trialDaysLeft: 0,
          discoveryDaysLeft: 0,
          message: 'SuperAdmin — acesso total.',
        };
      }
      if (!subscription) {
        return {
          allowed: true,
          reason: 'plan_includes',
          currentPlan: null,
          requiredPlan: null,
          trialEndsAt: null,
          discoveryEndsAt: null,
          trialDaysLeft: 0,
          discoveryDaysLeft: 0,
          message: 'Carregando...',
        };
      }
      return checkAccess(subscription, module);
    },
    [subscription, isSuperAdmin, plan],
  );

  const checkPage = useCallback(
    (pathname: string): AccessStatus => {
      if (isSuperAdmin) {
        return {
          allowed: true,
          reason: 'superadmin_bypass',
          currentPlan: plan,
          requiredPlan: null,
          trialEndsAt: null,
          discoveryEndsAt: null,
          trialDaysLeft: 0,
          discoveryDaysLeft: 0,
          message: 'SuperAdmin — acesso total.',
        };
      }
      if (!subscription) {
        return {
          allowed: true,
          reason: 'plan_includes',
          currentPlan: null,
          requiredPlan: null,
          trialEndsAt: null,
          discoveryEndsAt: null,
          trialDaysLeft: 0,
          discoveryDaysLeft: 0,
          message: 'Carregando...',
        };
      }
      return checkPageAccess(subscription, pathname);
    },
    [subscription, isSuperAdmin, plan],
  );

  const maxStudents = plan?.maxStudents ?? 999;
  const currentStudents = 45; // mock — will come from API
  const studentsUsagePercent = Math.round((currentStudents / maxStudents) * 100);
  const isAtStudentLimit = currentStudents >= maxStudents;

  return (
    <PlanContext.Provider
      value={{
        subscription,
        plan,
        loading,
        isTrial,
        isDiscovery,
        isActive,
        isPastDue,
        isCancelled,
        trialDaysLeft,
        discoveryDaysLeft,
        hasAccess,
        getAccessStatus: getAccessStatusCb,
        checkPage,
        maxStudents,
        currentStudents,
        studentsUsagePercent,
        isAtStudentLimit,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlanContext(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
