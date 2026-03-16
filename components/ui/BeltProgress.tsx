'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
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

export interface BeltProgressProps extends HTMLAttributes<HTMLDivElement> {
  current: BeltColor;
  next: BeltColor;
  progress: number;
  tooltip?: string;
}

export const BeltProgress = forwardRef<HTMLDivElement, BeltProgressProps>(
  ({ current, next, progress, tooltip, className, ...props }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const currentColor = BELT_CSS_VAR[current];
    const nextColor = BELT_CSS_VAR[next];
    const pct = Math.min(100, Math.max(0, progress));
    const label = tooltip || `${BELT_NAMES[current]} \u2192 ${BELT_NAMES[next]} \u00B7 ${Math.round(pct)}%`;

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          className="relative h-3 overflow-hidden rounded-full"
          style={{ background: `${currentColor}33` }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className="h-full rounded-full transition-[width] duration-1000"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${currentColor}, ${nextColor})`,
              boxShadow: `0 0 12px ${nextColor}40`,
              animation: 'beltFill 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
          {showTooltip && (
            <div
              className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1 text-xs"
              style={{
                background: 'var(--bb-depth-4)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                boxShadow: 'var(--bb-shadow-md)',
              }}
            >
              {label}
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          {BELT_NAMES[current]} &rarr; {BELT_NAMES[next]} &middot; {Math.round(pct)}%
        </p>
      </div>
    );
  },
);
BeltProgress.displayName = 'BeltProgress';
