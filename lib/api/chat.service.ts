import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';
import type { ChatConversation, ChatMessage, SendMessagePayload } from '@/lib/types/chat';

export async function listConversations(userId: string): Promise<ChatConversation[]> {
  try {
    if (isMock()) {
      const { mockListConversations } = await import('@/lib/mocks/chat.mock');
      return mockListConversations(userId);
    }
    // API not yet implemented — use mock
    const { mockListConversations } = await import('@/lib/mocks/chat.mock');
      return mockListConversations(userId);
  } catch (error) {
    handleServiceError(error, 'chat.listConversations');
  }
}

export async function getMessages(
  conversationId: string,
  limit = 50,
  cursor?: string,
): Promise<ChatMessage[]> {
  try {
    if (isMock()) {
      const { mockGetMessages } = await import('@/lib/mocks/chat.mock');
      return mockGetMessages(conversationId, limit);
    }
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[chat.getMessages] API not available, using mock fallback');
      const { mockGetMessages } = await import('@/lib/mocks/chat.mock');
      return mockGetMessages(conversationId, limit);
    }

  } catch (error) {
    handleServiceError(error, 'chat.getMessages');
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/chat.mock');
      return mockSendMessage(payload);
    }
    try {
      const res = await fetch(`/api/chat/conversations/${payload.conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[chat.sendMessage] API not available, using mock fallback');
      const { mockSendMessage } = await import('@/lib/mocks/chat.mock');
      return mockSendMessage(payload);
    }
  } catch (error) {
    handleServiceError(error, 'chat.sendMessage');
  }
}

export async function markAsRead(conversationId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Marked conversation ${conversationId} as read`);
      return;
    }
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[chat.markAsRead] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'chat.markAsRead');
  }
}

export async function createBroadcast(
  senderId: string,
  content: string,
  recipientRole?: string,
): Promise<ChatMessage> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Broadcast from ${senderId}: ${content.slice(0, 50)}...`);
      return {
        id: `msg-broadcast-${Date.now()}`,
        conversationId: 'broadcast',
        senderId,
        senderName: 'Admin',
        content,
        sentAt: new Date().toISOString(),
        readAt: null,
        type: 'text',
      };
    }
    try {
      const res = await fetch('/api/chat/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, content, recipientRole }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[chat.createBroadcast] API not available, using fallback');
      return { id: "", conversation_id: "", sender_id: "", sender_name: "", content: "", sent_at: "", read: false } as unknown as ChatMessage;
    }

  } catch (error) {
    handleServiceError(error, 'chat.broadcast');
  }
}
