import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface FrameAnalysis {
  timestamp_sec: number;
  posture_score: number;
  balance_score: number;
  technique_notes: string[];
  corrections: string[];
}

export interface VideoAnalysis {
  id: string;
  video_id: string;
  overall_score: number;
  posture_score: number;
  balance_score: number;
  technique_score: number;
  highlights: string[];
  corrections: string[];
  summary: string;
  frame_analyses: FrameAnalysis[];
  analyzed_at: string;
}

export interface ComparisonResult {
  id: string;
  reference_video_id: string;
  student_video_id: string;
  similarity_score: number;
  posture_diff: number;
  timing_diff: number;
  key_differences: string[];
  recommendations: string[];
  compared_at: string;
}

export async function analyzeFrame(videoId: string, timestampSec: number): Promise<FrameAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeFrame } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeFrame(videoId, timestampSec);
    }
    try {
      const res = await fetch('/api/video-analysis/frame', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, timestampSec }) });
      if (!res.ok) throw new ServiceError(res.status, 'videoAnalysis.analyzeFrame');
      return res.json();
    } catch {
      console.warn('[video-analysis.analyzeFrame] API not available, using mock fallback');
      const { mockAnalyzeFrame } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeFrame(videoId, timestampSec);
    }
  } catch (error) { handleServiceError(error, 'videoAnalysis.analyzeFrame'); }
}

export async function analyzeVideo(videoId: string): Promise<VideoAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeVideo } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeVideo(videoId);
    }
    try {
      const res = await fetch('/api/video-analysis/full', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId }) });
      if (!res.ok) throw new ServiceError(res.status, 'videoAnalysis.analyzeVideo');
      return res.json();
    } catch {
      console.warn('[video-analysis.analyzeVideo] API not available, using mock fallback');
      const { mockAnalyzeVideo } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeVideo(videoId);
    }
  } catch (error) { handleServiceError(error, 'videoAnalysis.analyzeVideo'); }
}

export async function compareExecution(referenceVideoId: string, studentVideoId: string): Promise<ComparisonResult> {
  try {
    if (isMock()) {
      const { mockCompareExecution } = await import('@/lib/mocks/video-analysis.mock');
      return mockCompareExecution(referenceVideoId, studentVideoId);
    }
    try {
      const res = await fetch('/api/video-analysis/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referenceVideoId, studentVideoId }) });
      if (!res.ok) throw new ServiceError(res.status, 'videoAnalysis.compare');
      return res.json();
    } catch {
      console.warn('[video-analysis.compareExecution] API not available, using mock fallback');
      const { mockCompareExecution } = await import('@/lib/mocks/video-analysis.mock');
      return mockCompareExecution(referenceVideoId, studentVideoId);
    }
  } catch (error) { handleServiceError(error, 'videoAnalysis.compare'); }
}
