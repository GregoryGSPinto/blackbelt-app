import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'table-row';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  circle: 'h-10 w-10 rounded-full',
  card: 'h-32 w-full rounded-lg',
  'table-row': 'h-12 w-full rounded-md',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse bg-bb-gray-300', variantStyles[variant], className)}
      aria-hidden="true"
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';
