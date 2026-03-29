import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type MatchEventType =
  | 'takedown'
  | 'sweep'
  | 'pass'
  | 'mount'
  | 'back_take'
  | 'submission_attempt'
  | 'submission'
  | 'escape'
  | 'stand_up'
  | 'penalty';

export interface MatchEvent {
  id: string;
  event_type: MatchEventType;
  timestamp_sec: number;
  athlete: 'student' | 'opponent';
  description: string;
  points: number;
}

export interface PositionTime {
  position: string;
  athlete: 'student' | 'opponent' | 'neutral';
  time_spent_sec: number;
  percentage: number;
}

export interface SubmissionAttempt {
  id: string;
  technique: string;
  timestamp_sec: number;
  athlete: 'student' | 'opponent';
  success: boolean;
  defense_used: string | null;
}

export interface Takedown {
  id: string;
  technique: string;
  timestamp_sec: number;
  athlete: 'student' | 'opponent';
  success: boolean;
}

export interface PointsBreakdown {
  student_total: number;
  opponent_total: number;
  student_advantages: number;
  opponent_advantages: number;
  student_penalties: number;
  opponent_penalties: number;
  categories: { category: string; student: number; opponent: number }[];
}

export interface ImprovementArea {
  area: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggested_drills: string[];
}

export interface MatchAnalysis {
  id: string;
  video_id: string;
  duration_sec: number;
  rounds: number;
  timeline: MatchEvent[];
  positions: PositionTime[];
  submission_attempts: SubmissionAttempt[];
  takedowns: Takedown[];
  points_breakdown: PointsBreakdown;
  tactical_summary: string;
  improvement_areas: ImprovementArea[];
  analyzed_at: string;
}

export interface ManualAnnotation {
  id: string;
  video_id: string;
  timestamp_sec: number;
  text: string;
  author_id: string;
  created_at: string;
}

const EMPTY_ANALYSIS: MatchAnalysis = {
  id: '', video_id: '', duration_sec: 0, rounds: 0, timeline: [], positions: [],
  submission_attempts: [], takedowns: [],
  points_breakdown: { student_total: 0, opponent_total: 0, student_advantages: 0, opponent_advantages: 0, student_penalties: 0, opponent_penalties: 0, categories: [] },
  tactical_summary: '', improvement_areas: [], analyzed_at: '',
};

export async function analyzeMatch(videoId: string): Promise<MatchAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeMatch } = await import('@/lib/mocks/match-analysis.mock');
      return mockAnalyzeMatch(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('match_analyses')
      .select('*')
      .eq('video_id', videoId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      logServiceError(error, 'match-analysis');
      return { ...EMPTY_ANALYSIS, video_id: videoId };
    }

    return data as unknown as MatchAnalysis;
  } catch (error) {
    logServiceError(error, 'match-analysis');
    return { ...EMPTY_ANALYSIS, video_id: videoId };
  }
}

export async function addAnnotation(videoId: string, timestampSec: number, text: string): Promise<ManualAnnotation> {
  try {
    if (isMock()) {
      const { mockAddAnnotation } = await import('@/lib/mocks/match-analysis.mock');
      return mockAddAnnotation(videoId, timestampSec, text);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('match_annotations')
      .insert({ video_id: videoId, timestamp_sec: timestampSec, text })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'match-analysis');
      return { id: '', video_id: videoId, timestamp_sec: timestampSec, text, author_id: '', created_at: '' };
    }

    return data as unknown as ManualAnnotation;
  } catch (error) {
    logServiceError(error, 'match-analysis');
    return { id: '', video_id: videoId, timestamp_sec: timestampSec, text, author_id: '', created_at: '' };
  }
}

export async function getAnnotations(videoId: string): Promise<ManualAnnotation[]> {
  try {
    if (isMock()) {
      const { mockGetAnnotations } = await import('@/lib/mocks/match-analysis.mock');
      return mockGetAnnotations(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('match_annotations')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp_sec', { ascending: true });

    if (error || !data) {
      logServiceError(error, 'match-analysis');
      return [];
    }

    return data as unknown as ManualAnnotation[];
  } catch (error) {
    logServiceError(error, 'match-analysis');
    return [];
  }
}

export async function shareAnalysis(videoId: string, studentId: string): Promise<{ shared: boolean }> {
  try {
    if (isMock()) {
      const { mockShareAnalysis } = await import('@/lib/mocks/match-analysis.mock');
      return mockShareAnalysis(videoId, studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('match_analysis_shares')
      .insert({ video_id: videoId, student_id: studentId });

    if (error) {
      logServiceError(error, 'match-analysis');
      return { shared: false };
    }

    return { shared: true };
  } catch (error) {
    logServiceError(error, 'match-analysis');
    return { shared: false };
  }
}
