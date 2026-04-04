import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant = 'active' | 'inactive' | 'pending' | 'belt';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  beltColor?: string;
}

const variantStyles: Record<Exclude<BadgeVariant, 'belt'>, string> = {
  active: 'bg-bb-success/10 text-bb-success',
  inactive: 'bg-bb-gray-100 text-bb-gray-500',
  pending: 'bg-bb-warning/10 text-bb-warning',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'active', size = 'sm', beltColor, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-pill font-medium',
        sizeStyles[size],
        variant === 'belt' && beltColor
          ? `text-bb-white`
          : variantStyles[variant as Exclude<BadgeVariant, 'belt'>],
        className,
      )}
      style={variant === 'belt' && beltColor ? { backgroundColor: beltColor } : undefined}
      {...props}
    >
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';
