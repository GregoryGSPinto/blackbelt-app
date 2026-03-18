import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

export async function analyzeMatch(videoId: string): Promise<MatchAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeMatch } = await import('@/lib/mocks/match-analysis.mock');
      return mockAnalyzeMatch(videoId);
    }
    try {
      const res = await fetch('/api/ai/match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      return res.json();
    } catch {
      console.warn('[match-analysis.analyzeMatch] API not available, using fallback');
      return { id: '', video_id: '', duration_sec: 0, rounds: 0, timeline: [], positions: [], submission_attempts: [], takedowns: [], points_breakdown: { student_total: 0, opponent_total: 0, student_advantages: 0, opponent_advantages: 0, student_penalties: 0, opponent_penalties: 0, categories: [] }, tactical_summary: '', improvement_areas: [], analyzed_at: '' } as MatchAnalysis;
    }
  } catch (error) {
    handleServiceError(error, 'matchAnalysis.analyze');
  }
}

export async function addAnnotation(videoId: string, timestampSec: number, text: string): Promise<ManualAnnotation> {
  try {
    if (isMock()) {
      const { mockAddAnnotation } = await import('@/lib/mocks/match-analysis.mock');
      return mockAddAnnotation(videoId, timestampSec, text);
    }
    try {
      const res = await fetch('/api/ai/match-analysis/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, timestampSec, text }),
      });
      return res.json();
    } catch {
      console.warn('[match-analysis.addAnnotation] API not available, using fallback');
      return { id: '', video_id: '', timestamp_sec: 0, text: '', author_id: '', created_at: '' } as ManualAnnotation;
    }
  } catch (error) {
    handleServiceError(error, 'matchAnalysis.annotate');
  }
}

export async function getAnnotations(videoId: string): Promise<ManualAnnotation[]> {
  try {
    if (isMock()) {
      const { mockGetAnnotations } = await import('@/lib/mocks/match-analysis.mock');
      return mockGetAnnotations(videoId);
    }
    try {
      const res = await fetch(`/api/ai/match-analysis/annotations/${videoId}`);
      return res.json();
    } catch {
      console.warn('[match-analysis.getAnnotations] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'matchAnalysis.getAnnotations');
  }
}

export async function shareAnalysis(videoId: string, studentId: string): Promise<{ shared: boolean }> {
  try {
    if (isMock()) {
      const { mockShareAnalysis } = await import('@/lib/mocks/match-analysis.mock');
      return mockShareAnalysis(videoId, studentId);
    }
    try {
      const res = await fetch('/api/ai/match-analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, studentId }),
      });
      return res.json();
    } catch {
      console.warn('[match-analysis.shareAnalysis] API not available, using fallback');
      return { shared: false };
    }
  } catch (error) {
    handleServiceError(error, 'matchAnalysis.share');
  }
}
