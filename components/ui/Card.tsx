import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'accent' | 'glow' | 'glass';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, className, children, style, ...props }, ref) => {
    const base = 'rounded-[var(--bb-radius-lg)] p-6 transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]';

    const interactiveStyles = interactive
      ? 'cursor-pointer hover:border-[var(--bb-glass-border-hover)] hover:shadow-[var(--bb-shadow-sm)] hover:-translate-y-0.5'
      : '';

    const variants: Record<CardVariant, string> = {
      default: 'bg-[var(--bb-depth-3)] border border-[var(--bb-glass-border)]',
      elevated: 'bg-[var(--bb-depth-3)] border border-[var(--bb-glass-border)] shadow-[var(--bb-shadow-md)]',
      outlined: 'bg-transparent border border-[var(--bb-glass-border)]',
      accent: 'bg-[var(--bb-depth-3)] border border-[var(--bb-glass-border)]',
      glow: 'bg-[var(--bb-brand-surface)] border border-[var(--bb-brand)]',
      glass: 'border border-[var(--bb-glass-border)] backdrop-blur-[16px] backdrop-saturate-[1.2]',
    };

    const glowShadow = variant === 'glow' ? { boxShadow: 'var(--bb-brand-glow)' } : {};
    const glassStyle = variant === 'glass' ? { background: 'var(--bb-glass)' } : {};

    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], interactiveStyles, className)}
        style={{ ...glowShadow, ...glassStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
