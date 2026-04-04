// ── Chat types (P-069) ────────────────────────────────────────

export interface ChatConversation {
  id: string;
  participants: ChatParticipant[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  isBroadcast: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt: string | null;
  type: 'text' | 'image' | 'file';
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}
