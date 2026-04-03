# BLACKBELT v2 — INTEGRAÇÃO BUNNY STREAM: VÍDEO-AULAS COMPLETO
## Professor faz upload → Bunny processa → Aluno assiste
## TUS resumable uploads + Player embed + Gestão de vídeos
## Biblioteca: Cinturão-Aulas (ID: 626933)

> **INSTRUÇÕES:**
> - Execute BLOCO a BLOCO (B1 → B8)
> - Cada BLOCO: `pnpm typecheck && pnpm build` ZERO erros → commit → push
> - ENV vars do Bunny devem ser adicionadas no Vercel depois

---

## DADOS DA BIBLIOTECA BUNNY

```
BUNNY_STREAM_LIBRARY_ID=626933
BUNNY_STREAM_API_KEY=fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34
BUNNY_STREAM_CDN_HOST=vz-1ea2733d-15c.b-cdn.net
```

---

## B1 — ENV VARS + BUNNY SERVICE

### 1A. Adicionar env vars ao .env.local

```bash
# Verificar se .env.local existe
test -f .env.local && echo "EXISTS" || echo "MISSING"

# Adicionar as vars (NÃO sobrescrever o arquivo)
cat >> .env.local << 'EOF'

# Bunny Stream — Cinturão-Aulas
BUNNY_STREAM_LIBRARY_ID=626933
BUNNY_STREAM_API_KEY=fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34
BUNNY_STREAM_CDN_HOST=vz-1ea2733d-15c.b-cdn.net
EOF
```

### 1B. Adicionar env vars ao .env.production.local (ou .env.production)

```bash
cat >> .env.production.local << 'EOF'

# Bunny Stream — Cinturão-Aulas
BUNNY_STREAM_LIBRARY_ID=626933
BUNNY_STREAM_API_KEY=fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34
BUNNY_STREAM_CDN_HOST=vz-1ea2733d-15c.b-cdn.net
EOF
```

### 1C. Criar lib/services/bunny-stream.ts

```typescript
/**
 * Bunny Stream Service — Server-side only
 * Gerencia upload, listagem e exclusão de vídeos na biblioteca Cinturão-Aulas
 */

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const CDN_HOST = process.env.BUNNY_STREAM_CDN_HOST!;
const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}`;

interface BunnyVideo {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number; // seconds
  status: number; // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: Array<{ srclang: string; label: string }>;
  hasMP4Fallback: boolean;
  collectionId: string;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string;
  chapters: Array<{ title: string; start: number; end: number }>;
  moments: Array<{ label: string; timestamp: number }>;
}

interface CreateVideoResponse {
  guid: string;
  title: string;
  libraryId: number;
}

interface TusUploadCredentials {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
  tusEndpoint: string;
  embedUrl: string;
  thumbnailUrl: string;
}

// ═══ HEADERS ═══
function headers(json = true): Record<string, string> {
  const h: Record<string, string> = { AccessKey: API_KEY };
  if (json) {
    h['Accept'] = 'application/json';
    h['Content-Type'] = 'application/json';
  }
  return h;
}

// ═══ CREATE VIDEO (step 1 of upload) ═══
export async function createVideo(title: string, collectionId?: string): Promise<CreateVideoResponse> {
  const body: Record<string, string> = { title };
  if (collectionId) body.collectionId = collectionId;

  const res = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[bunny] Create video failed: ${res.status} ${text}`);
  }

  return res.json();
}

// ═══ GENERATE TUS UPLOAD CREDENTIALS ═══
export async function generateUploadCredentials(videoId: string): Promise<TusUploadCredentials> {
  const { createHash } = await import('crypto');

  const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24h
  const signature = createHash('sha256')
    .update(`${LIBRARY_ID}${API_KEY}${expirationTime}${videoId}`)
    .digest('hex');

  return {
    videoId,
    libraryId: LIBRARY_ID,
    expirationTime,
    signature,
    tusEndpoint: 'https://video.bunnycdn.com/tusupload',
    embedUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
    thumbnailUrl: `https://${CDN_HOST}/${videoId}/thumbnail.jpg`,
  };
}

// ═══ DIRECT UPLOAD (server-side, for small files or fetch from URL) ═══
export async function uploadVideoFromUrl(videoId: string, url: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/videos/${videoId}/fetch`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[bunny] Fetch video failed: ${res.status} ${text}`);
  }
}

// ═══ LIST VIDEOS ═══
export async function listVideos(page = 1, perPage = 25, search?: string, collectionId?: string): Promise<{ totalItems: number; items: BunnyVideo[] }> {
  const params = new URLSearchParams({
    page: String(page),
    itemsPerPage: String(perPage),
    orderBy: 'date',
  });
  if (search) params.set('search', search);
  if (collectionId) params.set('collection', collectionId);

  const res = await fetch(`${BASE_URL}/videos?${params}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`[bunny] List videos failed: ${res.status}`);
  }

  return res.json();
}

// ═══ GET VIDEO ═══
export async function getVideo(videoId: string): Promise<BunnyVideo> {
  const res = await fetch(`${BASE_URL}/videos/${videoId}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`[bunny] Get video failed: ${res.status}`);
  }

  return res.json();
}

// ═══ DELETE VIDEO ═══
export async function deleteVideo(videoId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: 'DELETE',
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`[bunny] Delete video failed: ${res.status}`);
  }
}

// ═══ GET EMBED URL ═══
export function getEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;
}

// ═══ GET THUMBNAIL URL ═══
export function getThumbnailUrl(videoId: string): string {
  return `https://${CDN_HOST}/${videoId}/thumbnail.jpg`;
}

// ═══ GET DIRECT PLAY URL (HLS) ═══
export function getPlayUrl(videoId: string): string {
  return `https://${CDN_HOST}/${videoId}/playlist.m3u8`;
}

// ═══ CREATE COLLECTION ═══
export async function createCollection(title: string): Promise<{ guid: string }> {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error(`[bunny] Create collection failed: ${res.status}`);
  }

  return res.json();
}

// ═══ LIST COLLECTIONS ═══
export async function listCollections(page = 1, perPage = 25): Promise<{ totalItems: number; items: Array<{ guid: string; name: string; videoCount: number }> }> {
  const params = new URLSearchParams({
    page: String(page),
    itemsPerPage: String(perPage),
  });

  const res = await fetch(`${BASE_URL}/collections?${params}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`[bunny] List collections failed: ${res.status}`);
  }

  return res.json();
}

export type { BunnyVideo, CreateVideoResponse, TusUploadCredentials };
```

### 1D. Criar types para Bunny

Criar `lib/types/video.ts`:

```typescript
export interface VideoAula {
  id: string;
  academy_id: string;
  bunny_video_id: string;
  title: string;
  description?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  embed_url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  uploaded_by: string;
  modality?: string;
  belt_level?: string;
  tags?: string[];
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface VideoUploadProgress {
  videoId: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'ready' | 'error';
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Bunny Stream service — video management, TUS upload credentials, embed/thumbnail URLs`

---

## B2 — API ROUTES (UPLOAD + LIST + DELETE)

### 2A. API para criar vídeo + gerar credenciais TUS

Criar `app/api/videos/create-upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createVideo, generateUploadCredentials } from '@/lib/services/bunny-stream';

export async function POST(req: NextRequest) {
  try {
    const { title, collectionId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Step 1: Create video object in Bunny
    const video = await createVideo(title, collectionId);

    // Step 2: Generate TUS upload credentials
    const credentials = await generateUploadCredentials(video.guid);

    return NextResponse.json({
      success: true,
      ...credentials,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/videos/create-upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### 2B. API para listar vídeos

Criar `app/api/videos/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { listVideos, getEmbedUrl, getThumbnailUrl } from '@/lib/services/bunny-stream';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const search = searchParams.get('search') || undefined;
    const collection = searchParams.get('collection') || undefined;

    const result = await listVideos(page, 25, search, collection);

    const videos = result.items.map((v) => ({
      id: v.guid,
      title: v.title,
      duration: v.length,
      status: v.status === 4 ? 'ready' : v.status === 5 ? 'error' : 'processing',
      views: v.views,
      embedUrl: getEmbedUrl(v.guid),
      thumbnailUrl: getThumbnailUrl(v.guid),
      uploadedAt: v.dateUploaded,
      encodeProgress: v.encodeProgress,
      resolutions: v.availableResolutions,
      size: v.storageSize,
    }));

    return NextResponse.json({
      total: result.totalItems,
      page,
      videos,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/videos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### 2C. API para deletar vídeo

Criar `app/api/videos/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getVideo, deleteVideo, getEmbedUrl, getThumbnailUrl } from '@/lib/services/bunny-stream';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const video = await getVideo(params.id);
    return NextResponse.json({
      id: video.guid,
      title: video.title,
      duration: video.length,
      status: video.status === 4 ? 'ready' : video.status === 5 ? 'error' : 'processing',
      views: video.views,
      embedUrl: getEmbedUrl(video.guid),
      thumbnailUrl: getThumbnailUrl(video.guid),
      resolutions: video.availableResolutions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteVideo(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### 2D. API para webhook do Bunny (notificação de status)

Criar `app/api/webhooks/bunny/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { VideoGuid, Status } = body;

    console.log(`[bunny-webhook] Video ${VideoGuid} status: ${Status}`);

    // Status: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
    // Aqui pode atualizar o status no Supabase se tiver tabela de video_aulas

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[bunny-webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Bunny Stream API routes — create-upload (TUS), list, get, delete, webhook`

---

## B3 — INSTALAR TUS CLIENT + COMPONENTE DE UPLOAD

### 3A. Instalar tus-js-client

```bash
pnpm add tus-js-client
```

### 3B. Criar componente VideoUploader

Criar `components/video/VideoUploader.tsx`:

```tsx
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

export function VideoUploader({ onUploadComplete, onError, className, academyId }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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

    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/quicktime'];
    if (!validTypes.some(t => selected.type.startsWith(t.split('/')[0]))) {
      // Accept any video file
    }

    setFile(selected);
    setVideoTitle(selected.name.replace(/\.[^/.]+$/, ''));
    setStatus('idle');
    setErrorMsg('');
    setProgress(0);
  }, []);

  const startUpload = useCallback(async () => {
    if (!file || !videoTitle.trim()) return;

    setUploading(true);
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
          setUploading(false);
          onError?.(error.message || 'Erro no upload');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress(pct);
        },
        onSuccess: () => {
          setStatus('done');
          setProgress(100);
          setUploading(false);
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
      setUploading(false);
      onError?.(message);
    }
  }, [file, videoTitle, onUploadComplete, onError]);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setUploading(false);
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
            <button onClick={reset} style={{ color: 'var(--bb-ink-40)' }}>
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
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: VideoUploader component — TUS resumable upload with progress bar`

---

## B4 — COMPONENTE VIDEO PLAYER (EMBED)

Criar `components/video/VideoPlayer.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Play, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
  autoplay?: boolean;
}

const LIBRARY_ID = '626933';
const CDN_HOST = 'vz-1ea2733d-15c.b-cdn.net';

export function VideoPlayer({ videoId, title, thumbnailUrl, className, autoplay = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);

  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=${autoplay ? 'true' : 'false'}&loop=false&muted=false&preload=true&responsive=true`;
  const thumbnail = thumbnailUrl || `https://${CDN_HOST}/${videoId}/thumbnail.jpg`;

  if (!playing && !autoplay) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden cursor-pointer group ${className || ''}`}
        onClick={() => setPlaying(true)}
        style={{ aspectRatio: '16/9', background: '#000' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title || 'Vídeo'}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'rgba(212,175,55,0.9)' }}
          >
            <Play size={28} fill="#000" color="#000" className="ml-1" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
            <p className="text-sm font-medium text-white truncate">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className || ''}`} style={{ aspectRatio: '16/9' }}>
      <iframe
        src={embedUrl}
        loading="lazy"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: VideoPlayer component — Bunny Stream embed with thumbnail + play button`

---

## B5 — COMPONENTE VIDEO LIST (BIBLIOTECA)

Criar `components/video/VideoLibrary.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, RefreshCw, Film, Clock, Eye, Loader2 } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  duration: number;
  status: string;
  views: number;
  embedUrl: string;
  thumbnailUrl: string;
  uploadedAt: string;
  encodeProgress: number;
  size: number;
}

interface VideoLibraryProps {
  canDelete?: boolean;
  canUpload?: boolean;
  className?: string;
}

export function VideoLibrary({ canDelete = false, className }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [total, setTotal] = useState(0);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/videos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('[VideoLibrary] fetch error:', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (videoId: string) => {
    if (!confirm('Excluir este vídeo permanentemente?')) return;
    try {
      await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (selectedVideo?.id === videoId) setSelectedVideo(null);
    } catch { /* silent */ }
  };

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div className={className}>
      {/* Selected video player */}
      {selectedVideo && (
        <div className="mb-6">
          <VideoPlayer
            videoId={selectedVideo.id}
            title={selectedVideo.title}
            thumbnailUrl={selectedVideo.thumbnailUrl}
            autoplay
          />
          <h3 className="mt-3 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {selectedVideo.title}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
              <Eye size={12} /> {selectedVideo.views} views
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
              <Clock size={12} /> {formatDuration(selectedVideo.duration)}
            </span>
          </div>
        </div>
      )}

      {/* Search + refresh */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vídeos..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
          />
        </div>
        <button onClick={fetchVideos} className="p-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
          <RefreshCw size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </button>
      </div>

      {/* Total */}
      <p className="text-xs mb-3" style={{ color: 'var(--bb-ink-40)' }}>
        {total} vídeo{total !== 1 ? 's' : ''} na biblioteca
      </p>

      {/* Video grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: '#D4AF37' }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Film size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum vídeo encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative" style={{ aspectRatio: '16/9', background: '#111' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                {video.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: '#D4AF37' }} />
                    <span className="ml-2 text-xs text-white">Processando... {video.encodeProgress}%</span>
                  </div>
                )}
                {video.status === 'ready' && video.duration > 0 && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-mono text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                  {video.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {video.views} views
                  </span>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      title="Excluir vídeo"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: VideoLibrary component — grid view, search, player, delete`

---

## B6 — PÁGINA DE VÍDEO-AULAS DO PROFESSOR

Encontrar a página de aulas do professor:
```bash
find app -path "*professor*" -name "page.tsx" | head -10
find app -path "*aulas*" -name "page.tsx" | head -10
find app -path "*video*" -name "page.tsx" | head -5
```

Se já existe uma página de aulas/vídeos, adicionar o VideoUploader e VideoLibrary nela.
Se NÃO existe, criar `app/(professor)/professor/video-aulas/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Film, Upload as UploadIcon, List } from 'lucide-react';
import { VideoUploader } from '@/components/video/VideoUploader';
import { VideoLibrary } from '@/components/video/VideoLibrary';

export default function VideoAulasPage() {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--bb-ink-100)' }}>
          <Film size={24} style={{ color: '#D4AF37' }} />
          Vídeo-Aulas
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('library')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: tab === 'library' ? '#D4AF37' : 'var(--bb-depth-3)',
            color: tab === 'library' ? '#000' : 'var(--bb-ink-60)',
          }}
        >
          <List size={16} /> Biblioteca
        </button>
        <button
          onClick={() => setTab('upload')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: tab === 'upload' ? '#D4AF37' : 'var(--bb-depth-3)',
            color: tab === 'upload' ? '#000' : 'var(--bb-ink-60)',
          }}
        >
          <UploadIcon size={16} /> Upload
        </button>
      </div>

      {/* Content */}
      {tab === 'upload' && (
        <VideoUploader
          onUploadComplete={() => {
            setRefreshKey((k) => k + 1);
            setTab('library');
          }}
        />
      )}

      {tab === 'library' && (
        <VideoLibrary key={refreshKey} canDelete canUpload />
      )}
    </div>
  );
}
```

Adicionar link na sidebar do professor se não existir:
```bash
grep -rn "video-aulas\|Video.Aulas\|videoaulas" components/shell/ --include="*.tsx" | head -5
```

Se não existe, adicionar item no shell do professor com ícone Film e path `/professor/video-aulas`.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: video-aulas page — professor uploads + library view`

---

## B7 — PÁGINA DE VÍDEO-AULAS DO ALUNO

O aluno precisa ver os vídeos mas NÃO pode fazer upload nem deletar.

Encontrar onde o aluno tem seção de aulas:
```bash
find app -path "*aluno*aula*" -o -path "*aluno*video*" -o -path "*student*video*" | head -5
```

Se não existe, criar `app/(aluno)/aluno/video-aulas/page.tsx`:

```tsx
'use client';

import { Film } from 'lucide-react';
import { VideoLibrary } from '@/components/video/VideoLibrary';

export default function AlunoVideoAulasPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--bb-ink-100)' }}>
        <Film size={24} style={{ color: '#D4AF37' }} />
        Vídeo-Aulas
      </h1>
      <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Assista as aulas gravadas pelos professores da sua academia.
      </p>
      <VideoLibrary canDelete={false} />
    </div>
  );
}
```

Adicionar link na sidebar do aluno.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: video-aulas page for students — watch only, no upload/delete`

---

## B8 — CONFIGURAR WEBHOOK BUNNY + VERIFICAÇÃO FINAL

### 8A. Configurar Webhook URL no Bunny Dashboard

Gregory precisa fazer manualmente:
1. Abrir https://dash.bunny.net → Delivery → Stream → Cinturão-Aulas → API
2. No campo "Webhook URL", colocar:
   ```
   https://blackbelts.com.br/api/webhooks/bunny
   ```
3. Salvar

### 8B. Adicionar env vars no Vercel

Gregory precisa fazer manualmente:
1. Abrir https://vercel.com → blackbelt-v2 → Settings → Environment Variables
2. Adicionar:
   - `BUNNY_STREAM_LIBRARY_ID` = `626933`
   - `BUNNY_STREAM_API_KEY` = `fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34`
   - `BUNNY_STREAM_CDN_HOST` = `vz-1ea2733d-15c.b-cdn.net`
3. Redeploy

### 8C. Verificação final

```bash
echo "=== VERIFICAÇÃO BUNNY STREAM ==="
test -f lib/services/bunny-stream.ts && echo "✅ bunny-stream.ts" || echo "❌ bunny-stream.ts"
test -f lib/types/video.ts && echo "✅ types/video.ts" || echo "❌ types/video.ts"
test -f app/api/videos/create-upload/route.ts && echo "✅ API create-upload" || echo "❌ API create-upload"
test -f app/api/videos/route.ts && echo "✅ API list videos" || echo "❌ API list videos"
test -f app/api/webhooks/bunny/route.ts && echo "✅ Webhook bunny" || echo "❌ Webhook bunny"
test -f components/video/VideoUploader.tsx && echo "✅ VideoUploader" || echo "❌ VideoUploader"
test -f components/video/VideoPlayer.tsx && echo "✅ VideoPlayer" || echo "❌ VideoPlayer"
test -f components/video/VideoLibrary.tsx && echo "✅ VideoLibrary" || echo "❌ VideoLibrary"
grep -rn "video-aulas" app/ --include="*.tsx" | head -5

pnpm typecheck 2>&1 | tail -3
pnpm build 2>&1 | tail -5
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Bunny Stream integration complete — upload, player, library, webhook`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_BUNNY_STREAM.md. Verifique:
test -f lib/services/bunny-stream.ts && echo "B1 OK" || echo "B1 FALTA"
test -f app/api/videos/create-upload/route.ts && echo "B2 OK" || echo "B2 FALTA"
test -f components/video/VideoUploader.tsx && echo "B3 OK" || echo "B3 FALTA"
test -f components/video/VideoPlayer.tsx && echo "B4 OK" || echo "B4 FALTA"
test -f components/video/VideoLibrary.tsx && echo "B5 OK" || echo "B5 FALTA"
pnpm typecheck 2>&1 | tail -3
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
