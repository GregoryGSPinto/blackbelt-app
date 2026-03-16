import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: '',
  ghost: '',
  danger: 'text-white',
};

const variantInlineStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--bb-brand-gradient)',
  },
  secondary: {
    backgroundColor: 'var(--bb-depth-4)',
    color: 'var(--bb-ink-100)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--bb-ink-60)',
  },
  danger: {
    backgroundColor: 'var(--bb-error)',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, style, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'bb-button inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeStyles[size],
        className,
      )}
      style={{
        borderRadius: 'var(--bb-radius-md)',
        '--bb-focus-ring': 'var(--bb-brand)',
        ...variantInlineStyles[variant],
        ...style,
      } as CSSProperties}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.boxShadow = 'var(--bb-brand-glow)';
          el.style.transform = 'translateY(-1px)';
        } else if (variant === 'secondary') {
          el.style.backgroundColor = 'var(--bb-depth-5)';
        } else if (variant === 'ghost') {
          el.style.backgroundColor = 'var(--bb-depth-4)';
          el.style.color = 'var(--bb-ink-80)';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.boxShadow = '';
          el.style.transform = '';
        } else if (variant === 'secondary') {
          el.style.backgroundColor = 'var(--bb-depth-4)';
        } else if (variant === 'ghost') {
          el.style.backgroundColor = 'transparent';
          el.style.color = 'var(--bb-ink-60)';
        }
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.transform = 'translateY(0)';
          el.style.filter = 'brightness(0.9)';
        }
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.transform = 'translateY(-1px)';
          el.style.filter = '';
        }
        props.onMouseUp?.(e);
      }}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
