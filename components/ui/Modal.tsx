'use client';

import { forwardRef, useEffect, type HTMLAttributes, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

export type ModalVariant = 'default' | 'confirm' | 'fullscreen';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title?: string;
}

const containerClasses: Record<ModalVariant, string> = {
  default: 'max-w-lg',
  confirm: 'max-w-md',
  fullscreen: 'h-full w-full',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, variant = 'default', title, className, children, style, ...props }, ref) => {
    useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Card */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            'relative z-50 w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto',
            containerClasses[variant],
            className,
          )}
          style={{
            backgroundColor: 'var(--bb-depth-3)',
            border: variant === 'confirm'
              ? '1px solid var(--bb-glass-border)'
              : '1px solid var(--bb-glass-border)',
            borderLeft: variant === 'confirm'
              ? '4px solid var(--bb-error)'
              : '1px solid var(--bb-glass-border)',
            borderRadius: variant === 'fullscreen' ? undefined : 'var(--bb-radius-xl)',
            boxShadow: 'var(--bb-shadow-xl)',
            animation: 'scaleIn 0.25s ease-out',
            ...style,
          } as CSSProperties}
          {...props}
        >
          {title && (
            <h2
              className="mb-4 text-lg font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    );
  },
);
Modal.displayName = 'Modal';
