import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonProps } from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionProps?: Omit<ButtonProps, 'children' | 'onClick'>;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, actionLabel, onAction, actionProps, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
      {...props}
    >
      {icon && <div className="mb-4 text-bb-gray-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-bb-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-bb-gray-500">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction} {...actionProps}>
          {actionLabel}
        </Button>
      )}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';
