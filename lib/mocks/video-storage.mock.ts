import type {
  StorageProvider,
  StorageConfig,
  UploadVideoMetadata,
  VideoUploadResult,
  VideoPlayerInfo,
  ConnectionTestResult,
  StorageStats,
  UploadProgress,
  YouTubeConfig,
  VimeoConfig,
  GoogleDriveConfig,
  S3Config,
} from '@/lib/types/video-storage';

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mock state ──────────────────────────────────────────────────────

let mockConfig: StorageConfig = {
  provider: 'supabase',
  youtube: null,
  vimeo: null,
  google_drive: null,
  s3: null,
  updated_at: '2026-03-15T10:00:00Z',
  updated_by: null,
};

// ── CONFIG ──────────────────────────────────────────────────────────

export async function mockGetStorageConfig(): Promise<StorageConfig> {
  await delay();
  return { ...mockConfig };
}

export async function mockUpdateStorageConfig(
  config: Partial<StorageConfig>,
): Promise<StorageConfig> {
  await delay();
  mockConfig = {
    ...mockConfig,
    ...config,
    updated_at: new Date().toISOString(),
  };
  return { ...mockConfig };
}

export async function mockTestConnection(
  provider: StorageProvider,
): Promise<ConnectionTestResult> {
  await delay(500);

  if (provider === 'supabase') {
    return {
      connected: true,
      details: 'Conexao com Supabase Storage estabelecida com sucesso.',
      provider_info: {
        bucket: 'videos',
        region: 'sa-east-1',
        used_mb: 8704,
      },
    };
  }

  if (provider === 'youtube' && mockConfig.youtube) {
    return {
      connected: true,
      details: `Conectado ao canal "${mockConfig.youtube.channel_name}".`,
      provider_info: {
        channel_id: mockConfig.youtube.channel_id,
        visibility: mockConfig.youtube.visibility,
      },
    };
  }

  if (provider === 'vimeo' && mockConfig.vimeo) {
    return {
      connected: true,
      details: `Conectado ao Vimeo (${mockConfig.vimeo.plan_name}).`,
      provider_info: {
        available_space_gb: mockConfig.vimeo.available_space_gb,
        privacy: mockConfig.vimeo.privacy,
      },
    };
  }

  if (provider === 'google_drive' && mockConfig.google_drive) {
    return {
      connected: true,
      details: `Conectado ao Google Drive — pasta "${mockConfig.google_drive.folder_name}".`,
      provider_info: {
        total_space_gb: mockConfig.google_drive.total_space_gb,
        used_space_gb: mockConfig.google_drive.used_space_gb,
      },
    };
  }

  if (provider === 's3' && mockConfig.s3) {
    return {
      connected: true,
      details: `Conectado ao bucket "${mockConfig.s3.bucket}" em ${mockConfig.s3.region}.`,
      provider_info: {
        endpoint: mockConfig.s3.endpoint,
        region: mockConfig.s3.region,
      },
    };
  }

  return {
    connected: false,
    details: `Provider "${provider}" nao esta configurado. Configure as credenciais primeiro.`,
    provider_info: null,
  };
}

export async function mockGetStorageStats(): Promise<StorageStats> {
  await delay();
  return {
    provider: mockConfig.provider,
    videos_count: 45,
    total_size_bytes: 8_589_934_592,
    total_size_display: '8.5 GB',
    cost_estimate_brl: 42.5,
  };
}

// ── UPLOAD ──────────────────────────────────────────────────────────

export async function mockUploadVideo(
  file: File,
  metadata: UploadVideoMetadata,
  onProgress?: (progress: UploadProgress) => void,
): Promise<VideoUploadResult> {
  const total = file.size;
  const steps = [0, 25, 50, 75, 100];

  for (const pct of steps) {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    if (onProgress) {
      onProgress({
        loaded: Math.round((pct / 100) * total),
        total,
        percentage: pct,
        estimated_seconds_remaining: pct < 100 ? Math.round(((100 - pct) / 25) * 0.4) : null,
      });
    }
  }

  const videoId = `vid-${Date.now()}`;
  const providerMap: Record<StorageProvider, string | null> = {
    supabase: null,
    youtube: `yt-${videoId}`,
    vimeo: `vim-${videoId}`,
    google_drive: `gd-${videoId}`,
    s3: null,
  };

  const embedMap: Record<StorageProvider, string | null> = {
    supabase: null,
    youtube: `https://www.youtube.com/embed/yt-${videoId}`,
    vimeo: `https://player.vimeo.com/video/vim-${videoId}`,
    google_drive: `https://drive.google.com/file/d/gd-${videoId}/preview`,
    s3: null,
  };

  return {
    provider: mockConfig.provider,
    storage_url: `/mock/videos/${videoId}.mp4`,
    storage_path: `academies/${metadata.academy_id}/videos/${videoId}.mp4`,
    thumbnail_url: `/mock/thumbs/${videoId}.jpg`,
    external_id: providerMap[mockConfig.provider],
    embed_url: embedMap[mockConfig.provider],
    file_size: file.size,
    duration: 487,
  };
}

// ── PLAYER ──────────────────────────────────────────────────────────

export async function mockGetVideoPlayerInfo(video: {
  storage_url: string;
  provider: StorageProvider;
  embed_url?: string | null;
  external_id?: string | null;
  thumbnail_url?: string | null;
}): Promise<VideoPlayerInfo> {
  await delay();

  const typeMap: Record<StorageProvider, VideoPlayerInfo['type']> = {
    supabase: 'native',
    youtube: 'youtube',
    vimeo: 'vimeo',
    google_drive: 'gdrive',
    s3: 'native',
  };

  const playerType = typeMap[video.provider];

  if (playerType === 'youtube' && video.embed_url) {
    return {
      type: 'youtube',
      url: video.embed_url,
      poster_url: video.thumbnail_url ?? null,
    };
  }

  if (playerType === 'vimeo' && video.embed_url) {
    return {
      type: 'vimeo',
      url: video.embed_url,
      poster_url: video.thumbnail_url ?? null,
    };
  }

  if (playerType === 'gdrive' && video.embed_url) {
    return {
      type: 'gdrive',
      url: video.embed_url,
      poster_url: video.thumbnail_url ?? null,
    };
  }

  return {
    type: 'native',
    url: video.storage_url,
    poster_url: video.thumbnail_url ?? null,
  };
}

// ── PROVIDER CONFIG ─────────────────────────────────────────────────

export async function mockConfigureYouTube(_code: string): Promise<StorageConfig> {
  await delay(600);

  const youtubeConfig: YouTubeConfig = {
    access_token: 'mock-yt-access-token',
    refresh_token: 'mock-yt-refresh-token',
    channel_id: 'UC_mock_channel_123',
    channel_name: 'BlackBelt Academy Videos',
    visibility: 'unlisted',
    auto_playlist: true,
    playlist_by_academy: true,
    playlist_by_modality: false,
  };

  mockConfig = {
    ...mockConfig,
    provider: 'youtube',
    youtube: youtubeConfig,
    updated_at: new Date().toISOString(),
    updated_by: 'admin-1',
  };

  return { ...mockConfig };
}

export async function mockConfigureVimeo(_apiToken: string): Promise<StorageConfig> {
  await delay(600);

  const vimeoConfig: VimeoConfig = {
    api_token: 'mock-vimeo-token',
    folder_id: 'folder-12345',
    folder_name: 'BlackBelt Videos',
    privacy: 'disable',
    plan_name: 'Vimeo Pro',
    available_space_gb: 250,
  };

  mockConfig = {
    ...mockConfig,
    provider: 'vimeo',
    vimeo: vimeoConfig,
    updated_at: new Date().toISOString(),
    updated_by: 'admin-1',
  };

  return { ...mockConfig };
}

export async function mockConfigureGoogleDrive(_code: string): Promise<StorageConfig> {
  await delay(600);

  const driveConfig: GoogleDriveConfig = {
    access_token: 'mock-gdrive-access-token',
    refresh_token: 'mock-gdrive-refresh-token',
    folder_id: 'gdrive-folder-abc123',
    folder_name: 'BlackBelt Aulas',
    subfolder_by_academy: true,
    subfolder_by_modality: true,
    share_with_link: false,
    total_space_gb: 15,
    used_space_gb: 3.2,
  };

  mockConfig = {
    ...mockConfig,
    provider: 'google_drive',
    google_drive: driveConfig,
    updated_at: new Date().toISOString(),
    updated_by: 'admin-1',
  };

  return { ...mockConfig };
}

export async function mockConfigureS3(config: {
  endpoint: string;
  access_key_id: string;
  secret_access_key: string;
  bucket: string;
  region: string;
  custom_domain?: string;
}): Promise<StorageConfig> {
  await delay(600);

  const s3Config: S3Config = {
    endpoint: config.endpoint,
    access_key_id: config.access_key_id,
    secret_access_key: config.secret_access_key,
    bucket: config.bucket,
    region: config.region,
    custom_domain: config.custom_domain ?? null,
  };

  mockConfig = {
    ...mockConfig,
    provider: 's3',
    s3: s3Config,
    updated_at: new Date().toISOString(),
    updated_by: 'admin-1',
  };

  return { ...mockConfig };
}

export async function mockDisconnectProvider(
  provider: StorageProvider,
): Promise<StorageConfig> {
  await delay();

  const providerKeyMap: Record<StorageProvider, keyof StorageConfig | null> = {
    supabase: null,
    youtube: 'youtube',
    vimeo: 'vimeo',
    google_drive: 'google_drive',
    s3: 's3',
  };

  const key = providerKeyMap[provider];

  if (key && key in mockConfig) {
    mockConfig = {
      ...mockConfig,
      [key]: null,
      provider: provider === mockConfig.provider ? 'supabase' : mockConfig.provider,
      updated_at: new Date().toISOString(),
      updated_by: 'admin-1',
    };
  }

  return { ...mockConfig };
}
