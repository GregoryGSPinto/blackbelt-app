import { isMock } from '@/lib/env';
import type {
  StreamingLibrary,
  SeriesDetail,
  StreamingVideo,
  WatchProgress,
  StreamingSeries,
  EpisodeCompletionResult,
  QuizResult,
  StreamingTrail,
  TrailProgress,
  StreamingCertificate,
} from '@/lib/types/streaming';

export async function getLibrary(profileId: string, role: string, belt: string): Promise<StreamingLibrary> {
  if (isMock()) {
    const { mockGetLibrary } = await import('@/lib/mocks/streaming.mock');
    return mockGetLibrary(profileId, role, belt);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_library')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error || !data) {
    console.error('[getLibrary] Supabase error:', error?.message);
    const { mockGetLibrary } = await import('@/lib/mocks/streaming.mock');
    return mockGetLibrary(profileId, role, belt);
  }
  return data as unknown as StreamingLibrary;
}

export async function getSeriesDetail(seriesId: string): Promise<SeriesDetail> {
  if (isMock()) {
    const { mockGetSeriesDetail } = await import('@/lib/mocks/streaming.mock');
    return mockGetSeriesDetail(seriesId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_series')
    .select('*')
    .eq('id', seriesId)
    .single();
  if (error || !data) {
    console.error('[getSeriesDetail] Supabase error:', error?.message);
    const { mockGetSeriesDetail } = await import('@/lib/mocks/streaming.mock');
    return mockGetSeriesDetail(seriesId);
  }
  return data as unknown as SeriesDetail;
}

export async function getEpisode(episodeId: string): Promise<StreamingVideo> {
  if (isMock()) {
    const { mockGetEpisode } = await import('@/lib/mocks/streaming.mock');
    return mockGetEpisode(episodeId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_episodes')
    .select('*')
    .eq('id', episodeId)
    .single();
  if (error || !data) {
    console.error('[getEpisode] Supabase error:', error?.message);
    const { mockGetEpisode } = await import('@/lib/mocks/streaming.mock');
    return mockGetEpisode(episodeId);
  }
  return data as unknown as StreamingVideo;
}

export async function getContinueWatching(studentId: string): Promise<WatchProgress[]> {
  if (isMock()) {
    const { mockGetContinueWatching } = await import('@/lib/mocks/streaming.mock');
    return mockGetContinueWatching(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_watch_progress')
    .select('*')
    .eq('student_id', studentId)
    .lt('progress_pct', 100)
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[getContinueWatching] Supabase error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as WatchProgress[];
}

export async function getRecommended(studentId: string): Promise<StreamingSeries[]> {
  if (isMock()) {
    const { mockGetRecommended } = await import('@/lib/mocks/streaming.mock');
    return mockGetRecommended(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_series')
    .select('*')
    .eq('recommended', true)
    .limit(10);
  if (error) {
    console.error('[getRecommended] Supabase error:', error.message);
    const { mockGetRecommended } = await import('@/lib/mocks/streaming.mock');
    return mockGetRecommended(studentId);
  }
  return (data ?? []) as unknown as StreamingSeries[];
}

export async function trackProgress(studentId: string, episodeId: string, progressSeconds: number): Promise<void> {
  if (isMock()) {
    const { mockTrackProgress } = await import('@/lib/mocks/streaming.mock');
    return mockTrackProgress(studentId, episodeId, progressSeconds);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('streaming_watch_progress')
    .upsert({ student_id: studentId, episode_id: episodeId, progress_seconds: progressSeconds, updated_at: new Date().toISOString() });
  if (error) {
    console.error('[trackProgress] Supabase error:', error.message);
  }
}

export async function completeEpisode(studentId: string, episodeId: string): Promise<EpisodeCompletionResult> {
  if (isMock()) {
    const { mockCompleteEpisode } = await import('@/lib/mocks/streaming.mock');
    return mockCompleteEpisode(studentId, episodeId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('complete_episode', {
    p_student_id: studentId,
    p_episode_id: episodeId,
  });
  if (error || !data) {
    console.error('[completeEpisode] Supabase error:', error?.message);
    const { mockCompleteEpisode } = await import('@/lib/mocks/streaming.mock');
    return mockCompleteEpisode(studentId, episodeId);
  }
  return data as unknown as EpisodeCompletionResult;
}

export async function submitQuiz(studentId: string, episodeId: string, answers: number[]): Promise<QuizResult> {
  if (isMock()) {
    const { mockSubmitQuiz } = await import('@/lib/mocks/streaming.mock');
    return mockSubmitQuiz(studentId, episodeId, answers);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('submit_quiz', {
    p_student_id: studentId,
    p_episode_id: episodeId,
    p_answers: answers,
  });
  if (error || !data) {
    console.error('[submitQuiz] Supabase error:', error?.message);
    const { mockSubmitQuiz } = await import('@/lib/mocks/streaming.mock');
    return mockSubmitQuiz(studentId, episodeId, answers);
  }
  return data as unknown as QuizResult;
}

export async function getTrails(academyId: string, belt?: string): Promise<StreamingTrail[]> {
  if (isMock()) {
    const { mockGetTrails } = await import('@/lib/mocks/streaming.mock');
    return mockGetTrails(academyId, belt);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  let query = supabase
    .from('streaming_trails')
    .select('*')
    .eq('academy_id', academyId);
  if (belt) {
    query = query.eq('belt_level', belt);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[getTrails] Supabase error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as StreamingTrail[];
}

export async function getTrailProgress(studentId: string, trailId: string): Promise<TrailProgress> {
  if (isMock()) {
    const { mockGetTrailProgress } = await import('@/lib/mocks/streaming.mock');
    return mockGetTrailProgress(studentId, trailId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_trail_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('trail_id', trailId)
    .maybeSingle();
  if (error || !data) {
    console.error('[getTrailProgress] Supabase error:', error?.message);
    const { mockGetTrailProgress } = await import('@/lib/mocks/streaming.mock');
    return mockGetTrailProgress(studentId, trailId);
  }
  return data as unknown as TrailProgress;
}

export async function generateCertificate(studentId: string, trailId: string): Promise<StreamingCertificate> {
  if (isMock()) {
    const { mockGenerateCertificate } = await import('@/lib/mocks/streaming.mock');
    return mockGenerateCertificate(studentId, trailId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('streaming_certificates')
    .insert({ student_id: studentId, trail_id: trailId, issued_at: new Date().toISOString() })
    .select()
    .single();
  if (error || !data) {
    console.error('[generateCertificate] Supabase error:', error?.message);
    const { mockGenerateCertificate } = await import('@/lib/mocks/streaming.mock');
    return mockGenerateCertificate(studentId, trailId);
  }
  return data as unknown as StreamingCertificate;
}
