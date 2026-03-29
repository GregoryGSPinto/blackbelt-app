'use client';

import { forwardRef, useEffect, useRef, useState, useCallback } from 'react';

interface VideoThumbnailGeneratorProps {
  videoFile: File;
  onThumbnailGenerated: (blob: Blob) => void;
  captureTimeSeconds?: number;
}

const VideoThumbnailGenerator = forwardRef<HTMLDivElement, VideoThumbnailGeneratorProps>(
  function VideoThumbnailGenerator({ videoFile, onThumbnailGenerated, captureTimeSeconds = 1 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const generatedRef = useRef(false);

    const generateThumbnail = useCallback(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || generatedRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setStatus('error');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            generatedRef.current = true;
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setStatus('ready');
            onThumbnailGenerated(blob);
          } else {
            setStatus('error');
          }
        },
        'image/jpeg',
        0.8,
      );
    }, [onThumbnailGenerated]);

    useEffect(() => {
      generatedRef.current = false;
      setStatus('loading');
      setPreviewUrl(null);

      const video = videoRef.current;
      if (!video) return;

      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      const handleLoadedMetadata = () => {
        video.currentTime = Math.min(captureTimeSeconds, video.duration || captureTimeSeconds);
      };

      const handleSeeked = () => {
        generateThumbnail();
      };

      const handleError = () => {
        setStatus('error');
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('error', handleError);
        URL.revokeObjectURL(objectUrl);
      };
    }, [videoFile, captureTimeSeconds, generateThumbnail]);

    useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    return (
      <div ref={ref}>
        {/* Hidden video element for capture */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="metadata"
          style={{ display: 'none' }}
        />

        {/* Hidden canvas for drawing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Thumbnail preview */}
        <div
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {status === 'loading' && (
            <div
              className="flex items-center justify-center"
              style={{
                height: '120px',
                color: 'var(--bb-ink-60)',
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
                <span className="text-xs">Gerando thumbnail...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div
              className="flex items-center justify-center"
              style={{
                height: '120px',
                color: 'var(--bb-error)',
              }}
            >
              <span className="text-xs">Erro ao gerar thumbnail</span>
            </div>
          )}

          {status === 'ready' && previewUrl && (
            <img
              src={previewUrl}
              alt="Pre-visualizacao da thumbnail do video"
              className="h-auto w-full object-cover"
              style={{ maxHeight: '180px' }}
            />
          )}
        </div>
      </div>
    );
  },
);

VideoThumbnailGenerator.displayName = 'VideoThumbnailGenerator';
export { VideoThumbnailGenerator };
