'use client';

import { forwardRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

function AlertTriangleIcon({ size = 24, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const containerStyle: CSSProperties = {
  backgroundColor: 'var(--bb-depth-3)',
  borderRadius: 'var(--bb-radius-lg)',
  border: '1px solid var(--bb-glass-border)',
};

const iconWrapperStyle: CSSProperties = {
  backgroundColor: 'var(--bb-brand-surface)',
  borderRadius: 'var(--bb-radius-full)',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: CSSProperties = {
  color: 'var(--bb-ink-100)',
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const descriptionStyle: CSSProperties = {
  color: 'var(--bb-ink-60)',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  maxWidth: 360,
};

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Algo deu errado',
      description = 'Ocorreu um erro inesperado. Tente novamente.',
      onRetry,
      className,
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center gap-4 px-6 py-12 text-center', className)}
      style={containerStyle}
      role="alert"
    >
      <div style={iconWrapperStyle}>
        <AlertTriangleIcon size={28} style={{ color: 'var(--bb-error)' }} />
      </div>

      <div className="space-y-1">
        <h3 style={titleStyle}>{title}</h3>
        <p style={descriptionStyle} className="mx-auto">
          {description}
        </p>
      </div>

      {onRetry && (
        <Button variant="primary" size="md" onClick={onRetry} className="mt-2">
          Tentar novamente
        </Button>
      )}
    </div>
  ),
);
ErrorState.displayName = 'ErrorState';
