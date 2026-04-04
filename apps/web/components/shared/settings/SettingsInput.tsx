'use client';

import { forwardRef, useState, useEffect, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SettingsInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  value: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  placeholder?: string;
  onSave: (value: string) => void;
  validation?: (value: string) => string | null;
  readOnly?: boolean;
  suffix?: string;
}

export const SettingsInput = forwardRef<HTMLDivElement, SettingsInputProps>(
  (
    {
      label,
      value,
      type = 'text',
      placeholder,
      onSave,
      validation,
      readOnly = false,
      suffix,
      className,
      ...props
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = useState(value);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
      setLocalValue(value);
      setDirty(false);
      setError(null);
    }, [value]);

    function handleChange(newValue: string) {
      setLocalValue(newValue);
      setDirty(newValue !== value);
      if (error) setError(null);
    }

    function handleSave() {
      if (validation) {
        const validationError = validation(localValue);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
      onSave(localValue);
      setDirty(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter' && dirty) {
        handleSave();
      }
      if (e.key === 'Escape') {
        setLocalValue(value);
        setDirty(false);
        setError(null);
      }
    }

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div ref={ref} className={cn('py-2', className)} {...props}>
        <label
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--bb-ink-80)' }}
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={inputType}
              value={localValue}
              placeholder={placeholder}
              readOnly={readOnly}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'h-11 w-full rounded-lg px-3 text-sm transition-all duration-200',
                'focus-visible:outline-none',
                readOnly && 'cursor-not-allowed opacity-70',
              )}
              style={{
                backgroundColor: 'var(--bb-depth-5)',
                border: error
                  ? '1px solid #ef4444'
                  : '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                color: 'var(--bb-ink-100)',
                paddingRight: type === 'password' ? 40 : suffix ? 48 : 12,
              }}
            />
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--bb-ink-40)' }}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            )}
            {suffix && type !== 'password' && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {suffix}
              </span>
            )}
          </div>
          {dirty && !readOnly && (
            <button
              type="button"
              onClick={handleSave}
              className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: 'var(--bb-brand)',
                borderRadius: 'var(--bb-radius-md)',
              }}
            >
              Salvar
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
SettingsInput.displayName = 'SettingsInput';
