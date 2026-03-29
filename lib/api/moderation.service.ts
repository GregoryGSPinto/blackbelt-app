import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked_name: string;
  reason: string | null;
  created_at: string;
}

export interface ContentReport {
  id: string;
  academy_id: string | null;
  reporter_id: string;
  reporter_name: string;
  reported_user_id: string | null;
  reported_user_name: string | null;
  content_type: string;
  content_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

// ────────────────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────────────────

const MOCK_BLOCKED_USERS: BlockedUser[] = [
  {
    id: 'mod-block-1',
    blocker_id: 'mod-user-1',
    blocked_id: 'mod-user-2',
    blocked_name: 'Carlos Pereira',
    reason: 'Mensagens ofensivas',
    created_at: '2026-03-20T10:00:00Z',
  },
];

const MOCK_REPORTS: ContentReport[] = [
  {
    id: 'mod-report-1',
    academy_id: 'academy-1',
    reporter_id: 'mod-user-1',
    reporter_name: 'Ana Silva',
    reported_user_id: 'mod-user-3',
    reported_user_name: 'Pedro Costa',
    content_type: 'message',
    content_id: 'mod-msg-1',
    reason: 'harassment',
    description: 'Mensagens repetidas com conteudo ofensivo',
    status: 'pending',
    created_at: '2026-03-25T14:30:00Z',
    resolved_at: null,
    resolved_by: null,
  },
  {
    id: 'mod-report-2',
    academy_id: 'academy-1',
    reporter_id: 'mod-user-4',
    reporter_name: 'Lucia Mendes',
    reported_user_id: 'mod-user-5',
    reported_user_name: 'Rafael Souza',
    content_type: 'message',
    content_id: 'mod-msg-2',
    reason: 'inappropriate',
    description: null,
    status: 'pending',
    created_at: '2026-03-26T09:15:00Z',
    resolved_at: null,
    resolved_by: null,
  },
  {
    id: 'mod-report-3',
    academy_id: 'academy-1',
    reporter_id: 'mod-user-6',
    reporter_name: 'Bruno Almeida',
    reported_user_id: 'mod-user-7',
    reported_user_name: 'Marcos Lima',
    content_type: 'message',
    content_id: 'mod-msg-3',
    reason: 'spam',
    description: 'Spam de links externos',
    status: 'reviewed',
    created_at: '2026-03-22T11:00:00Z',
    resolved_at: null,
    resolved_by: null,
  },
  {
    id: 'mod-report-4',
    academy_id: 'academy-1',
    reporter_id: 'mod-user-8',
    reporter_name: 'Fernanda Rocha',
    reported_user_id: 'mod-user-9',
    reported_user_name: 'Diego Martins',
    content_type: 'message',
    content_id: 'mod-msg-4',
    reason: 'hate_speech',
    description: 'Discurso de odio no chat',
    status: 'resolved',
    created_at: '2026-03-18T16:45:00Z',
    resolved_at: '2026-03-19T10:00:00Z',
    resolved_by: 'mod-admin-1',
  },
  {
    id: 'mod-report-5',
    academy_id: 'academy-1',
    reporter_id: 'mod-user-10',
    reporter_name: 'Juliana Santos',
    reported_user_id: 'mod-user-11',
    reported_user_name: 'Tiago Ferreira',
    content_type: 'message',
    content_id: 'mod-msg-5',
    reason: 'other',
    description: 'Conteudo irrelevante',
    status: 'dismissed',
    created_at: '2026-03-15T08:30:00Z',
    resolved_at: '2026-03-16T09:00:00Z',
    resolved_by: 'mod-admin-1',
  },
];

// ────────────────────────────────────────────────────────────
// blockUser
// ────────────────────────────────────────────────────────────

export async function blockUser(blockedId: string, reason?: string): Promise<void> {
  try {
    if (isMock()) {
      MOCK_BLOCKED_USERS.push({
        id: `mod-block-${Date.now()}`,
        blocker_id: 'mod-user-1',
        blocked_id: blockedId,
        blocked_name: 'Usuario Bloqueado',
        reason: reason ?? null,
        created_at: new Date().toISOString(),
      });
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: currentUserId,
        blocked_id: blockedId,
        reason: reason ?? null,
      });

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// unblockUser
// ────────────────────────────────────────────────────────────

export async function unblockUser(blockedId: string): Promise<void> {
  try {
    if (isMock()) {
      const idx = MOCK_BLOCKED_USERS.findIndex((b) => b.blocked_id === blockedId);
      if (idx >= 0) MOCK_BLOCKED_USERS.splice(idx, 1);
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', blockedId);

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// getBlockedUsers
// ────────────────────────────────────────────────────────────

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  try {
    if (isMock()) {
      return [...MOCK_BLOCKED_USERS];
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('blocked_users')
      .select('id, blocker_id, blocked_id, reason, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError(error, 'moderation');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      blocker_id: String(row.blocker_id ?? ''),
      blocked_id: String(row.blocked_id ?? ''),
      blocked_name: '',
      reason: row.reason ? String(row.reason) : null,
      created_at: String(row.created_at ?? ''),
    }));
  } catch (error) {
    logServiceError(error, 'moderation');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// isUserBlocked
// ────────────────────────────────────────────────────────────

export async function isUserBlocked(userId: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_BLOCKED_USERS.some((b) => b.blocked_id === userId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocked_id', userId)
      .limit(1);

    if (error) {
      logServiceError(error, 'moderation');
      return false;
    }

    return (data ?? []).length > 0;
  } catch (error) {
    logServiceError(error, 'moderation');
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// getReports (admin)
// ────────────────────────────────────────────────────────────

export async function getReports(filters?: { status?: string }): Promise<ContentReport[]> {
  try {
    if (isMock()) {
      let reports = [...MOCK_REPORTS];
      if (filters?.status) {
        reports = reports.filter((r) => r.status === filters.status);
      }
      return reports;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('content_reports')
      .select('id, academy_id, reporter_id, reported_user_id, content_type, content_id, reason, description, status, created_at, resolved_at, resolved_by')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      logServiceError(error, 'moderation');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      academy_id: row.academy_id ? String(row.academy_id) : null,
      reporter_id: String(row.reporter_id ?? ''),
      reporter_name: '',
      reported_user_id: row.reported_user_id ? String(row.reported_user_id) : null,
      reported_user_name: null,
      content_type: String(row.content_type ?? ''),
      content_id: row.content_id ? String(row.content_id) : null,
      reason: String(row.reason ?? ''),
      description: row.description ? String(row.description) : null,
      status: (row.status as ContentReport['status']) ?? 'pending',
      created_at: String(row.created_at ?? ''),
      resolved_at: row.resolved_at ? String(row.resolved_at) : null,
      resolved_by: row.resolved_by ? String(row.resolved_by) : null,
    }));
  } catch (error) {
    logServiceError(error, 'moderation');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// resolveReport (admin)
// ────────────────────────────────────────────────────────────

export async function resolveReport(reportId: string, _resolution: string): Promise<void> {
  try {
    if (isMock()) {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (report) {
        report.status = 'resolved';
        report.resolved_at = new Date().toISOString();
        report.resolved_by = 'mod-admin-1';
      }
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { error } = await supabase
      .from('content_reports')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: currentUserId,
      })
      .eq('id', reportId);

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// dismissReport (admin)
// ────────────────────────────────────────────────────────────

export async function dismissReport(reportId: string): Promise<void> {
  try {
    if (isMock()) {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (report) {
        report.status = 'dismissed';
        report.resolved_at = new Date().toISOString();
        report.resolved_by = 'mod-admin-1';
      }
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { error } = await supabase
      .from('content_reports')
      .update({
        status: 'dismissed',
        resolved_at: new Date().toISOString(),
        resolved_by: currentUserId,
      })
      .eq('id', reportId);

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// hideMessage (admin)
// ────────────────────────────────────────────────────────────

export async function hideMessage(messageId: string): Promise<void> {
  try {
    if (isMock()) {
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { error } = await supabase
      .from('messages')
      .update({
        hidden_at: new Date().toISOString(),
        hidden_by: currentUserId,
      })
      .eq('id', messageId);

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// setReportStatus (admin — set to "reviewed")
// ────────────────────────────────────────────────────────────

export async function setReportStatus(reportId: string, status: ContentReport['status']): Promise<void> {
  try {
    if (isMock()) {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (report) {
        report.status = status;
      }
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('content_reports')
      .update({ status })
      .eq('id', reportId);

    if (error) {
      logServiceError(error, 'moderation');
      throw error;
    }
  } catch (error) {
    logServiceError(error, 'moderation');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// getProfanityFilter
// ────────────────────────────────────────────────────────────

export function getProfanityFilter(): string[] {
  return [
    'porra', 'caralho', 'merda', 'foda', 'fodase', 'puta', 'putaria',
    'arrombado', 'arrombada', 'cuzao', 'cuzão', 'vagabundo', 'vagabunda',
    'viado', 'veado', 'bicha', 'sapatao', 'sapatão', 'retardado', 'retardada',
    'imbecil', 'idiota', 'babaca', 'otario', 'otário', 'desgraçado', 'fdp',
    'pqp', 'vtnc', 'vsf', 'buceta', 'piranha',
  ];
}
