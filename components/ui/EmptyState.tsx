'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonProps } from './Button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'first-time';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  actionProps?: Omit<ButtonProps, 'children' | 'onClick'>;
}

const VARIANT_DEFAULTS: Record<EmptyStateVariant, { icon: string }> = {
  default: { icon: '\uD83D\uDCE6' },      // package emoji
  search: { icon: '\uD83D\uDD0D' },        // magnifying glass
  error: { icon: '\u26A0\uFE0F' },          // warning
  'first-time': { icon: '\uD83D\uDE80' },  // rocket
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      actionLabel,
      actionHref,
      onAction,
      variant = 'default',
      actionProps,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const resolvedIcon = icon ?? VARIANT_DEFAULTS[variant].icon;

    const renderAction = () => {
      if (!actionLabel) return null;

      if (actionHref) {
        return (
          <Link href={actionHref} style={{ marginTop: 16 }}>
            <Button {...actionProps}>{actionLabel}</Button>
          </Link>
        );
      }

      if (onAction) {
        return (
          <Button
            style={{ marginTop: 16 }}
            onClick={onAction}
            {...actionProps}
          >
            {actionLabel}
          </Button>
        );
      }

      return null;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className,
        )}
        style={{
          borderRadius: 'var(--bb-radius-lg, 12px)',
          ...style,
        }}
        {...props}
      >
        {/* Large icon */}
        <div
          style={{
            fontSize: 48,
            lineHeight: 1,
            marginBottom: 16,
            color: 'var(--bb-ink-40)',
          }}
        >
          {resolvedIcon}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--bb-ink-100)',
            margin: 0,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            style={{
              marginTop: 4,
              maxWidth: 320,
              fontSize: 14,
              color: 'var(--bb-ink-60)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}

        {/* Action */}
        {renderAction()}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
