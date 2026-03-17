'use client';

import { forwardRef } from 'react';

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'default';
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection?: () => void;
}

const BulkActionBar = forwardRef<HTMLDivElement, BulkActionBarProps>(
  function BulkActionBar({ selectedCount, actions, onClearSelection }, ref) {
    if (selectedCount === 0) return null;

    return (
      <div
        ref={ref}
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{
          background: 'var(--bb-depth-3)',
          borderTop: '1px solid var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-lg)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="text-xs transition-colors"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background:
                  action.variant === 'danger'
                    ? 'var(--bb-danger, #dc2626)'
                    : action.variant === 'primary'
                      ? 'var(--bb-brand)'
                      : 'var(--bb-depth-4)',
                color:
                  action.variant === 'default' || !action.variant
                    ? 'var(--bb-ink-80)'
                    : 'white',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  },
);

BulkActionBar.displayName = 'BulkActionBar';

export { BulkActionBar };
export type { BulkActionBarProps, BulkAction };
