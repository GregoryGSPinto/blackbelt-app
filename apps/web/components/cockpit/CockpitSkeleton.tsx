'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function CockpitSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* KPI cards grid — 2 columns on mobile, 3 on larger */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Row skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="table-row" />
        ))}
      </div>
    </div>
  );
}
