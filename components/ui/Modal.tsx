'use client';

import { forwardRef, useEffect, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type ModalVariant = 'default' | 'confirm' | 'fullscreen';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title?: string;
}

const containerStyles: Record<ModalVariant, string> = {
  default: 'max-w-lg rounded-lg',
  confirm: 'max-w-md rounded-lg border-l-4 border-bb-error',
  fullscreen: 'h-full w-full',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, variant = 'default', title, className, children, ...props }, ref) => {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-bb-black/50" onClick={onClose} aria-hidden="true" />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            'relative z-50 w-full bg-bb-white p-6 shadow-xl',
            containerStyles[variant],
            className,
          )}
          {...props}
        >
          {title && <h2 className="mb-4 text-lg font-semibold text-bb-gray-900">{title}</h2>}
          {children}
        </div>
      </div>
    );
  },
);
Modal.displayName = 'Modal';
