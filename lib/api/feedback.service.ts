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
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    const { data: profile } = user
      ? await supabase
          .from('profiles')
          .select('id, role, display_name')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()
      : { data: null };

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

    const categoryMap: Record<FeedbackType, 'feedback' | 'complaint' | 'suggestion' | 'bug' | 'praise'> = {
      suggestion: 'suggestion',
      bug: 'bug',
      praise: 'praise',
      complaint: 'complaint',
      other: 'feedback',
    };

    await supabase.from('support_feedback_items').insert({
      academy_id: academyId,
      reporter_user_id: user?.id ?? null,
      reporter_profile_id: profile?.id ?? null,
      category: categoryMap[data.type],
      severity: data.type === 'complaint' || data.type === 'bug' ? 'high' : 'medium',
      status: 'new',
      origin: 'web',
      title: data.message.slice(0, 80),
      description: data.message,
      route_path: data.page_url ?? null,
      source_page: data.page_url ?? null,
      device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : null,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : null,
      browser_name: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      os_name: typeof navigator !== 'undefined' ? navigator.platform : null,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
      release_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
      metadata: {
        rating: data.rating ?? null,
        legacy_feedback_id: row.id,
        legacy_type: data.type,
        reporter_name: profile?.display_name ?? null,
        reporter_role: profile?.role ?? null,
      },
    });

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
