import { isMock } from '@/lib/env';

// ── Re-export types ─────────────────────────────────────────────────
export type {
  StorageProvider,
  YouTubeConfig,
  VimeoConfig,
  GoogleDriveConfig,
  S3Config,
  StorageConfig,
  UploadVideoMetadata,
  VideoUploadResult,
  VideoPlayerInfo,
  ConnectionTestResult,
  StorageStats,
  UploadProgress,
} from '@/lib/types/video-storage';

import type {
  StorageProvider,
  StorageConfig,
  UploadVideoMetadata,
  VideoUploadResult,
  VideoPlayerInfo,
  ConnectionTestResult,
  StorageStats,
  UploadProgress,
} from '@/lib/types/video-storage';

// ── CONFIG ──────────────────────────────────────────────────────────

export async function getStorageConfig(): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockGetStorageConfig } = await import('@/lib/mocks/video-storage.mock');
      return mockGetStorageConfig();
    }

    const res = await fetch('/api/video-storage/config');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] getStorageConfig: API not available, using mock');
    const { mockGetStorageConfig } = await import('@/lib/mocks/video-storage.mock');
    return mockGetStorageConfig();
  }
}

export async function updateStorageConfig(
  config: Partial<StorageConfig>,
): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockUpdateStorageConfig } = await import('@/lib/mocks/video-storage.mock');
      return mockUpdateStorageConfig(config);
    }

    const res = await fetch('/api/video-storage/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] updateStorageConfig: API not available, using mock');
    const { mockUpdateStorageConfig } = await import('@/lib/mocks/video-storage.mock');
    return mockUpdateStorageConfig(config);
  }
}

export async function testConnection(
  provider: StorageProvider,
): Promise<ConnectionTestResult> {
  try {
    if (isMock()) {
      const { mockTestConnection } = await import('@/lib/mocks/video-storage.mock');
      return mockTestConnection(provider);
    }

    const res = await fetch(`/api/video-storage/test-connection/${provider}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] testConnection: API not available, using mock');
    const { mockTestConnection } = await import('@/lib/mocks/video-storage.mock');
    return mockTestConnection(provider);
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  try {
    if (isMock()) {
      const { mockGetStorageStats } = await import('@/lib/mocks/video-storage.mock');
      return mockGetStorageStats();
    }

    const res = await fetch('/api/video-storage/stats');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] getStorageStats: API not available, using mock');
    const { mockGetStorageStats } = await import('@/lib/mocks/video-storage.mock');
    return mockGetStorageStats();
  }
}

// ── UPLOAD ──────────────────────────────────────────────────────────

export async function uploadVideo(
  file: File,
  metadata: UploadVideoMetadata,
  onProgress?: (progress: UploadProgress) => void,
): Promise<VideoUploadResult> {
  try {
    if (isMock()) {
      const { mockUploadVideo } = await import('@/lib/mocks/video-storage.mock');
      return mockUploadVideo(file, metadata, onProgress);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const xhr = new XMLHttpRequest();

    const result = await new Promise<VideoUploadResult>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
            estimated_seconds_remaining: null,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as VideoUploadResult);
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', '/api/video-storage/upload');
      xhr.send(formData);
    });

    return result;
  } catch {
    console.warn('[video-storage] uploadVideo: API not available, using mock');
    const { mockUploadVideo } = await import('@/lib/mocks/video-storage.mock');
    return mockUploadVideo(file, metadata, onProgress);
  }
}

// ── PLAYER ──────────────────────────────────────────────────────────

export async function getVideoPlayerInfo(video: {
  storage_url: string;
  provider: StorageProvider;
  embed_url?: string | null;
  external_id?: string | null;
  thumbnail_url?: string | null;
}): Promise<VideoPlayerInfo> {
  try {
    if (isMock()) {
      const { mockGetVideoPlayerInfo } = await import('@/lib/mocks/video-storage.mock');
      return mockGetVideoPlayerInfo(video);
    }

    const res = await fetch('/api/video-storage/player-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] getVideoPlayerInfo: API not available, using mock');
    const { mockGetVideoPlayerInfo } = await import('@/lib/mocks/video-storage.mock');
    return mockGetVideoPlayerInfo(video);
  }
}

// ── PROVIDER CONFIG ─────────────────────────────────────────────────

export async function configureYouTube(code: string): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockConfigureYouTube } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureYouTube(code);
    }

    const res = await fetch('/api/video-storage/providers/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] configureYouTube: API not available, using mock');
    const { mockConfigureYouTube } = await import('@/lib/mocks/video-storage.mock');
    return mockConfigureYouTube(code);
  }
}

export async function configureVimeo(apiToken: string): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockConfigureVimeo } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureVimeo(apiToken);
    }

    const res = await fetch('/api/video-storage/providers/vimeo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_token: apiToken }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] configureVimeo: API not available, using mock');
    const { mockConfigureVimeo } = await import('@/lib/mocks/video-storage.mock');
    return mockConfigureVimeo(apiToken);
  }
}

export async function configureGoogleDrive(code: string): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockConfigureGoogleDrive } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureGoogleDrive(code);
    }

    const res = await fetch('/api/video-storage/providers/google-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] configureGoogleDrive: API not available, using mock');
    const { mockConfigureGoogleDrive } = await import('@/lib/mocks/video-storage.mock');
    return mockConfigureGoogleDrive(code);
  }
}

export async function configureS3(config: {
  endpoint: string;
  access_key_id: string;
  secret_access_key: string;
  bucket: string;
  region: string;
  custom_domain?: string;
}): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockConfigureS3 } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureS3(config);
    }

    const res = await fetch('/api/video-storage/providers/s3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] configureS3: API not available, using mock');
    const { mockConfigureS3 } = await import('@/lib/mocks/video-storage.mock');
    return mockConfigureS3(config);
  }
}

export async function disconnectProvider(
  provider: StorageProvider,
): Promise<StorageConfig> {
  try {
    if (isMock()) {
      const { mockDisconnectProvider } = await import('@/lib/mocks/video-storage.mock');
      return mockDisconnectProvider(provider);
    }

    const res = await fetch(`/api/video-storage/providers/${provider}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-storage] disconnectProvider: API not available, using mock');
    const { mockDisconnectProvider } = await import('@/lib/mocks/video-storage.mock');
    return mockDisconnectProvider(provider);
  }
}
