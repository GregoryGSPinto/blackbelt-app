'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils/cn';

export type AgeCategory = 'kids' | 'teen' | 'adulto' | 'invalid';

export interface AgeInfo {
  age: number;
  category: AgeCategory;
}

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  onAgeInfo?: (info: AgeInfo) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function extractDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8);
}

function parseDate(digits: string): Date | null {
  if (digits.length !== 8) return null;

  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  // Validate the date is real (handles months with fewer days)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function getCategory(age: number): AgeCategory {
  if (age < 7 || age > 100) return 'invalid';
  if (age <= 12) return 'kids';
  if (age <= 17) return 'teen';
  return 'adulto';
}

function getCategoryLabel(category: AgeCategory): string | null {
  switch (category) {
    case 'kids':
      return 'Kids (7-12 anos)';
    case 'teen':
      return 'Teen (13-17 anos)';
    case 'adulto':
      return 'Adulto (18+)';
    default:
      return null;
  }
}

function getCategoryColor(category: AgeCategory): string {
  switch (category) {
    case 'kids':
      return 'var(--bb-info, #3b82f6)';
    case 'teen':
      return 'var(--bb-warning, #f59e0b)';
    case 'adulto':
      return 'var(--bb-success, #22c55e)';
    default:
      return 'var(--bb-ink-60)';
  }
}

export function validateDate(digits: string): string | null {
  if (digits.length === 0) return null;
  if (digits.length < 8) return 'Data incompleta';

  const date = parseDate(digits);
  if (!date) return 'Data invalida';

  if (date > new Date()) return 'Data nao pode ser no futuro';

  const age = calculateAge(date);
  if (age < 7) return 'O BlackBelt e para criancas a partir de 7 anos';
  if (age > 100) return 'Verifique a data de nascimento';

  return null;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, onAgeInfo, error, label, disabled, id, className }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'date';

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const digits = extractDigits(e.target.value);
        onChange(digits);
      },
      [onChange],
    );

    // Calculate age info when value is a complete date
    useEffect(() => {
      if (!onAgeInfo) return;
      if (value.length !== 8) return;

      const date = parseDate(value);
      if (!date) {
        onAgeInfo({ age: 0, category: 'invalid' });
        return;
      }

      const age = calculateAge(date);
      const category = getCategory(age);
      onAgeInfo({ age, category });
    }, [value, onAgeInfo]);

    const displayValue = formatDateMask(value);

    // Compute age display
    let ageDisplay: { text: string; color: string } | null = null;
    if (value.length === 8) {
      const date = parseDate(value);
      if (date && date <= new Date()) {
        const age = calculateAge(date);
        const category = getCategory(age);
        const categoryLabel = getCategoryLabel(category);
        if (categoryLabel) {
          ageDisplay = {
            text: `${age} anos - ${categoryLabel}`,
            color: getCategoryColor(category),
          };
        }
      }
    }

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
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="DD/MM/AAAA"
          maxLength={10}
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
        {!error && ageDisplay && (
          <p
            className="text-xs font-medium"
            style={{ color: ageDisplay.color }}
          >
            {ageDisplay.text}
          </p>
        )}
      </div>
    );
  },
);
DateInput.displayName = 'DateInput';
