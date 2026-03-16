import { forwardRef, type InputHTMLAttributes, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

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
          type={type}
          className={cn(
            'h-12 w-full px-3 text-sm transition-all duration-200',
            'focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          style={{
            backgroundColor: 'var(--bb-depth-5)',
            border: error ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
            color: 'var(--bb-ink-100)',
            ...style,
          } as CSSProperties}
          onFocus={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = 'var(--bb-brand)';
            el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = error ? 'var(--bb-brand)' : 'var(--bb-glass-border)';
            el.style.boxShadow = '';
            props.onBlur?.(e);
          }}
          placeholder={props.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs"
            style={{ color: 'var(--bb-brand)' }}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className="text-xs"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
