'use client';

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type SyntheticEvent,
} from 'react';
import type { StorageProvider } from '@/lib/types/video-storage';
import { useSignedVideoUrl } from '@/lib/hooks/useSignedVideoUrl';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface AdaptiveVideoPlayerProps {
  storage_url: string;
  provider: StorageProvider;
  embed_url?: string | null;
  external_id?: string | null;
  thumbnail_url?: string | null;
  title?: string;
  onProgress?: (seconds: number) => void;
  start_at?: number;
  className?: string;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const PROGRESS_THROTTLE_MS = 10_000;

function buildYouTubeUrl(externalId: string, startAt: number): string {
  return `https://www.youtube.com/embed/${externalId}?start=${startAt}&autoplay=0&rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
}

function buildVimeoUrl(externalId: string): string {
  return `https://player.vimeo.com/video/${externalId}`;
}

function buildGoogleDriveUrl(externalId: string): string {
  return `https://drive.google.com/file/d/${externalId}/preview`;
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <Spinner size="lg" className="text-white" />
    </div>
  );
}

interface ErrorOverlayProps {
  message: string;
  onRetry: () => void;
}

function ErrorOverlay({ message, onRetry }: ErrorOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-4">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-center text-sm text-white/80">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  );
}

function MissingIdError({ provider }: { provider: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-4">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-center text-sm text-white/80">
        ID do vídeo do {provider} não fornecido
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Native Video Player (supabase / s3)
// ────────────────────────────────────────────────────────────

interface NativeVideoProps {
  src: string;
  poster?: string | null;
  startAt?: number;
  title?: string;
  onProgress?: (seconds: number) => void;
}

function NativeVideo({ src, poster, startAt, title, onProgress }: NativeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedRef = useRef<number>(0);
  const hasSetStartRef = useRef(false);

  const handleTimeUpdate = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      if (!onProgress) return;
      const currentTime = e.currentTarget.currentTime;
      const elapsed = currentTime - lastReportedRef.current;
      if (Math.abs(elapsed) >= PROGRESS_THROTTLE_MS / 1000) {
        lastReportedRef.current = currentTime;
        onProgress(Math.floor(currentTime));
      }
    },
    [onProgress],
  );

  const handleLoadedMetadata = useCallback(() => {
    if (startAt && startAt > 0 && videoRef.current && !hasSetStartRef.current) {
      videoRef.current.currentTime = startAt;
      hasSetStartRef.current = true;
    }
  }, [startAt]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster ?? undefined}
      title={title}
      controls
      playsInline
      preload="metadata"
      className="h-full w-full object-contain"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Supabase Video (with signed URL)
// ────────────────────────────────────────────────────────────

interface SupabaseVideoProps {
  storagePath: string;
  poster?: string | null;
  startAt?: number;
  title?: string;
  onProgress?: (seconds: number) => void;
}

function SupabaseVideo({ storagePath, poster, startAt, title, onProgress }: SupabaseVideoProps) {
  const { url, loading, error } = useSignedVideoUrl(storagePath);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  // Force re-fetch on retry by remounting the hook
  const effectivePath = retryKey > 0 ? `${storagePath}?retry=${retryKey}` : storagePath;
  const retried = useSignedVideoUrl(retryKey > 0 ? effectivePath : null);
  const finalUrl = retryKey > 0 ? retried.url : url;
  const finalLoading = retryKey > 0 ? retried.loading : loading;
  const finalError = retryKey > 0 ? retried.error : error;

  if (finalLoading) {
    return <LoadingOverlay />;
  }

  if (finalError || !finalUrl) {
    return (
      <ErrorOverlay
        message={finalError ?? 'Não foi possível carregar o vídeo'}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <NativeVideo
      src={finalUrl}
      poster={poster}
      startAt={startAt}
      title={title}
      onProgress={onProgress}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Iframe Player (YouTube / Vimeo / Google Drive)
// ────────────────────────────────────────────────────────────

interface IframePlayerProps {
  src: string;
  title?: string;
  provider: 'youtube' | 'vimeo' | 'google_drive';
  onProgress?: (seconds: number) => void;
}

function IframePlayer({ src, title, provider, onProgress }: IframePlayerProps) {
  const [loading, setLoading] = useState(true);
  const lastReportedRef = useRef<number>(0);

  useEffect(() => {
    if (!onProgress) return;
    if (provider !== 'youtube' && provider !== 'vimeo') return;

    const reportProgress = onProgress;

    function handleMessage(event: MessageEvent) {
      // YouTube postMessage progress tracking
      if (provider === 'youtube') {
        const data = typeof event.data === 'string' ? tryParseJSON(event.data) : event.data;
        if (data && typeof data === 'object' && 'info' in data) {
          const info = (data as { info: { currentTime?: number } }).info;
          if (typeof info?.currentTime === 'number') {
            const currentTime = info.currentTime;
            if (Math.abs(currentTime - lastReportedRef.current) >= PROGRESS_THROTTLE_MS / 1000) {
              lastReportedRef.current = currentTime;
              reportProgress(Math.floor(currentTime));
            }
          }
        }
      }

      // Vimeo postMessage progress tracking
      if (provider === 'vimeo') {
        const data = typeof event.data === 'string' ? tryParseJSON(event.data) : event.data;
        if (data && typeof data === 'object' && 'method' in data) {
          const vimeoData = data as { method?: string; value?: number };
          if (vimeoData.method === 'playProgress' && typeof vimeoData.value === 'number') {
            const currentTime = vimeoData.value;
            if (Math.abs(currentTime - lastReportedRef.current) >= PROGRESS_THROTTLE_MS / 1000) {
              lastReportedRef.current = currentTime;
              reportProgress(Math.floor(currentTime));
            }
          }
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, provider]);

  return (
    <>
      {loading && <LoadingOverlay />}
      <iframe
        src={src}
        title={title ?? 'Vídeo'}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
      />
    </>
  );
}

function tryParseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

const AdaptiveVideoPlayer = forwardRef<HTMLDivElement, AdaptiveVideoPlayerProps>(
  function AdaptiveVideoPlayer(
    {
      storage_url,
      provider,
      embed_url,
      external_id,
      thumbnail_url,
      title,
      onProgress,
      start_at = 0,
      className,
    },
    ref,
  ) {
    // Determine what to render based on provider
    function renderPlayer() {
      switch (provider) {
        case 'supabase': {
          return (
            <SupabaseVideo
              storagePath={storage_url}
              poster={thumbnail_url}
              startAt={start_at}
              title={title}
              onProgress={onProgress}
            />
          );
        }

        case 's3': {
          return (
            <NativeVideo
              src={storage_url}
              poster={thumbnail_url}
              startAt={start_at}
              title={title}
              onProgress={onProgress}
            />
          );
        }

        case 'youtube': {
          if (!external_id) {
            return <MissingIdError provider="YouTube" />;
          }
          const src = embed_url ?? buildYouTubeUrl(external_id, start_at);
          return (
            <IframePlayer
              src={src}
              title={title}
              provider="youtube"
              onProgress={onProgress}
            />
          );
        }

        case 'vimeo': {
          if (!external_id) {
            return <MissingIdError provider="Vimeo" />;
          }
          const src = embed_url ?? buildVimeoUrl(external_id);
          return (
            <IframePlayer
              src={src}
              title={title}
              provider="vimeo"
              onProgress={onProgress}
            />
          );
        }

        case 'google_drive': {
          if (!external_id) {
            return <MissingIdError provider="Google Drive" />;
          }
          const src = embed_url ?? buildGoogleDriveUrl(external_id);
          return (
            <IframePlayer
              src={src}
              title={title}
              provider="google_drive"
              onProgress={onProgress}
            />
          );
        }

        default: {
          const _exhaustiveCheck: never = provider;
          return _exhaustiveCheck;
        }
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative aspect-video overflow-hidden rounded-xl bg-black',
          className,
        )}
      >
        {renderPlayer()}
      </div>
    );
  },
);

AdaptiveVideoPlayer.displayName = 'AdaptiveVideoPlayer';

export { AdaptiveVideoPlayer };
export type { AdaptiveVideoPlayerProps };
