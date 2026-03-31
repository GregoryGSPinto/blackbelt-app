import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';
import { logServiceError } from '@/lib/api/errors';

export interface BetaFeedback {
  id: string;
  academy_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  feedback_type: 'bug' | 'feature_request' | 'usability' | 'praise' | 'general';
  title: string;
  description: string;
  screenshot_url?: string;
  page_url: string;
  device_info: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    platform: string;
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'reviewing' | 'in_progress' | 'resolved' | 'wont_fix' | 'duplicate';
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackDTO {
  feedback_type: BetaFeedback['feedback_type'];
  title: string;
  description: string;
  screenshot_url?: string;
}

function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    platform: navigator.platform || 'unknown',
  };
}

export async function submitFeedback(data: CreateFeedbackDTO): Promise<{ success: boolean; id?: string }> {
  if (isMock()) {
    return { success: true, id: 'mock-feedback-id' };
  }

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, display_name')
    .eq('user_id', user.id)
    .single();

  const { data: membership } = await supabase
    .from('memberships')
    .select('academy_id')
    .eq('profile_id', profile?.id ?? '')
    .limit(1)
    .maybeSingle();

  const { data: feedback, error } = await supabase
    .from('beta_feedback')
    .insert({
      academy_id: membership?.academy_id,
      user_id: user.id,
      user_name: profile?.display_name || user.email,
      user_role: profile?.role || 'unknown',
      feedback_type: data.feedback_type,
      title: data.title,
      description: data.description,
      screenshot_url: data.screenshot_url,
      page_url: typeof window !== 'undefined' ? window.location.pathname : '',
      device_info: getDeviceInfo(),
    })
    .select('id')
    .single();

  if (error) {
    logServiceError(error, 'beta-feedback');
    return { success: false };
  }

  await supabase.from('support_feedback_items').insert({
    academy_id: membership?.academy_id ?? null,
    reporter_user_id: user.id,
    reporter_profile_id: profile?.id ?? null,
    category:
      data.feedback_type === 'feature_request'
        ? 'suggestion'
        : data.feedback_type === 'bug'
          ? 'bug'
          : data.feedback_type === 'praise'
            ? 'praise'
            : 'feedback',
    severity: data.feedback_type === 'bug' ? 'high' : 'medium',
    status: 'new',
    origin: 'web',
    title: data.title,
    description: data.description,
    route_path: typeof window !== 'undefined' ? window.location.pathname : '',
    source_page: typeof window !== 'undefined' ? window.location.pathname : '',
    device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1280 ? 'tablet' : 'desktop',
    viewport_width: typeof window !== 'undefined' ? window.innerWidth : null,
    viewport_height: typeof window !== 'undefined' ? window.innerHeight : null,
    browser_name: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    os_name: typeof navigator !== 'undefined' ? navigator.platform : null,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
    release_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
    metadata: {
      beta_feedback_id: feedback?.id ?? null,
      screenshot_url: data.screenshot_url ?? null,
      user_name: profile?.display_name || user.email,
      user_role: profile?.role || 'unknown',
      device_info: getDeviceInfo(),
    },
  });

  return { success: true, id: feedback?.id };
}

export async function uploadScreenshot(file: File): Promise<string | null> {
  if (isMock()) return 'https://placehold.co/400x300?text=Screenshot';

  const supabase = createBrowserClient();
  const fileName = `feedback/${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from('beta-screenshots')
    .upload(fileName, file);

  if (error) {
    logServiceError(error, 'beta-feedback');
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('beta-screenshots')
    .getPublicUrl(fileName);

  return publicUrl;
}

// ═══ SUPER ADMIN QUERIES ═══

export async function getAllFeedback(filters?: {
  status?: string;
  type?: string;
  academy_id?: string;
  priority?: string;
}): Promise<BetaFeedback[]> {
  if (isMock()) return [];

  const supabase = createBrowserClient();
  let query = supabase
    .from('beta_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.type) query = query.eq('feedback_type', filters.type);
  if (filters?.academy_id) query = query.eq('academy_id', filters.academy_id);
  if (filters?.priority) query = query.eq('priority', filters.priority);

  const { data, error } = await query;
  if (error) { logServiceError(error, 'beta-feedback'); return []; }
  return (data as BetaFeedback[]) || [];
}

export async function updateFeedbackStatus(
  id: string,
  status: BetaFeedback['status'],
  resolution_notes?: string
): Promise<boolean> {
  if (isMock()) return true;

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
    updateData.resolved_by = user?.id;
  }
  if (resolution_notes) updateData.resolution_notes = resolution_notes;

  const { error } = await supabase
    .from('beta_feedback')
    .update(updateData)
    .eq('id', id);

  return !error;
}

export async function updateFeedbackPriority(id: string, priority: BetaFeedback['priority']): Promise<boolean> {
  if (isMock()) return true;
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('beta_feedback')
    .update({ priority, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function getFeedbackStats(): Promise<{
  total: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  resolved_rate: number;
  avg_resolution_hours: number;
}> {
  if (isMock()) return { total: 0, by_status: {}, by_type: {}, by_priority: {}, resolved_rate: 0, avg_resolution_hours: 0 };

  const supabase = createBrowserClient();
  const { data } = await supabase.from('beta_feedback').select('*');
  const items = (data || []) as BetaFeedback[];

  const by_status: Record<string, number> = {};
  const by_type: Record<string, number> = {};
  const by_priority: Record<string, number> = {};

  items.forEach(item => {
    by_status[item.status] = (by_status[item.status] || 0) + 1;
    by_type[item.feedback_type] = (by_type[item.feedback_type] || 0) + 1;
    by_priority[item.priority] = (by_priority[item.priority] || 0) + 1;
  });

  const resolved = items.filter(i => i.status === 'resolved');
  const resolved_rate = items.length > 0 ? (resolved.length / items.length) * 100 : 0;

  let avg_hours = 0;
  if (resolved.length > 0) {
    const totalHours = resolved.reduce((sum, item) => {
      const created = new Date(item.created_at).getTime();
      const resolvedAt = new Date(item.resolved_at || item.created_at).getTime();
      return sum + (resolvedAt - created) / (1000 * 60 * 60);
    }, 0);
    avg_hours = totalHours / resolved.length;
  }

  return {
    total: items.length,
    by_status,
    by_type,
    by_priority,
    resolved_rate: Math.round(resolved_rate),
    avg_resolution_hours: Math.round(avg_hours),
  };
}
