import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-bb-white',
  elevated: 'bg-bb-white shadow-lg',
  outlined: 'bg-bb-white border border-bb-gray-300',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg p-4', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';
