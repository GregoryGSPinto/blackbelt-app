import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-bb-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'h-10 w-full rounded-md border px-3 text-sm transition-colors',
            'placeholder:text-bb-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-red focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-bb-error' : 'border-bb-gray-300',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-bb-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-bb-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
