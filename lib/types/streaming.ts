export interface StreamingVideo {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  thumbnail_url: string;
  video_url: string;
  gradient_css: string;
  professor_id: string;
  professor_name: string;
  modality: string;
  min_belt: string;
  order: number;
  series_id: string;
  tags: string[];
  created_at: string;
}

export interface StreamingSeries {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  gradient_css: string;
  professor_id: string;
  professor_name: string;
  modality: string;
  min_belt: string;
  videos: StreamingVideo[];
  total_duration: string;
  category: 'fundamentos' | 'intermediario' | 'avancado' | 'competicao' | 'preparacao' | 'especial';
  tags: string[];
}

export interface StreamingTrail {
  id: string;
  name: string;
  description: string;
  gradient_css: string;
  series: StreamingSeries[];
  total_videos: number;
  total_duration: string;
  min_belt: string;
  certificate_available: boolean;
}

export interface WatchProgress {
  video_id: string;
  student_id: string;
  progress_seconds: number;
  total_seconds: number;
  completed: boolean;
  completed_at?: string;
  last_watched_at: string;
}

export interface QuizQuestion {
  id: string;
  video_id: string;
  question: string;
  options: string[];
  correct_index: number;
  timestamp_hint?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  xp_gained: number;
  passed: boolean;
  wrong_answers: { question: string; hint: string }[];
}

export interface StreamingCertificate {
  id: string;
  student_name: string;
  trail_name: string;
  professor_name: string;
  academy_name: string;
  total_videos: number;
  total_duration: string;
  score: number;
  issued_at: string;
  verification_code: string;
  pdf_url: string;
}

export interface EpisodeCompletionResult {
  xp_gained: number;
  next_episode: StreamingVideo | null;
  quiz_available: boolean;
}

export interface StreamingLibrary {
  featured: StreamingSeries | null;
  continue_watching: WatchProgress[];
  recommended: StreamingSeries[];
  trails: StreamingTrail[];
  all_series: StreamingSeries[];
  recent: StreamingVideo[];
}

export interface SeriesDetail {
  series: StreamingSeries;
  progress: WatchProgress[];
  quiz_questions: Record<string, QuizQuestion[]>;
}

export interface TrailProgress {
  trail: StreamingTrail;
  completed_videos: number;
  total_videos: number;
  completed_series: string[];
  average_quiz_score: number;
  certificate: StreamingCertificate | null;
}
