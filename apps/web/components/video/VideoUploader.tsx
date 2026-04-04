'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Film } from 'lucide-react';
import * as tus from 'tus-js-client';

interface VideoUploaderProps {
  onUploadComplete?: (videoId: string, embedUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  academyId?: string;
}

export function VideoUploader({ onUploadComplete, onError, className }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const uploadRef = useRef<tus.Upload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (selected.size > maxSize) {
      setErrorMsg('Arquivo muito grande. Máximo: 2GB');
      setStatus('error');
      return;
    }

    setFile(selected);
    setVideoTitle(selected.name.replace(/\.[^/.]+$/, ''));
    setStatus('idle');
    setErrorMsg('');
    setProgress(0);
  }, []);

  const startUpload = useCallback(async () => {
    if (!file || !videoTitle.trim()) return;

    setStatus('uploading');
    setProgress(0);

    try {
      // Step 1: Get upload credentials from our API
      const credRes = await fetch('/api/videos/create-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: videoTitle.trim() }),
      });

      if (!credRes.ok) {
        throw new Error('Falha ao criar vídeo');
      }

      const creds = await credRes.json();

      // Step 2: Upload via TUS
      const upload = new tus.Upload(file, {
        endpoint: creds.tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: creds.signature,
          AuthorizationExpire: String(creds.expirationTime),
          VideoId: creds.videoId,
          LibraryId: creds.libraryId,
        },
        metadata: {
          filetype: file.type,
          title: videoTitle.trim(),
        },
        onError: (error) => {
          console.error('[upload] Error:', error);
          setStatus('error');
          setErrorMsg(error.message || 'Erro no upload');
          onError?.(error.message || 'Erro no upload');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress(pct);
        },
        onSuccess: () => {
          setStatus('done');
          setProgress(100);
          onUploadComplete?.(creds.videoId, creds.embedUrl);
        },
      });

      uploadRef.current = upload;

      // Check for previous uploads (resumable)
      const previousUploads = await upload.findPreviousUploads();
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setStatus('error');
      setErrorMsg(message);
      onError?.(message);
    }
  }, [file, videoTitle, onUploadComplete, onError]);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setStatus('idle');
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setVideoTitle('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className={`rounded-xl p-6 ${className || ''}`} style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--bb-ink-100)' }}>
        <Film size={20} />
        Upload de Vídeo-Aula
      </h3>

      {/* File selection */}
      {!file && status === 'idle' && (
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-[#D4AF37]"
          style={{ borderColor: 'var(--bb-glass-border, rgba(255,255,255,0.2))' }}
        >
          <Upload size={32} style={{ color: 'var(--bb-ink-40)' }} />
          <span className="text-sm text-center" style={{ color: 'var(--bb-ink-60)' }}>
            Arraste um vídeo ou clique para selecionar
          </span>
          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            MP4, MOV, AVI, MKV, WEBM — máx. 2GB
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* File selected — title + upload */}
      {file && status === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
            <Film size={20} style={{ color: '#D4AF37' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{file.name}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button onClick={reset} aria-label="Remover arquivo" style={{ color: 'var(--bb-ink-40)' }}>
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--bb-ink-80)' }}>
              Título da aula *
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Ex: Armlock da Guarda Fechada"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
            />
          </div>

          <button
            onClick={startUpload}
            disabled={!videoTitle.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ background: '#D4AF37', color: '#000' }}
          >
            <Upload size={16} />
            Enviar vídeo
          </button>
        </div>
      )}

      {/* Upload in progress */}
      {status === 'uploading' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin" style={{ color: '#D4AF37' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Enviando... {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bb-depth-3)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: '#D4AF37' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            {file?.name} — {(file!.size / (1024 * 1024)).toFixed(1)} MB
          </p>
          <button
            onClick={cancelUpload}
            className="text-xs underline"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Cancelar upload
          </button>
        </div>
      )}

      {/* Upload complete */}
      {status === 'done' && (
        <div className="text-center space-y-3 py-4">
          <CheckCircle size={40} style={{ color: '#22C55E' }} className="mx-auto" />
          <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
            Upload concluído! O vídeo está sendo processado.
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Pode levar alguns minutos para ficar disponível para os alunos.
          </p>
          <button
            onClick={reset}
            className="text-sm underline"
            style={{ color: '#D4AF37' }}
          >
            Enviar outro vídeo
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-center space-y-3 py-4">
          <AlertCircle size={40} style={{ color: '#EF4444' }} className="mx-auto" />
          <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
            Erro no upload
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{errorMsg}</p>
          <button
            onClick={reset}
            className="text-sm underline"
            style={{ color: '#D4AF37' }}
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
