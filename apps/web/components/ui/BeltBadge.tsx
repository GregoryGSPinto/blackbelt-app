import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import type { BeltColor } from './BeltStripe';

const BELT_CSS_VAR: Record<BeltColor, string> = {
  white: 'var(--bb-belt-white)',
  gray: 'var(--bb-belt-gray)',
  yellow: 'var(--bb-belt-yellow)',
  orange: 'var(--bb-belt-orange)',
  green: 'var(--bb-belt-green)',
  blue: 'var(--bb-belt-blue)',
  purple: 'var(--bb-belt-purple)',
  brown: 'var(--bb-belt-brown)',
  black: 'var(--bb-belt-black)',
};

const BELT_NAMES: Record<BeltColor, string> = {
  white: 'Branca', gray: 'Cinza', yellow: 'Amarela', orange: 'Laranja',
  green: 'Verde', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
};

export type BeltBadgeSize = 'sm' | 'md' | 'lg';

export interface BeltBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color: BeltColor;
  size?: BeltBadgeSize;
  showLabel?: boolean;
}

const sizeClasses: Record<BeltBadgeSize, { badge: string; stripe: string; text: string }> = {
  sm: { badge: 'h-5 gap-1.5 px-2', stripe: 'w-3 h-1.5', text: 'text-[10px]' },
  md: { badge: 'h-7 gap-2 px-3', stripe: 'w-4 h-2', text: 'text-xs' },
  lg: { badge: 'h-9 gap-2.5 px-4', stripe: 'w-5 h-2.5', text: 'text-sm' },
};

export const BeltBadge = forwardRef<HTMLSpanElement, BeltBadgeProps>(
  ({ color, size = 'md', showLabel = true, className, ...props }, ref) => {
    const cssColor = BELT_CSS_VAR[color];
    const s = sizeClasses[size];

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full font-medium', s.badge, className)}
        style={{
          background: `${cssColor}15`,
          border: `1px solid ${cssColor}30`,
        }}
        title={`Faixa ${BELT_NAMES[color]}`}
        {...props}
      >
        <span
          className={cn('rounded-sm', s.stripe)}
          style={{
            background: cssColor,
            boxShadow: `0 0 6px ${cssColor}40`,
          }}
        />
        {showLabel && (
          <span className={cn('font-semibold', s.text)} style={{ color: cssColor }}>
            {BELT_NAMES[color]}
          </span>
        )}
      </span>
    );
  },
);
BeltBadge.displayName = 'BeltBadge';
