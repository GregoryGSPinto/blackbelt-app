import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type BeltColor = 'white' | 'gray' | 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'brown' | 'black';

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

export interface BeltStripeProps extends HTMLAttributes<HTMLDivElement> {
  color: BeltColor;
  height?: number;
}

export const BeltStripe = forwardRef<HTMLDivElement, BeltStripeProps>(
  ({ color, height = 3, className, style, ...props }, ref) => {
    const cssColor = BELT_CSS_VAR[color];
    return (
      <div
        ref={ref}
        className={cn('w-full rounded-full', className)}
        style={{
          height,
          background: `linear-gradient(90deg, transparent, ${cssColor} 15%, ${cssColor} 85%, transparent)`,
          boxShadow: `0 1px 8px ${cssColor}33`,
          ...style,
        }}
        {...props}
      />
    );
  },
);
BeltStripe.displayName = 'BeltStripe';
