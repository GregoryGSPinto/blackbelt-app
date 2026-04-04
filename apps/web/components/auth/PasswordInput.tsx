'use client';

import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, style, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'password';

    const Icon = visible ? EyeOff : Eye;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={cn(
              'h-12 w-full pl-3 pr-10 text-sm transition-all duration-200',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            style={
              {
                backgroundColor: 'var(--bb-depth-2)',
                border: error
                  ? '1px solid var(--bb-error)'
                  : '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                color: 'var(--bb-ink-100)',
                ...style,
              } as CSSProperties
            }
            onFocus={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--bb-brand)';
              el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = error
                ? 'var(--bb-error)'
                : 'var(--bb-glass-border)';
              el.style.boxShadow = '';
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--bb-ink-60)' }}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs"
            style={{ color: 'var(--bb-error)' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
