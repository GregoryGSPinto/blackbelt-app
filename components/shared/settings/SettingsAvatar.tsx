'use client';

import { forwardRef, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SettingsAvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  src?: string;
  name: string;
  onUpload: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP: Record<string, { px: number; text: string }> = {
  sm: { px: 64, text: 'text-lg' },
  md: { px: 96, text: 'text-2xl' },
  lg: { px: 128, text: 'text-4xl' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export const SettingsAvatar = forwardRef<HTMLDivElement, SettingsAvatarProps>(
  ({ src, name, onUpload, size = 'md', className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const { px, text } = SIZE_MAP[size];

    function handleClick() {
      inputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      onUpload(file);
      setTimeout(() => setUploading(false), 1200);
      e.target.value = '';
    }

    return (
      <div ref={ref} className={cn('flex flex-col items-center gap-3', className)} {...props}>
        <button
          type="button"
          onClick={handleClick}
          className="group relative overflow-hidden transition-all duration-200"
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            border: '3px solid var(--bb-glass-border)',
          }}
          aria-label="Alterar foto de perfil"
        >
          {src ? (
            <img
              src={src}
              alt={name}
              className="h-full w-full object-cover"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <div
              className={cn('flex h-full w-full items-center justify-center font-bold', text)}
              style={{
                background: 'var(--bb-brand-surface)',
                color: 'var(--bb-brand)',
              }}
            >
              {getInitials(name)}
            </div>
          )}

          {/* Overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
            }}
          >
            {uploading ? (
              <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          Clique para alterar
        </p>
      </div>
    );
  },
);
SettingsAvatar.displayName = 'SettingsAvatar';
