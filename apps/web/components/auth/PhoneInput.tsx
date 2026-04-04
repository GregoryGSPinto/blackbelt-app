'use client';

import {
  forwardRef,
  useCallback,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils/cn';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  // Remove country code 55 if pasted with it
  const normalized =
    digits.length > 11 && digits.startsWith('55')
      ? digits.slice(2)
      : digits;

  const d = normalized.slice(0, 11);

  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function extractDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 11 && digits.startsWith('55')) {
    return digits.slice(2, 13);
  }
  return digits.slice(0, 11);
}

export function validatePhone(digits: string): string | null {
  if (digits.length === 0) return null;
  if (digits.length < 10) return 'Telefone incompleto';
  if (digits.length > 11) return 'Telefone invalido';
  return null;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, label, disabled, id, className }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'phone';

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const digits = extractDigits(e.target.value);
        onChange(digits);
      },
      [onChange],
    );

    const displayValue = formatPhone(value);

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
        <input
          ref={ref}
          id={inputId}
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="(11) 99999-9999"
          className={cn(
            'h-12 w-full px-3 text-sm transition-all duration-200',
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
            } as CSSProperties
          }
          onFocus={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'var(--bb-brand)';
            el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
          }}
          onBlur={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = error
              ? 'var(--bb-error)'
              : 'var(--bb-glass-border)';
            el.style.boxShadow = '';
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
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
PhoneInput.displayName = 'PhoneInput';
