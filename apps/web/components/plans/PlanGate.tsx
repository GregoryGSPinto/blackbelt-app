'use client';

import { forwardRef } from 'react';
import { usePlan } from '@/lib/hooks/usePlan';
import type { ModuleId } from '@/lib/plans/module-access';
import { UpgradeScreen } from './UpgradeScreen';
import { DiscoveryBanner } from './DiscoveryBanner';

interface PlanGateProps {
  module: ModuleId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PlanGate = forwardRef<HTMLDivElement, PlanGateProps>(
  function PlanGate({ module, children, fallback }, ref) {
    const { getAccessStatus, loading, isDiscovery, discoveryDaysLeft } = usePlan();

    if (loading) {
      return (
        <div ref={ref} className="flex min-h-[40vh] items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }}
          />
        </div>
      );
    }

    const status = getAccessStatus(module);

    if (!status.allowed) {
      if (fallback) return <div ref={ref}>{fallback}</div>;
      return (
        <UpgradeScreen
          module={module}
          currentPlan={status.currentPlan}
          requiredPlan={status.requiredPlan}
        />
      );
    }

    return (
      <div ref={ref}>
        {isDiscovery && status.reason === 'discovery_active' && (
          <DiscoveryBanner daysLeft={discoveryDaysLeft} variant="member" />
        )}
        {children}
      </div>
    );
  },
);

PlanGate.displayName = 'PlanGate';

export { PlanGate };
