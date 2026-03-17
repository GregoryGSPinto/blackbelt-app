'use client';

import { forwardRef, type CSSProperties } from 'react';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils/cn';

export type PageSkeletonVariant = 'dashboard' | 'list' | 'detail' | 'form';

export interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  className?: string;
}

// ─── Shared inline styles ────────────────────────────────────

const cardStyle: CSSProperties = {
  backgroundColor: 'var(--bb-depth-3)',
  borderRadius: 'var(--bb-radius-md)',
  padding: '16px',
};

const headerBarStyle: CSSProperties = {
  backgroundColor: 'var(--bb-depth-3)',
  borderRadius: 'var(--bb-radius-md)',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

// ─── Dashboard Variant ───────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={headerBarStyle}>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28" style={{ borderRadius: 'var(--bb-radius-md)' }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} style={cardStyle}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div style={cardStyle}>
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-48 w-full" style={{ borderRadius: 'var(--bb-radius-md)' }} />
      </div>

      {/* List */}
      <div style={cardStyle} className="space-y-3">
        <Skeleton className="h-5 w-28 mb-2" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── List Variant ────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div style={headerBarStyle}>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-24" style={{ borderRadius: 'var(--bb-radius-md)' }} />
      </div>

      {/* Filter bar */}
      <div
        className="flex flex-wrap gap-3"
        style={{
          backgroundColor: 'var(--bb-depth-3)',
          borderRadius: 'var(--bb-radius-md)',
          padding: '12px 16px',
        }}
      >
        <Skeleton className="h-9 w-48" style={{ borderRadius: 'var(--bb-radius-md)' }} />
        <Skeleton className="h-9 w-28" style={{ borderRadius: 'var(--bb-radius-md)' }} />
        <Skeleton className="h-9 w-28" style={{ borderRadius: 'var(--bb-radius-md)' }} />
      </div>

      {/* List items */}
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              ...cardStyle,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-6 w-16" style={{ borderRadius: 'var(--bb-radius-full)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Variant ──────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={headerBarStyle}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" style={{ borderRadius: 'var(--bb-radius-md)' }} />
          <Skeleton className="h-9 w-20" style={{ borderRadius: 'var(--bb-radius-md)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar info */}
        <div style={cardStyle} className="space-y-4 lg:col-span-1">
          <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={cardStyle} className="space-y-3">
              <Skeleton className="h-5 w-36 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Form Variant ────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={headerBarStyle}>
        <Skeleton className="h-7 w-44" />
      </div>

      {/* Form field groups */}
      {Array.from({ length: 3 }, (_, groupIdx) => (
        <div key={groupIdx} style={cardStyle} className="space-y-5">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: groupIdx === 2 ? 2 : 4 }, (_, fieldIdx) => (
              <div key={fieldIdx} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" style={{ borderRadius: 'var(--bb-radius-md)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Submit button */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" style={{ borderRadius: 'var(--bb-radius-md)' }} />
        <Skeleton className="h-10 w-32" style={{ borderRadius: 'var(--bb-radius-md)' }} />
      </div>
    </div>
  );
}

// ─── Map variant → component ─────────────────────────────────

const variantComponents: Record<PageSkeletonVariant, React.FC> = {
  dashboard: DashboardSkeleton,
  list: ListSkeleton,
  detail: DetailSkeleton,
  form: FormSkeleton,
};

// ─── PageSkeleton ────────────────────────────────────────────

export const PageSkeleton = forwardRef<HTMLDivElement, PageSkeletonProps>(
  ({ variant = 'dashboard', className }, ref) => {
    const VariantComponent = variantComponents[variant];

    return (
      <div
        ref={ref}
        className={cn('w-full p-4 sm:p-6', className)}
        role="status"
        aria-label="Carregando conteúdo"
      >
        <VariantComponent />
      </div>
    );
  },
);
PageSkeleton.displayName = 'PageSkeleton';
