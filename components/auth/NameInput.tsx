'use client';

import {
  forwardRef,
  useCallback,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils/cn';

export interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
}

function capitalizeWords(text: string): string {
  // Collapse multiple spaces into one, then capitalize each word
  return text
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
  // Check if the name contains at least one letter
  if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) {
    return 'Nome deve conter letras';
  }
  return null;
}

export const NameInput = forwardRef<HTMLInputElement, NameInputProps>(
  ({ value, onChange, error, label, disabled, id, className, placeholder }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'name';

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const capitalized = capitalizeWords(raw);
        onChange(capitalized);
      },
      [onChange],
    );

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
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || 'Nome completo'}
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
NameInput.displayName = 'NameInput';
