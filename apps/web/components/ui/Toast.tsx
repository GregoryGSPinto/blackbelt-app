'use client';

import { forwardRef, useEffect, type HTMLAttributes, type CSSProperties } from 'react';
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

const contextualBorderColor: Record<ToastVariant, string> = {
  success: 'var(--bb-success)',
  error: 'var(--bb-brand)',
  warning: 'var(--bb-warning)',
  info: 'var(--bb-info)',
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'info', className, children, style, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'cursor-pointer px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90',
        className,
      )}
      style={{
        backgroundColor: 'var(--bb-depth-3)',
        border: '1px solid var(--bb-glass-border)',
        borderLeft: `3px solid ${contextualBorderColor[variant]}`,
        borderRadius: 'var(--bb-radius-md)',
        boxShadow: 'var(--bb-shadow-lg)',
        color: 'var(--bb-ink-100)',
        animation: 'slideInRight 0.3s ease-out',
        ...style,
      } as CSSProperties}
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
    <div aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <AutoDismissToast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
