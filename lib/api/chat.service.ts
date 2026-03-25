import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import type { ChatConversation, ChatMessage, SendMessagePayload } from '@/lib/types/chat';

export async function listConversations(userId: string): Promise<ChatConversation[]> {
  try {
    if (isMock()) {
      const { mockListConversations } = await import('@/lib/mocks/chat.mock');
      return mockListConversations(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[listConversations] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as ChatConversation[];
  } catch (error) {
    console.error('[listConversations] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('sent_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getMessages] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as ChatMessage[];
  } catch (error) {
    console.error('[getMessages] Fallback:', error);
    return [];
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/chat.mock');
      return mockSendMessage(payload);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? '';

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: payload.conversationId,
        sender_id: currentUserId,
        content: payload.content,
        type: payload.type ?? 'text',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[sendMessage] error:', error?.message);
      return { id: '', conversationId: payload.conversationId, senderId: currentUserId, senderName: '', content: payload.content, sentAt: new Date().toISOString(), readAt: null, type: 'text' } as unknown as ChatMessage;
    }
    return data as unknown as ChatMessage;
  } catch (error) {
    console.error('[sendMessage] Fallback:', error);
    return { id: '', conversationId: '', senderId: '', senderName: '', content: '', sentAt: '', readAt: null, type: 'text' } as unknown as ChatMessage;
  }
}

export async function markAsRead(conversationId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Marked conversation ${conversationId} as read`);
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .is('read_at', null);

    if (error) {
      console.error('[markAsRead] error:', error.message);
    }
  } catch (error) {
    console.error('[markAsRead] Fallback:', error);
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: 'broadcast',
        sender_id: senderId,
        content,
        type: 'broadcast',
        metadata: recipientRole ? { recipientRole } : {},
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[createBroadcast] error:', error?.message);
      return { id: '', conversationId: 'broadcast', senderId, senderName: '', content, sentAt: new Date().toISOString(), readAt: null, type: 'text' } as unknown as ChatMessage;
    }
    return data as unknown as ChatMessage;
  } catch (error) {
    console.error('[createBroadcast] Fallback:', error);
    return { id: '', conversationId: 'broadcast', senderId: '', senderName: '', content: '', sentAt: '', readAt: null, type: 'text' } as unknown as ChatMessage;
  }
}
