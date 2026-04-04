'use client';

import { forwardRef, type HTMLAttributes, type ComponentType, type SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

/** Accepts any SVG icon component (e.g. from components/shell/icons). */
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** SVG icon component rendered at 48x48 inside a rounded circle. */
  icon: IconComponent;
  /** Main heading shown below the icon. */
  title: string;
  /** Supporting text shown below the heading. */
  description: string;
  /** Optional label for an action button. Requires `onAction`. */
  actionLabel?: string;
  /** Callback fired when the action button is clicked. */
  onAction?: () => void;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, actionLabel, onAction, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bb-gray-100">
        <Icon className="h-10 w-10 text-bb-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-bb-gray-900">{title}</h3>

      <p className="mt-2 max-w-sm text-sm text-bb-gray-500">{description}</p>

      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';
