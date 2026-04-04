import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import { Role } from '@/lib/types/domain';
import { logServiceError } from '@/lib/api/errors';
import type {
  Contact,
  Conversation,
  ConversationMessage,
  BroadcastMessage,
  MessageTarget,
  MessageType,
  SendBroadcastOptions,
} from '@/lib/types/messaging';

// Re-export all types for consumers
export type {
  Contact,
  Conversation,
  ConversationMessage,
  BroadcastMessage,
  BroadcastRecipient,
  MessageTarget,
  MessageType,
  MessageMetadata,
  ConversationType,
  UserRole,
  SendBroadcastOptions,
} from '@/lib/types/messaging';

// ────────────────────────────────────────────────────────────
// getMyContacts
// ────────────────────────────────────────────────────────────

export async function getMyContacts(
  profileId: string,
  role: Role,
  academyId: string,
): Promise<Contact[]> {
  try {
    if (isMock()) {
      const { mockGetMyContacts } = await import('@/lib/mocks/mensagens.mock');
      return mockGetMyContacts(profileId, role, academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Role-based contact filtering:
    // admin → all | professor → admin + alunos | aluno → professor + admin
    // responsavel → professor + admin + recepcao | kids → nobody (no messaging)
    const allowedRoles = role === Role.Admin || role === Role.Superadmin
      ? [] // no filter — see all
      : role === Role.Professor
        ? [Role.Admin, Role.AlunoAdulto, Role.AlunoTeen, Role.Responsavel]
        : role === Role.AlunoAdulto || role === Role.AlunoTeen
          ? [Role.Admin, Role.Professor]
          : role === Role.Responsavel
            ? [Role.Admin, Role.Professor, Role.Recepcao]
            : role === Role.Recepcao
              ? [Role.Admin, Role.Professor, Role.AlunoAdulto]
              : [Role.Admin];

    // 1. Get profile IDs from memberships for this academy
    const { data: members, error: memberError } = await supabase
      .from('memberships')
      .select('profile_id, role')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .neq('profile_id', profileId);

    if (memberError) {
      logServiceError(memberError, 'mensagens');
      return [];
    }

    if (!members || members.length === 0) return [];

    // 2. Filter by allowed roles (using membership role)
    const filtered = allowedRoles.length > 0
      ? members.filter((m: Record<string, unknown>) => allowedRoles.includes(String(m.role) as Role))
      : members;

    if (filtered.length === 0) return [];

    const profileIds = filtered.map((m: Record<string, unknown>) => String(m.profile_id));

    // 3. Fetch profiles for those members
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, avatar_url, role')
      .in('id', profileIds);

    if (error) {
      logServiceError(error, 'mensagens');
      return [];
    }

    // Build a role map from memberships (more accurate than profile role)
    const memberRoleMap = new Map<string, string>();
    for (const m of filtered) {
      memberRoleMap.set(String((m as Record<string, unknown>).profile_id), String((m as Record<string, unknown>).role));
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const memberRole = memberRoleMap.get(String(row.id)) ?? String(row.role ?? 'aluno');
      const avatarSrc = row.avatar_url ? String(row.avatar_url) : row.avatar ? String(row.avatar) : null;
      return {
        profile_id: String(row.id ?? ''),
        display_name: String(row.display_name ?? ''),
        avatar_url: avatarSrc,
        role: memberRole as Role,
        role_badge: memberRole,
        classes_in_common: [],
        children_linked: [],
        last_message: null,
        last_message_at: null,
        unread_count: 0,
      };
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// getConversations
// ────────────────────────────────────────────────────────────

export async function getConversations(profileId: string): Promise<Conversation[]> {
  try {
    if (isMock()) {
      const { mockGetConversations } = await import('@/lib/mocks/mensagens.mock');
      return mockGetConversations(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('id, academy_id, participant_a, participant_b, type, last_message_text, last_message_at, last_message_by, unread_count, is_archived, created_at')
      .or(`participant_a.eq.${profileId},participant_b.eq.${profileId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      logServiceError(error, 'mensagens');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      academy_id: String(row.academy_id ?? ''),
      participant_a: String(row.participant_a ?? ''),
      participant_b: String(row.participant_b ?? ''),
      other_participant: {
        profile_id: '',
        display_name: '',
        avatar_url: null,
        role: 'aluno' as Role,
        role_badge: '',
        classes_in_common: [],
        children_linked: [],
        last_message: null,
        last_message_at: null,
        unread_count: 0,
      },
      type: (row.type as Conversation['type']) ?? 'direct',
      last_message_text: row.last_message_text ? String(row.last_message_text) : null,
      last_message_at: row.last_message_at ? String(row.last_message_at) : null,
      last_message_by: row.last_message_by ? String(row.last_message_by) : null,
      unread_count: Number(row.unread_count ?? 0),
      is_archived: Boolean(row.is_archived ?? false),
      created_at: String(row.created_at ?? ''),
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// getOrCreateConversation
// ────────────────────────────────────────────────────────────

export async function getOrCreateConversation(
  profileId: string,
  otherProfileId: string,
  academyId: string,
): Promise<Conversation> {
  const fallback: Conversation = {
    id: '',
    academy_id: academyId,
    participant_a: profileId,
    participant_b: otherProfileId,
    other_participant: {
      profile_id: otherProfileId,
      display_name: '',
      avatar_url: null,
      role: 'aluno' as Role,
      role_badge: '',
      classes_in_common: [],
      children_linked: [],
      last_message: null,
      last_message_at: null,
      unread_count: 0,
    },
    type: 'direct',
    last_message_text: null,
    last_message_at: null,
    last_message_by: null,
    unread_count: 0,
    is_archived: false,
    created_at: new Date().toISOString(),
  };

  try {
    if (isMock()) {
      const { mockGetOrCreateConversation } = await import('@/lib/mocks/mensagens.mock');
      return mockGetOrCreateConversation(profileId, otherProfileId, academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Try to find existing conversation
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('id, academy_id, participant_a, participant_b, type, last_message_text, last_message_at, last_message_by, unread_count, is_archived, created_at')
      .eq('academy_id', academyId)
      .or(
        `and(participant_a.eq.${profileId},participant_b.eq.${otherProfileId}),and(participant_a.eq.${otherProfileId},participant_b.eq.${profileId})`,
      )
      .maybeSingle();

    if (findError) {
      logServiceError(findError, 'mensagens');
      return fallback;
    }

    if (existing) {
      const row = existing as Record<string, unknown>;
      return {
        id: String(row.id ?? ''),
        academy_id: String(row.academy_id ?? ''),
        participant_a: String(row.participant_a ?? ''),
        participant_b: String(row.participant_b ?? ''),
        other_participant: fallback.other_participant,
        type: (row.type as Conversation['type']) ?? 'direct',
        last_message_text: row.last_message_text ? String(row.last_message_text) : null,
        last_message_at: row.last_message_at ? String(row.last_message_at) : null,
        last_message_by: row.last_message_by ? String(row.last_message_by) : null,
        unread_count: Number(row.unread_count ?? 0),
        is_archived: Boolean(row.is_archived ?? false),
        created_at: String(row.created_at ?? ''),
      };
    }

    // Create new conversation
    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert({
        academy_id: academyId,
        participant_a: profileId,
        participant_b: otherProfileId,
        type: 'direct',
      })
      .select()
      .single();

    if (createError || !created) {
      logServiceError(createError, 'mensagens');
      return fallback;
    }

    const row = created as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academy_id: String(row.academy_id ?? ''),
      participant_a: String(row.participant_a ?? ''),
      participant_b: String(row.participant_b ?? ''),
      other_participant: fallback.other_participant,
      type: (row.type as Conversation['type']) ?? 'direct',
      last_message_text: null,
      last_message_at: null,
      last_message_by: null,
      unread_count: 0,
      is_archived: false,
      created_at: String(row.created_at ?? ''),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return fallback;
  }
}

// ────────────────────────────────────────────────────────────
// getMessages
// ────────────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  page?: number,
  limit?: number,
): Promise<ConversationMessage[]> {
  try {
    if (isMock()) {
      const { mockGetMessages } = await import('@/lib/mocks/mensagens.mock');
      return mockGetMessages(conversationId, page, limit);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const pageSize = limit ?? 50;
    const offset = ((page ?? 1) - 1) * pageSize;

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, text, type, attachment_url, read_at, metadata, created_at, deleted_at')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      logServiceError(error, 'mensagens');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      conversation_id: String(row.conversation_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      text: String(row.text ?? ''),
      type: (row.type as MessageType) ?? 'text',
      attachment_url: row.attachment_url ? String(row.attachment_url) : null,
      read_at: row.read_at ? String(row.read_at) : null,
      metadata: (row.metadata as ConversationMessage['metadata']) ?? null,
      created_at: String(row.created_at ?? ''),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// sendMessage
// ────────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  type: MessageType = 'text',
): Promise<ConversationMessage> {
  const fallback: ConversationMessage = {
    id: '',
    conversation_id: conversationId,
    sender_id: senderId,
    text,
    type,
    attachment_url: null,
    read_at: null,
    metadata: null,
    created_at: new Date().toISOString(),
    deleted_at: null,
  };

  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/mensagens.mock');
      return mockSendMessage(conversationId, senderId, text, type);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        type,
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'mensagens');
      return fallback;
    }

    trackFeatureUsage('messages', 'create');

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message_text: text,
        last_message_at: new Date().toISOString(),
        last_message_by: senderId,
      })
      .eq('id', conversationId);

    const row = data as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      conversation_id: String(row.conversation_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      text: String(row.text ?? ''),
      type: (row.type as MessageType) ?? 'text',
      attachment_url: row.attachment_url ? String(row.attachment_url) : null,
      read_at: row.read_at ? String(row.read_at) : null,
      metadata: (row.metadata as ConversationMessage['metadata']) ?? null,
      created_at: String(row.created_at ?? ''),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return fallback;
  }
}

// ────────────────────────────────────────────────────────────
// markAsRead
// ────────────────────────────────────────────────────────────

export async function markAsRead(
  conversationId: string,
  profileId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAsRead } = await import('@/lib/mocks/mensagens.mock');
      return mockMarkAsRead(conversationId, profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', profileId)
      .is('read_at', null);

    if (error) {
      logServiceError(error, 'mensagens');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
  }
}

// ────────────────────────────────────────────────────────────
// deleteMessage
// ────────────────────────────────────────────────────────────

export async function deleteMessage(messageId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteMessage } = await import('@/lib/mocks/mensagens.mock');
      return mockDeleteMessage(messageId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      logServiceError(error, 'mensagens');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
  }
}

// ────────────────────────────────────────────────────────────
// sendBroadcast
// ────────────────────────────────────────────────────────────

export async function sendBroadcast(
  academyId: string,
  senderId: string,
  target: MessageTarget,
  text: string,
  opts?: SendBroadcastOptions,
): Promise<BroadcastMessage> {
  const fallback: BroadcastMessage = {
    id: '',
    academy_id: academyId,
    sender_id: senderId,
    sender_name: '',
    target,
    target_class_id: opts?.target_class_id ?? null,
    target_belt: opts?.target_belt ?? null,
    target_profile_ids: opts?.target_profile_ids ?? null,
    subject: opts?.subject ?? null,
    text,
    total_recipients: 0,
    read_count: 0,
    created_at: new Date().toISOString(),
  };

  try {
    if (isMock()) {
      const { mockSendBroadcast } = await import('@/lib/mocks/mensagens.mock');
      return mockSendBroadcast(academyId, senderId, target, text, opts);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        academy_id: academyId,
        sender_id: senderId,
        target,
        text,
        subject: opts?.subject ?? null,
        target_class_id: opts?.target_class_id ?? null,
        target_belt: opts?.target_belt ?? null,
        target_profile_ids: opts?.target_profile_ids ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'mensagens');
      return fallback;
    }

    const row = data as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      academy_id: String(row.academy_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      sender_name: String(row.sender_name ?? ''),
      target: (row.target as MessageTarget) ?? target,
      target_class_id: row.target_class_id ? String(row.target_class_id) : null,
      target_belt: row.target_belt ? String(row.target_belt) : null,
      target_profile_ids: (row.target_profile_ids as string[] | null) ?? null,
      subject: row.subject ? String(row.subject) : null,
      text: String(row.text ?? ''),
      total_recipients: Number(row.total_recipients ?? 0),
      read_count: Number(row.read_count ?? 0),
      created_at: String(row.created_at ?? ''),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return fallback;
  }
}

// ────────────────────────────────────────────────────────────
// getBroadcasts
// ────────────────────────────────────────────────────────────

export async function getBroadcasts(profileId: string): Promise<BroadcastMessage[]> {
  try {
    if (isMock()) {
      const { mockGetBroadcasts } = await import('@/lib/mocks/mensagens.mock');
      return mockGetBroadcasts(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('broadcasts')
      .select('id, academy_id, sender_id, sender_name, target, target_class_id, target_belt, target_profile_ids, subject, text, total_recipients, read_count, created_at')
      .eq('sender_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError(error, 'mensagens');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      academy_id: String(row.academy_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      sender_name: String(row.sender_name ?? ''),
      target: (row.target as MessageTarget) ?? 'all',
      target_class_id: row.target_class_id ? String(row.target_class_id) : null,
      target_belt: row.target_belt ? String(row.target_belt) : null,
      target_profile_ids: (row.target_profile_ids as string[] | null) ?? null,
      subject: row.subject ? String(row.subject) : null,
      text: String(row.text ?? ''),
      total_recipients: Number(row.total_recipients ?? 0),
      read_count: Number(row.read_count ?? 0),
      created_at: String(row.created_at ?? ''),
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// markBroadcastRead
// ────────────────────────────────────────────────────────────

export async function markBroadcastRead(
  broadcastId: string,
  profileId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkBroadcastRead } = await import('@/lib/mocks/mensagens.mock');
      return mockMarkBroadcastRead(broadcastId, profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Upsert into broadcast_recipients
    const { error } = await supabase
      .from('broadcast_recipients')
      .upsert(
        {
          broadcast_id: broadcastId,
          recipient_id: profileId,
          read_at: new Date().toISOString(),
        },
        { onConflict: 'broadcast_id,recipient_id' },
      );

    if (error) {
      logServiceError(error, 'mensagens');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
  }
}

// ────────────────────────────────────────────────────────────
// getTotalUnread
// ────────────────────────────────────────────────────────────

export async function getTotalUnread(profileId: string): Promise<number> {
  try {
    if (isMock()) {
      const { mockGetTotalUnread } = await import('@/lib/mocks/mensagens.mock');
      return mockGetTotalUnread(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .neq('sender_id', profileId)
      .is('read_at', null);

    if (error) {
      logServiceError(error, 'mensagens');
      return 0;
    }

    return count ?? 0;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return 0;
  }
}

// ────────────────────────────────────────────────────────────
// searchMessages
// ────────────────────────────────────────────────────────────

export async function searchMessages(
  profileId: string,
  query: string,
): Promise<ConversationMessage[]> {
  try {
    if (isMock()) {
      const { mockSearchMessages } = await import('@/lib/mocks/mensagens.mock');
      return mockSearchMessages(profileId, query);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // First get conversation IDs the user participates in
    const { data: convos, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_a.eq.${profileId},participant_b.eq.${profileId}`);

    if (convoError || !convos?.length) {
      if (convoError) logServiceError(convoError, 'mensagens');
      return [];
    }

    const convoIds = convos.map((c: Record<string, unknown>) => String(c.id));

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, text, type, attachment_url, read_at, metadata, created_at, deleted_at')
      .in('conversation_id', convoIds)
      .ilike('text', `%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logServiceError(error, 'mensagens');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      conversation_id: String(row.conversation_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      text: String(row.text ?? ''),
      type: (row.type as MessageType) ?? 'text',
      attachment_url: row.attachment_url ? String(row.attachment_url) : null,
      read_at: row.read_at ? String(row.read_at) : null,
      metadata: (row.metadata as ConversationMessage['metadata']) ?? null,
      created_at: String(row.created_at ?? ''),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    }));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logServiceError(new Error(msg), 'mensagens');
    return [];
  }
}
