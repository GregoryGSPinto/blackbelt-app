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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('platform_settings')
        .select('value, updated_at, updated_by')
        .eq('key', 'video_storage')
        .single();

      if (error || !data) {
        console.error('[video-storage] getStorageConfig: Supabase error:', error?.message);
        const { mockGetStorageConfig } = await import('@/lib/mocks/video-storage.mock');
        return mockGetStorageConfig();
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'supabase',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] getStorageConfig: Supabase not available, using mock', err);
      const { mockGetStorageConfig } = await import('@/lib/mocks/video-storage.mock');
      return mockGetStorageConfig();
    }
  } catch {
    console.error('[video-storage] getStorageConfig: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Fetch current config, merge, then upsert
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const merged = { ...currentVal, ...config };

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert(
          { key: 'video_storage', value: merged, updated_by: userId },
          { onConflict: 'key' },
        )
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] updateStorageConfig: Supabase error:', error?.message);
        const { mockUpdateStorageConfig } = await import('@/lib/mocks/video-storage.mock');
        return mockUpdateStorageConfig(config);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'supabase',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] updateStorageConfig: Supabase not available, using mock', err);
      const { mockUpdateStorageConfig } = await import('@/lib/mocks/video-storage.mock');
      return mockUpdateStorageConfig(config);
    }
  } catch {
    console.error('[video-storage] updateStorageConfig: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // For supabase provider, test by listing storage buckets
      if (provider === 'supabase') {
        const { error } = await supabase.storage.listBuckets();
        return {
          connected: !error,
          details: error ? `Connection failed: ${error.message}` : 'Connected to Supabase Storage',
          provider_info: error ? null : { provider: 'supabase' },
        };
      }

      // For other providers, check if config exists in platform_settings
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const val = (data?.value as Record<string, unknown>) || {};
      const providerConfig = val[provider === 'google_drive' ? 'google_drive' : provider];

      return {
        connected: !!providerConfig,
        details: providerConfig ? `${provider} configured` : `${provider} not configured`,
        provider_info: providerConfig ? { provider } : null,
      };
    } catch (err) {
      console.error('[video-storage] testConnection: Supabase not available, using mock', err);
      const { mockTestConnection } = await import('@/lib/mocks/video-storage.mock');
      return mockTestConnection(provider);
    }
  } catch {
    console.error('[video-storage] testConnection: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get current provider
      const { data: configData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const configVal = (configData?.value as Record<string, unknown>) || {};
      const provider = (configVal.provider as StorageProvider) || 'supabase';

      // Count videos and sum sizes
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      const { data: sizeData } = await supabase
        .from('videos')
        .select('file_size_bytes');

      const totalBytes = (sizeData || []).reduce(
        (sum: number, row: Record<string, unknown>) => sum + (Number(row.file_size_bytes) || 0),
        0,
      );

      const formatSize = (bytes: number): string => {
        if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
        if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
        return `${(bytes / 1e3).toFixed(1)} KB`;
      };

      // Rough cost estimate: R$0.023/GB (Supabase pricing)
      const costBrl = (totalBytes / 1e9) * 0.023;

      return {
        provider,
        videos_count: count || 0,
        total_size_bytes: totalBytes,
        total_size_display: formatSize(totalBytes),
        cost_estimate_brl: Math.round(costBrl * 100) / 100,
      };
    } catch (err) {
      console.error('[video-storage] getStorageStats: Supabase not available, using mock', err);
      const { mockGetStorageStats } = await import('@/lib/mocks/video-storage.mock');
      return mockGetStorageStats();
    }
  } catch {
    console.error('[video-storage] getStorageStats: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Signal initial progress
      onProgress?.({ loaded: 0, total: file.size, percentage: 0, estimated_seconds_remaining: null });

      // Upload file to Supabase Storage
      const filePath = `videos/${metadata.academy_id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error('[video-storage] uploadVideo: storage upload failed:', uploadError.message);
        // Fall through to insert record without storage
      }

      onProgress?.({ loaded: file.size, total: file.size, percentage: 80, estimated_seconds_remaining: 2 });

      // Get public URL
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);
      const storageUrl = urlData?.publicUrl || '';

      // Insert video record
      const { data, error } = await supabase
        .from('videos')
        .insert({
          academy_id: metadata.academy_id,
          title: metadata.title,
          description: metadata.description,
          url: storageUrl,
          storage_path: filePath,
          storage_url: storageUrl,
          uploaded_by: metadata.professor_id,
          modality: metadata.modality,
          belt_level: metadata.belt_level,
          difficulty: metadata.difficulty,
          tags: metadata.tags,
          file_size_bytes: file.size,
          mime_type: file.type,
          upload_status: 'ready',
          is_published: true,
          provider: 'supabase',
        })
        .select()
        .single();

      if (error || !data) {
        console.error('[video-storage] uploadVideo: Supabase insert error:', error?.message);
        const { mockUploadVideo } = await import('@/lib/mocks/video-storage.mock');
        return mockUploadVideo(file, metadata, onProgress);
      }

      // Insert audience records
      if (metadata.audience?.length) {
        const audienceRows = metadata.audience.map((a) => ({
          video_id: data.id,
          audience: a,
        }));
        await supabase.from('video_audiences').insert(audienceRows);
      }

      // Insert class assignments
      if (metadata.class_ids?.length) {
        const classRows = metadata.class_ids.map((cid) => ({
          video_id: data.id,
          class_id: cid,
          assigned_by: metadata.professor_id,
        }));
        await supabase.from('video_class_assignments').insert(classRows);
      }

      onProgress?.({ loaded: file.size, total: file.size, percentage: 100, estimated_seconds_remaining: 0 });

      return {
        provider: 'supabase',
        storage_url: storageUrl,
        storage_path: filePath,
        thumbnail_url: data.thumbnail_storage_url || '',
        external_id: null,
        embed_url: null,
        file_size: file.size,
        duration: data.duration || null,
      };
    } catch (err) {
      console.error('[video-storage] uploadVideo: Supabase not available, using mock', err);
      const { mockUploadVideo } = await import('@/lib/mocks/video-storage.mock');
      return mockUploadVideo(file, metadata, onProgress);
    }
  } catch {
    console.error('[video-storage] uploadVideo: API not available, using mock');
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

    try {
      // Compose player info from the video data — no DB query needed
      if (video.provider === 'youtube' && video.external_id) {
        return {
          type: 'youtube',
          url: video.embed_url || `https://www.youtube.com/embed/${video.external_id}`,
          poster_url: video.thumbnail_url || `https://img.youtube.com/vi/${video.external_id}/hqdefault.jpg`,
        };
      }

      if (video.provider === 'vimeo' && video.external_id) {
        return {
          type: 'vimeo',
          url: video.embed_url || `https://player.vimeo.com/video/${video.external_id}`,
          poster_url: video.thumbnail_url || null,
        };
      }

      if (video.provider === 'google_drive' && video.external_id) {
        return {
          type: 'gdrive',
          url: video.embed_url || `https://drive.google.com/file/d/${video.external_id}/preview`,
          poster_url: video.thumbnail_url || null,
        };
      }

      // Default: native player (supabase or s3)
      return {
        type: 'native',
        url: video.storage_url,
        poster_url: video.thumbnail_url || null,
      };
    } catch (err) {
      console.error('[video-storage] getVideoPlayerInfo: error composing info, using mock', err);
      const { mockGetVideoPlayerInfo } = await import('@/lib/mocks/video-storage.mock');
      return mockGetVideoPlayerInfo(video);
    }
  } catch {
    console.error('[video-storage] getVideoPlayerInfo: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Store the OAuth code/config in platform_settings
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const merged = {
        ...currentVal,
        provider: 'youtube',
        youtube: { oauth_code: code, configured: true },
      };

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'video_storage', value: merged, updated_by: userId }, { onConflict: 'key' })
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] configureYouTube: Supabase error:', error?.message);
        const { mockConfigureYouTube } = await import('@/lib/mocks/video-storage.mock');
        return mockConfigureYouTube(code);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'youtube',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] configureYouTube: Supabase not available, using mock', err);
      const { mockConfigureYouTube } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureYouTube(code);
    }
  } catch {
    console.error('[video-storage] configureYouTube: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const merged = {
        ...currentVal,
        provider: 'vimeo',
        vimeo: { api_token: apiToken, configured: true },
      };

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'video_storage', value: merged, updated_by: userId }, { onConflict: 'key' })
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] configureVimeo: Supabase error:', error?.message);
        const { mockConfigureVimeo } = await import('@/lib/mocks/video-storage.mock');
        return mockConfigureVimeo(apiToken);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'vimeo',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] configureVimeo: Supabase not available, using mock', err);
      const { mockConfigureVimeo } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureVimeo(apiToken);
    }
  } catch {
    console.error('[video-storage] configureVimeo: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const merged = {
        ...currentVal,
        provider: 'google_drive',
        google_drive: { oauth_code: code, configured: true },
      };

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'video_storage', value: merged, updated_by: userId }, { onConflict: 'key' })
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] configureGoogleDrive: Supabase error:', error?.message);
        const { mockConfigureGoogleDrive } = await import('@/lib/mocks/video-storage.mock');
        return mockConfigureGoogleDrive(code);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'google_drive',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] configureGoogleDrive: Supabase not available, using mock', err);
      const { mockConfigureGoogleDrive } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureGoogleDrive(code);
    }
  } catch {
    console.error('[video-storage] configureGoogleDrive: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const merged = {
        ...currentVal,
        provider: 's3',
        s3: config,
      };

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'video_storage', value: merged, updated_by: userId }, { onConflict: 'key' })
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] configureS3: Supabase error:', error?.message);
        const { mockConfigureS3 } = await import('@/lib/mocks/video-storage.mock');
        return mockConfigureS3(config);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 's3',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] configureS3: Supabase not available, using mock', err);
      const { mockConfigureS3 } = await import('@/lib/mocks/video-storage.mock');
      return mockConfigureS3(config);
    }
  } catch {
    console.error('[video-storage] configureS3: API not available, using mock');
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

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: existing } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'video_storage')
        .single();

      const currentVal = (existing?.value as Record<string, unknown>) || {};
      const providerKey = provider === 'google_drive' ? 'google_drive' : provider;
      const merged = { ...currentVal, [providerKey]: null };

      // If disconnecting the active provider, revert to supabase
      if (currentVal.provider === provider) {
        merged.provider = 'supabase';
      }

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'video_storage', value: merged, updated_by: userId }, { onConflict: 'key' })
        .select('value, updated_at, updated_by')
        .single();

      if (error || !data) {
        console.error('[video-storage] disconnectProvider: Supabase error:', error?.message);
        const { mockDisconnectProvider } = await import('@/lib/mocks/video-storage.mock');
        return mockDisconnectProvider(provider);
      }

      const val = data.value as Record<string, unknown>;
      return {
        provider: (val.provider as StorageProvider) || 'supabase',
        youtube: (val.youtube as StorageConfig['youtube']) || null,
        vimeo: (val.vimeo as StorageConfig['vimeo']) || null,
        google_drive: (val.google_drive as StorageConfig['google_drive']) || null,
        s3: (val.s3 as StorageConfig['s3']) || null,
        updated_at: data.updated_at || '',
        updated_by: (data.updated_by as string) || null,
      };
    } catch (err) {
      console.error('[video-storage] disconnectProvider: Supabase not available, using mock', err);
      const { mockDisconnectProvider } = await import('@/lib/mocks/video-storage.mock');
      return mockDisconnectProvider(provider);
    }
  } catch {
    console.error('[video-storage] disconnectProvider: API not available, using mock');
    const { mockDisconnectProvider } = await import('@/lib/mocks/video-storage.mock');
    return mockDisconnectProvider(provider);
  }
}
