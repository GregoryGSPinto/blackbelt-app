import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import { Role } from '@/lib/types/domain';
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
    const res = await fetch(
      `/api/mensagens/contacts?profile_id=${profileId}&role=${role}&academy_id=${academyId}`,
    );
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.contacts');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.contacts');
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
    const res = await fetch(`/api/mensagens/conversations?profile_id=${profileId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.conversations');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.conversations');
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
  try {
    if (isMock()) {
      const { mockGetOrCreateConversation } = await import('@/lib/mocks/mensagens.mock');
      return mockGetOrCreateConversation(profileId, otherProfileId, academyId);
    }
    const res = await fetch('/api/mensagens/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        other_profile_id: otherProfileId,
        academy_id: academyId,
      }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.getOrCreate');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.getOrCreate');
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
    const params = new URLSearchParams({ conversation_id: conversationId });
    if (page !== undefined) params.set('page', String(page));
    if (limit !== undefined) params.set('limit', String(limit));
    const res = await fetch(`/api/mensagens/messages?${params.toString()}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.messages');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.messages');
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
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/mensagens.mock');
      return mockSendMessage(conversationId, senderId, text, type);
    }
    const res = await fetch('/api/mensagens/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        type,
      }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.send');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.send');
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
    const res = await fetch(`/api/mensagens/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.markRead');
  } catch (error) {
    handleServiceError(error, 'mensagens.markRead');
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
    const res = await fetch(`/api/mensagens/messages/${messageId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.delete');
  } catch (error) {
    handleServiceError(error, 'mensagens.delete');
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
  try {
    if (isMock()) {
      const { mockSendBroadcast } = await import('@/lib/mocks/mensagens.mock');
      return mockSendBroadcast(academyId, senderId, target, text, opts);
    }
    const res = await fetch('/api/mensagens/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        academy_id: academyId,
        sender_id: senderId,
        target,
        text,
        ...opts,
      }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.broadcast');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.broadcast');
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
    const res = await fetch(`/api/mensagens/broadcasts?profile_id=${profileId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.broadcasts');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.broadcasts');
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
    const res = await fetch(`/api/mensagens/broadcasts/${broadcastId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.broadcastRead');
  } catch (error) {
    handleServiceError(error, 'mensagens.broadcastRead');
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
    const res = await fetch(`/api/mensagens/unread?profile_id=${profileId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.unread');
    const data: { count: number } = await res.json();
    return data.count;
  } catch (error) {
    handleServiceError(error, 'mensagens.unread');
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
    const params = new URLSearchParams({ profile_id: profileId, q: query });
    const res = await fetch(`/api/mensagens/search?${params.toString()}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.search');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.search');
  }
}
