'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

// ── Types ────────────────────────────────────────────────────────────

export interface DangerItem {
  label: string;
  description: string;
  action: () => void | Promise<void>;
  confirmText?: string;
}

export interface DangerZoneProps extends HTMLAttributes<HTMLDivElement> {
  items: DangerItem[];
}

// ── Confirm Modal ────────────────────────────────────────────────────

function ConfirmModal({
  item,
  onClose,
}: {
  item: DangerItem;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const canConfirm = !item.confirmText || input === item.confirmText;

  async function handleConfirm() {
    setLoading(true);
    try {
      await item.action();
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-md animate-reveal"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--bb-radius-lg)',
          padding: 24,
        }}
      >
        {/* Warning icon */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center flex-shrink-0"
            style={{ borderRadius: '50%', background: 'rgba(239,68,68,0.15)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold" style={{ color: '#ef4444' }}>
              {item.label}
            </h3>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {item.description}
            </p>
          </div>
        </div>

        {/* Confirm text input */}
        {item.confirmText && (
          <div className="mb-4">
            <p className="mb-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              Para confirmar, digite{' '}
              <strong style={{ color: '#ef4444' }}>{item.confirmText}</strong>
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={item.confirmText}
              className="h-11 w-full px-3 text-sm"
              style={{
                backgroundColor: 'var(--bb-depth-5)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                color: 'var(--bb-ink-100)',
              }}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--bb-depth-4)',
              borderRadius: 'var(--bb-radius-md)',
              color: 'var(--bb-ink-80)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="px-4 py-2 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#ef4444',
              borderRadius: 'var(--bb-radius-md)',
            }}
          >
            {loading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DangerZone Component ─────────────────────────────────────────────

export const DangerZone = forwardRef<HTMLDivElement, DangerZoneProps>(
  ({ items, className, ...rest }, ref) => {
    const [activeItem, setActiveItem] = useState<DangerItem | null>(null);

    return (
      <>
        <div
          ref={ref}
          className={cn('overflow-hidden', className)}
          {...rest}
          style={{
            background: 'var(--bb-depth-3)',
            border: '2px solid rgba(239,68,68,0.4)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 p-4 sm:p-5">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="font-display text-sm font-semibold" style={{ color: '#ef4444' }}>
              Zona de Perigo
            </h2>
          </div>

          {/* Items */}
          <div>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
                style={{
                  borderTop: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (item.confirmText) {
                      setActiveItem(item);
                    } else {
                      item.action();
                    }
                  }}
                  className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: '#ef4444',
                    borderRadius: 'var(--bb-radius-md)',
                  }}
                >
                  {item.label.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {activeItem && (
          <ConfirmModal
            item={activeItem}
            onClose={() => setActiveItem(null)}
          />
        )}
      </>
    );
  },
);
DangerZone.displayName = 'DangerZone';
