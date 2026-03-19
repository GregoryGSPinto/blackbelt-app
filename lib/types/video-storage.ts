// ============================================================
// BlackBelt v2 — Video Storage Types
//
// Providers de armazenamento de video suportados pelo sistema.
// ============================================================

export type StorageProvider = 'supabase' | 'youtube' | 'vimeo' | 'google_drive' | 's3';

export interface YouTubeConfig {
  access_token: string;
  refresh_token: string;
  channel_id: string;
  channel_name: string;
  visibility: 'unlisted' | 'private' | 'public';
  auto_playlist: boolean;
  playlist_by_academy: boolean;
  playlist_by_modality: boolean;
}

export interface VimeoConfig {
  api_token: string;
  folder_id: string | null;
  folder_name: string;
  privacy: 'anybody' | 'nobody' | 'disable';
  plan_name: string;
  available_space_gb: number;
}

export interface GoogleDriveConfig {
  access_token: string;
  refresh_token: string;
  folder_id: string;
  folder_name: string;
  subfolder_by_academy: boolean;
  subfolder_by_modality: boolean;
  share_with_link: boolean;
  total_space_gb: number;
  used_space_gb: number;
}

export interface S3Config {
  endpoint: string;
  access_key_id: string;
  secret_access_key: string;
  bucket: string;
  region: string;
  custom_domain: string | null;
}

export interface StorageConfig {
  provider: StorageProvider;
  youtube: YouTubeConfig | null;
  vimeo: VimeoConfig | null;
  google_drive: GoogleDriveConfig | null;
  s3: S3Config | null;
  updated_at: string;
  updated_by: string | null;
}

export interface UploadVideoMetadata {
  title: string;
  description: string;
  academy_id: string;
  professor_id: string;
  modality: string;
  belt_level: string;
  difficulty: string;
  tags: string[];
  audience: string[];
  class_ids: string[];
}

export interface VideoUploadResult {
  provider: StorageProvider;
  storage_url: string;
  storage_path: string;
  thumbnail_url: string;
  external_id: string | null;
  embed_url: string | null;
  file_size: number;
  duration: number | null;
}

export interface VideoPlayerInfo {
  type: 'native' | 'youtube' | 'vimeo' | 'gdrive' | 'iframe';
  url: string;
  poster_url: string | null;
}

export interface ConnectionTestResult {
  connected: boolean;
  details: string;
  provider_info: Record<string, string | number> | null;
}

export interface StorageStats {
  provider: StorageProvider;
  videos_count: number;
  total_size_bytes: number;
  total_size_display: string;
  cost_estimate_brl: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  estimated_seconds_remaining: number | null;
}
