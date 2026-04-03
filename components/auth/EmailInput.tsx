'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { isMock } from '@/lib/env';

export type EmailStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  checkExists?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  if (value.length === 0) return null;
  if (!EMAIL_REGEX.test(value)) return 'Email invalido';
  return null;
}

async function checkEmailExists(email: string): Promise<boolean> {
  if (isMock()) {
    // Simulate network delay in mock mode
    await new Promise((r) => setTimeout(r, 600));
    // In mock mode, treat these as "taken" for testing
    const takenEmails = ['admin@blackbeltv2.vercel.app', 'teste@teste.com'];
    return takenEmails.includes(email.toLowerCase());
  }

  const res = await fetch('/api/auth/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { exists: boolean };
  return data.exists;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value, onChange, error, label, checkExists = false, disabled, id, className }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'email';
    const [status, setStatus] = useState<EmailStatus>('idle');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().trim();
        onChange(val);
        setStatus('idle');
      },
      [onChange],
    );

    // Debounced email existence check
    useEffect(() => {
      if (!checkExists) return;
      if (value.length === 0) {
        setStatus('idle');
        return;
      }

      if (!EMAIL_REGEX.test(value)) {
        setStatus(value.length > 0 ? 'invalid' : 'idle');
        return;
      }

      // Cancel previous timers and requests
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();

      setStatus('checking');

      debounceRef.current = setTimeout(() => {
        const controller = new AbortController();
        abortRef.current = controller;

        checkEmailExists(value)
          .then((exists) => {
            if (!controller.signal.aborted) {
              setStatus(exists ? 'taken' : 'available');
            }
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              setStatus('idle');
            }
          });
      }, 500);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();
      };
    }, [value, checkExists]);

    const showTaken = status === 'taken';
    const showAvailable = status === 'available';
    const showChecking = status === 'checking';
    const showInvalid = status === 'invalid';

    const hasError = !!error || showTaken || showInvalid;

    function getStatusIcon() {
      if (showChecking) {
        return (
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: 'var(--bb-ink-60)' }}
          />
        );
      }
      if (showAvailable) {
        return (
          <Check
            className="h-4 w-4"
            style={{ color: 'var(--bb-success, #22c55e)' }}
          />
        );
      }
      if (showTaken || showInvalid) {
        return (
          <X
            className="h-4 w-4"
            style={{ color: 'var(--bb-error)' }}
          />
        );
      }
      return null;
    }

    function getHelperText(): string | null {
      if (error) return error;
      if (showTaken) {
        return 'Este email ja tem uma conta. Entrar ou Esqueci minha senha';
      }
      if (showInvalid) return 'Email invalido';
      return null;
    }

    const helperText = getHelperText();

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
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="seu@email.com"
            className={cn(
              'h-12 w-full pl-3 pr-10 text-sm transition-all duration-200',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            style={
              {
                backgroundColor: 'var(--bb-depth-2)',
                border: hasError
                  ? '1px solid var(--bb-error)'
                  : showAvailable
                    ? '1px solid var(--bb-success, #22c55e)'
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
              if (hasError) {
                el.style.borderColor = 'var(--bb-error)';
              } else if (showAvailable) {
                el.style.borderColor = 'var(--bb-success, #22c55e)';
              } else {
                el.style.borderColor = 'var(--bb-glass-border)';
              }
              el.style.boxShadow = '';
            }}
            aria-invalid={hasError}
            aria-describedby={helperText ? `${inputId}-error` : undefined}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </span>
        </div>
        {helperText && (
          <p
            id={`${inputId}-error`}
            className="text-xs"
            style={{ color: 'var(--bb-error)' }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
EmailInput.displayName = 'EmailInput';
