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
