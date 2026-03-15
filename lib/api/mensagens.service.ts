import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Message } from '@/lib/types';

export interface ConversationDTO {
  id: string;
  participant_name: string;
  participant_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface MessageDTO {
  id: string;
  from_id: string;
  from_name: string;
  content: string;
  sent_at: string;
  is_mine: boolean;
}

export async function getConversations(userId: string): Promise<ConversationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetConversations } = await import('@/lib/mocks/mensagens.mock');
      return mockGetConversations(userId);
    }
    const res = await fetch(`/api/mensagens?userId=${userId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.conversations');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.conversations');
  }
}

export async function getMessages(conversationId: string): Promise<MessageDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMessages } = await import('@/lib/mocks/mensagens.mock');
      return mockGetMessages(conversationId);
    }
    const res = await fetch(`/api/mensagens/${conversationId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.messages');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.messages');
  }
}

export async function sendMessage(toId: string, content: string): Promise<Message> {
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/mensagens.mock');
      return mockSendMessage(toId, content);
    }
    const res = await fetch('/api/mensagens/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toId, content }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.send');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.send');
  }
}

export async function markRead(conversationId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkRead } = await import('@/lib/mocks/mensagens.mock');
      return mockMarkRead(conversationId);
    }
    await fetch(`/api/mensagens/${conversationId}/read`, { method: 'POST' });
  } catch (error) {
    handleServiceError(error, 'mensagens.markRead');
  }
}
