import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ────────────────────────────────────────────────────────────

export type FeedbackType = 'suggestion' | 'bug' | 'praise' | 'complaint' | 'other';
export type FeedbackStatus = 'new' | 'read' | 'replied' | 'resolved';

export interface UserFeedback {
  id: string;
  academy_id: string;
  profile_id: string;
  type: FeedbackType;
  message: string;
  rating: number | null;
  page_url: string | null;
  user_agent: string | null;
  status: FeedbackStatus;
  admin_reply: string | null;
  created_at: string;
}

// ── Submit Feedback ──────────────────────────────────────────────────

export async function submitFeedback(
  academyId: string,
  data: { type: FeedbackType; message: string; rating?: number; page_url?: string },
): Promise<UserFeedback | null> {
  try {
    if (isMock()) {
      const { mockSubmitFeedback } = await import('@/lib/mocks/feedback.mock');
      return mockSubmitFeedback(academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('user_feedback')
      .insert({
        academy_id: academyId,
        type: data.type,
        message: data.message,
        rating: data.rating ?? null,
        page_url: data.page_url ?? null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
      .select('*')
      .single();

    if (error) {
      logServiceError(error, 'feedback');
      return null;
    }

    return row as UserFeedback;
  } catch (err) {
    logServiceError(err, 'feedback');
    return null;
  }
}

// ── List Feedback ────────────────────────────────────────────────────

export async function listFeedback(
  academyId: string,
  filters?: { status?: FeedbackStatus; type?: FeedbackType },
): Promise<UserFeedback[]> {
  try {
    if (isMock()) {
      const { mockListFeedback } = await import('@/lib/mocks/feedback.mock');
      return mockListFeedback(academyId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('user_feedback')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) {
      logServiceError(error, 'feedback');
      return [];
    }

    return (data ?? []) as UserFeedback[];
  } catch (err) {
    logServiceError(err, 'feedback');
    return [];
  }
}

// ── Get Feedback Count ───────────────────────────────────────────────

export async function getFeedbackCount(
  academyId: string,
  status?: FeedbackStatus,
): Promise<number> {
  try {
    if (isMock()) {
      const { mockGetFeedbackCount } = await import('@/lib/mocks/feedback.mock');
      return mockGetFeedbackCount(academyId, status);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('user_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId);

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;

    if (error) {
      logServiceError(error, 'feedback');
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    logServiceError(err, 'feedback');
    return 0;
  }
}

// ── Mark as Read ─────────────────────────────────────────────────────

export async function markAsRead(feedbackId: string): Promise<UserFeedback | null> {
  try {
    if (isMock()) {
      const { mockMarkAsRead } = await import('@/lib/mocks/feedback.mock');
      return mockMarkAsRead(feedbackId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .update({ status: 'read' })
      .eq('id', feedbackId)
      .select('*')
      .single();

    if (error) {
      logServiceError(error, 'feedback');
      return null;
    }

    return data as UserFeedback;
  } catch (err) {
    logServiceError(err, 'feedback');
    return null;
  }
}

// ── Reply to Feedback ────────────────────────────────────────────────

export async function replyToFeedback(
  feedbackId: string,
  reply: string,
): Promise<UserFeedback | null> {
  try {
    if (isMock()) {
      const { mockReplyToFeedback } = await import('@/lib/mocks/feedback.mock');
      return mockReplyToFeedback(feedbackId, reply);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .update({ status: 'replied', admin_reply: reply })
      .eq('id', feedbackId)
      .select('*')
      .single();

    if (error) {
      logServiceError(error, 'feedback');
      return null;
    }

    return data as UserFeedback;
  } catch (err) {
    logServiceError(err, 'feedback');
    return null;
  }
}

// ── Resolve Feedback ─────────────────────────────────────────────────

export async function resolveFeedback(feedbackId: string): Promise<UserFeedback | null> {
  try {
    if (isMock()) {
      const { mockResolveFeedback } = await import('@/lib/mocks/feedback.mock');
      return mockResolveFeedback(feedbackId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .update({ status: 'resolved' })
      .eq('id', feedbackId)
      .select('*')
      .single();

    if (error) {
      logServiceError(error, 'feedback');
      return null;
    }

    return data as UserFeedback;
  } catch (err) {
    logServiceError(err, 'feedback');
    return null;
  }
}
