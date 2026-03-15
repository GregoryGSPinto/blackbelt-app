import { cn } from '@/lib/utils/cn';

// ─── Shimmer Base ───────────────────────────────────────────

interface ShimmerProps {
  className?: string;
}

function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-bb-gray-300',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-bb-white/60 before:to-transparent',
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Card Skeleton ──────────────────────────────────────────

interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function CardSkeleton({ lines = 3, showAvatar = false, className }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg bg-bb-white p-4', className)}>
      {showAvatar && (
        <div className="mb-3 flex items-center gap-3">
          <Shimmer className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-3 w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Shimmer
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-3/5' : 'w-full')}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, cols = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg bg-bb-white', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b border-bb-gray-300 bg-bb-gray-100 px-4 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-bb-gray-100 px-4 py-3"
        >
          {Array.from({ length: cols }, (_, colIdx) => (
            <Shimmer
              key={colIdx}
              className={cn(
                'h-4 flex-1',
                colIdx === 0 ? 'w-1/4' : '',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── List Skeleton ──────────────────────────────────────────

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({ items = 5, showAvatar = true, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-bb-white p-4">
          {showAvatar && <Shimmer className="h-10 w-10 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
          <Shimmer className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Skeleton ─────────────────────────────────────

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Page title */}
      <Shimmer className="h-8 w-48" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg bg-bb-white p-4">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="mt-2 h-8 w-16" />
            <Shimmer className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-lg bg-bb-white p-4">
        <Shimmer className="mb-4 h-5 w-32" />
        <Shimmer className="h-48 w-full rounded-lg" />
      </div>

      {/* Table */}
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}

// ─── Stat Card Skeleton ─────────────────────────────────────

interface StatCardSkeletonProps {
  className?: string;
}

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div className={cn('rounded-lg bg-bb-white p-4', className)}>
      <Shimmer className="h-3 w-20" />
      <Shimmer className="mt-2 h-8 w-16" />
    </div>
  );
}
