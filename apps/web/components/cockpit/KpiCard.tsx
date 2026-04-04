'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function KpiCard({ title, value, delta, icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  const deltaPositive = delta !== undefined && delta >= 0;
  const deltaColor = deltaPositive ? 'var(--bb-success)' : 'var(--bb-danger)';

  return (
    <div
      className="relative rounded-xl p-4"
      style={{ background: 'var(--bb-depth-2)' }}
    >
      {icon && (
        <div
          className="absolute top-4 right-4"
          style={{ color: 'var(--bb-ink-3)' }}
        >
          {icon}
        </div>
      )}
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: 'var(--bb-ink-3)' }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ color: 'var(--bb-ink-1)' }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {deltaPositive ? (
            <ArrowUp className="h-3 w-3" style={{ color: deltaColor }} />
          ) : (
            <ArrowDown className="h-3 w-3" style={{ color: deltaColor }} />
          )}
          <span className="text-xs font-medium" style={{ color: deltaColor }}>
            {Math.abs(delta)}%
          </span>
        </div>
      )}
    </div>
  );
}
