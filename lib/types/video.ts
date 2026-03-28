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
