'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'danger',
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const confirmBg = variant === 'danger' ? 'var(--bb-danger)' : 'var(--bb-warning)';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: 'var(--bb-depth-2)' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--bb-ink-1)' }}
        >
          {title}
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--bb-ink-3)' }}
        >
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            aria-label="Cancelar"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bb-depth-1)',
              color: 'var(--bb-ink-2)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            aria-label={confirmLabel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: confirmBg, color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
