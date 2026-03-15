'use client';

import { forwardRef, useEffect, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-bb-success text-bb-white',
  error: 'bg-bb-error text-bb-white',
  warning: 'bg-bb-warning text-bb-white',
  info: 'bg-bb-info text-bb-white',
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'info', className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'cursor-pointer rounded-md px-4 py-3 text-sm font-medium shadow-lg transition-opacity hover:opacity-90',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Toast.displayName = 'Toast';

export interface ToasterProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

function AutoDismissToast({
  item,
  onDismiss,
}: {
  item: ToastData;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 4000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <Toast variant={item.variant} onClick={() => onDismiss(item.id)}>
      {item.message}
    </Toast>
  );
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <AutoDismissToast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
