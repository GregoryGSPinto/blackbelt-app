'use client';

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

export interface AvatarUploaderProps {
  value: string | null;
  onChange: (url: string) => void;
  initials?: string;
  size?: number;
  className?: string;
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function resizeImage(
  file: File,
  maxSize: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down to fit within maxSize x maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({
  value,
  onChange,
  initials = '',
  size = 120,
  className,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      try {
        const resized = await resizeImage(file, 500, 0.8);
        onChange(resized);
      } catch {
        // Silently fail — user can retry
      } finally {
        setIsProcessing(false);
        // Reset file input so same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onChange],
  );

  const handleChoose = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const previewStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--bb-glass-border)',
    backgroundColor: 'var(--bb-depth-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const displayInitials = initials ? getInitials(initials) : '?';

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Preview circle */}
      <div style={previewStyle}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Pre-visualizacao do avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            className="select-none font-semibold"
            style={{
              color: 'var(--bb-ink-60)',
              fontSize: size * 0.3,
            }}
          >
            {displayInitials}
          </span>
        )}

        {isProcessing && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
          >
            <svg
              className="h-6 w-6 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar foto de perfil"
      />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleChoose}
          disabled={isProcessing}
        >
          <Camera className="mr-1.5 h-4 w-4" />
          Escolher foto
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isProcessing}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}

AvatarUploader.displayName = 'AvatarUploader';
