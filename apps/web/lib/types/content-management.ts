// ============================================================
// BlackBelt v2 — Content Management types (Professor)
// ============================================================

export type VideoSource = 'youtube' | 'vimeo' | 'upload' | 'gdrive';

export interface VideoInput {
  source: VideoSource;
  source_url: string;
  embed_url: string;
  source_video_id: string;
}

export interface ExtractedVideoInfo extends VideoInput {
  thumbnail_url: string;
  duration_seconds: number;
  original_title: string;
}

export interface VideoFormData {
  source: VideoSource;
  source_url: string;
  embed_url: string;
  source_video_id: string;
  thumbnail_url: string;
  duration_seconds: number;
  original_title: string;
  title: string;
  description: string;
  modality: string;
  min_belt: string;
  tags: string[];
  series_id: string | null;
  order: number;
  is_published: boolean;
  is_free: boolean;
  quiz_questions: QuizQuestionInput[];
}

export interface QuizQuestionInput {
  question: string;
  options: string[];
  correct_index: number;
  timestamp_hint?: string;
}

export interface SeriesFormData {
  title: string;
  description: string;
  modality: string;
  min_belt: string;
  gradient_css: string;
  tags: string[];
  category: 'fundamentos' | 'intermediario' | 'avancado' | 'competicao' | 'preparacao' | 'especial';
  is_published: boolean;
}

export interface TrailFormData {
  name: string;
  description: string;
  min_belt: string;
  series_ids: string[];
  certificate_available: boolean;
}

export interface AcademicMaterial {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'document' | 'image' | 'link' | 'lesson_plan';
  file_url: string;
  file_size_bytes: number;
  modality: string;
  min_belt: string;
  tags: string[];
  series_id: string | null;
  downloads: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicMaterialInput {
  title: string;
  description: string;
  type: 'pdf' | 'document' | 'image' | 'link' | 'lesson_plan';
  file_url: string;
  modality: string;
  min_belt: string;
  tags: string[];
  series_id: string | null;
  is_published: boolean;
}

export interface ContentStats {
  total_videos: number;
  published_videos: number;
  draft_videos: number;
  total_series: number;
  total_trails: number;
  total_materials: number;
  total_quiz_questions: number;
  total_views: number;
  total_completions: number;
  avg_quiz_score: number;
}

export interface VideoAnalytics {
  views: number;
  completions: number;
  avg_watch_time: number;
  quiz_avg_score: number;
}

export interface ContentVideo {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  source_url: string;
  embed_url: string;
  source_video_id: string;
  thumbnail_url: string;
  duration_seconds: number;
  original_title: string;
  modality: string;
  min_belt: string;
  tags: string[];
  series_id: string | null;
  series_title: string | null;
  order: number;
  is_published: boolean;
  is_free: boolean;
  professor_id: string;
  professor_name: string;
  views: number;
  completions: number;
  quiz_count: number;
  created_at: string;
  updated_at: string;
}
