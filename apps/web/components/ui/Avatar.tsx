'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  name?: string;
  src?: string | null;
  alt?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', name = '', src, alt, className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const showFallback = !src || hasError;

    if (showFallback) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full bg-bb-gray-300 font-medium text-bb-gray-700',
            sizeStyles[size],
            className,
          )}
          aria-label={name}
          {...props}
        >
          {getInitials(name) || '?'}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('relative shrink-0 overflow-hidden rounded-full', sizeStyles[size], className)}
        {...props}
      >
        <Image
          src={src}
          alt={alt || name}
          width={sizePx[size]}
          height={sizePx[size]}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
