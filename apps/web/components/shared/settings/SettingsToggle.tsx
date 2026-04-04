'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SettingsToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggle = forwardRef<HTMLDivElement, SettingsToggleProps>(
  ({ label, description, enabled, onChange, disabled = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-4 py-3',
          disabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {label}
          </p>
          {description && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          disabled={disabled}
          onClick={() => !disabled && onChange(!enabled)}
          className="relative inline-flex flex-shrink-0 items-center transition-colors duration-200"
          style={{
            width: 48,
            height: 28,
            borderRadius: 9999,
            background: enabled ? '#16a34a' : 'var(--bb-ink-20)',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <span
            className="inline-block transition-transform duration-200"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              transform: enabled ? 'translateX(22px)' : 'translateX(3px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>
    );
  },
);
SettingsToggle.displayName = 'SettingsToggle';
