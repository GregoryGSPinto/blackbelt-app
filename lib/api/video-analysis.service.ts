import { isMock } from '@/lib/env';

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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Check for cached frame analysis in videos.metadata
      const { data: video } = await supabase
        .from('videos')
        .select('metadata')
        .eq('id', videoId)
        .single();

      const meta = (video?.metadata as Record<string, unknown>) || {};
      const cachedFrames = (meta.frame_analyses as FrameAnalysis[]) || [];
      const cached = cachedFrames.find((f) => f.timestamp_sec === timestampSec);
      if (cached) {
        return cached;
      }

      // AI analysis not available without API key — return graceful fallback
      // In production, this would call the AI API and cache results
      console.error('[analyzeFrame] AI analysis not configured, returning fallback');

      const fallback: FrameAnalysis = {
        timestamp_sec: timestampSec,
        posture_score: 0,
        balance_score: 0,
        technique_notes: [],
        corrections: ['AI analysis not configured. Set ANTHROPIC_API_KEY to enable.'],
      };

      // Save the analysis request to metadata for future processing
      const updatedFrames = [...cachedFrames, fallback];
      await supabase
        .from('videos')
        .update({
          metadata: { ...meta, frame_analyses: updatedFrames, analysis_pending: true },
        })
        .eq('id', videoId);

      return fallback;
    } catch (err) {
      console.error('[video-analysis.analyzeFrame] Supabase not available, using mock fallback', err);
      const { mockAnalyzeFrame } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeFrame(videoId, timestampSec);
    }
  } catch (error) {
    console.error('[analyzeFrame] Fallback:', error);
    return { timestamp_sec: timestampSec, posture_score: 0, balance_score: 0, technique_notes: [], corrections: [] };
  }
}

export async function analyzeVideo(videoId: string): Promise<VideoAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzeVideo } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeVideo(videoId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Check for cached full analysis in videos.metadata
      const { data: video } = await supabase
        .from('videos')
        .select('metadata')
        .eq('id', videoId)
        .single();

      const meta = (video?.metadata as Record<string, unknown>) || {};
      const cachedAnalysis = meta.ai_analysis as VideoAnalysis | undefined;
      if (cachedAnalysis && cachedAnalysis.analyzed_at) {
        return cachedAnalysis;
      }

      // AI analysis not available — save request and return graceful fallback
      console.error('[analyzeVideo] AI analysis not configured, returning fallback');

      const fallback: VideoAnalysis = {
        id: '',
        video_id: videoId,
        overall_score: 0,
        posture_score: 0,
        balance_score: 0,
        technique_score: 0,
        highlights: [],
        corrections: ['AI analysis not configured. Set ANTHROPIC_API_KEY to enable.'],
        summary: 'Analysis pending — AI service not configured.',
        frame_analyses: [],
        analyzed_at: '',
      };

      // Save the request to DB for future background processing
      await supabase
        .from('videos')
        .update({
          metadata: { ...meta, analysis_requested: true, analysis_requested_at: new Date().toISOString() },
        })
        .eq('id', videoId);

      return fallback;
    } catch (err) {
      console.error('[video-analysis.analyzeVideo] Supabase not available, using mock fallback', err);
      const { mockAnalyzeVideo } = await import('@/lib/mocks/video-analysis.mock');
      return mockAnalyzeVideo(videoId);
    }
  } catch (error) {
    console.error('[analyzeVideo] Fallback:', error);
    return { id: '', video_id: videoId, overall_score: 0, posture_score: 0, balance_score: 0, technique_score: 0, highlights: [], corrections: [], summary: '', frame_analyses: [], analyzed_at: '' };
  }
}

export async function compareExecution(referenceVideoId: string, studentVideoId: string): Promise<ComparisonResult> {
  try {
    if (isMock()) {
      const { mockCompareExecution } = await import('@/lib/mocks/video-analysis.mock');
      return mockCompareExecution(referenceVideoId, studentVideoId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Check for cached comparison in the student video's metadata
      const { data: video } = await supabase
        .from('videos')
        .select('metadata')
        .eq('id', studentVideoId)
        .single();

      const meta = (video?.metadata as Record<string, unknown>) || {};
      const cachedComparisons = (meta.comparisons as ComparisonResult[]) || [];
      const cached = cachedComparisons.find((c) => c.reference_video_id === referenceVideoId);
      if (cached) {
        return cached;
      }

      // AI comparison not available — save request and return graceful fallback
      console.error('[compareExecution] AI analysis not configured, returning fallback');

      const fallback: ComparisonResult = {
        id: '',
        reference_video_id: referenceVideoId,
        student_video_id: studentVideoId,
        similarity_score: 0,
        posture_diff: 0,
        timing_diff: 0,
        key_differences: [],
        recommendations: ['AI comparison not configured. Set ANTHROPIC_API_KEY to enable.'],
        compared_at: '',
      };

      // Save comparison request to DB for future processing
      await supabase
        .from('videos')
        .update({
          metadata: {
            ...meta,
            comparison_requested: true,
            comparison_reference_id: referenceVideoId,
            comparison_requested_at: new Date().toISOString(),
          },
        })
        .eq('id', studentVideoId);

      return fallback;
    } catch (err) {
      console.error('[video-analysis.compareExecution] Supabase not available, using mock fallback', err);
      const { mockCompareExecution } = await import('@/lib/mocks/video-analysis.mock');
      return mockCompareExecution(referenceVideoId, studentVideoId);
    }
  } catch (error) {
    console.error('[compareExecution] Fallback:', error);
    return { id: '', reference_video_id: referenceVideoId, student_video_id: studentVideoId, similarity_score: 0, posture_diff: 0, timing_diff: 0, key_differences: [], recommendations: [], compared_at: '' };
  }
}
