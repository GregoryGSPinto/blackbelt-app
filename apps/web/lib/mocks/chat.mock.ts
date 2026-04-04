import type { ChatConversation, ChatMessage, SendMessagePayload } from '@/lib/types/chat';

const CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    participants: [
      { userId: 'admin-1', name: 'Roberto Silva', role: 'admin', online: true },
      { userId: 'prof-1', name: 'Fernanda Costa', role: 'professor', online: false },
    ],
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'prof-1',
      senderName: 'Fernanda Costa',
      content: 'A turma de terça vai precisar de reposição',
      sentAt: '2026-03-17T14:30:00Z',
      readAt: null,
      type: 'text',
    },
    unreadCount: 2,
    isBroadcast: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-17T14:30:00Z',
  },
  {
    id: 'conv-2',
    participants: [
      { userId: 'admin-1', name: 'Roberto Silva', role: 'admin', online: true },
      { userId: 'student-1', name: 'Lucas Ferreira', role: 'student', online: true },
    ],
    lastMessage: {
      id: 'msg-10',
      conversationId: 'conv-2',
      senderId: 'student-1',
      senderName: 'Lucas Ferreira',
      content: 'Obrigado professor! Vou praticar os drills',
      sentAt: '2026-03-17T10:15:00Z',
      readAt: '2026-03-17T10:20:00Z',
      type: 'text',
    },
    unreadCount: 0,
    isBroadcast: false,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-17T10:15:00Z',
  },
  {
    id: 'conv-3',
    participants: [
      { userId: 'parent-1', name: 'Maria Santos', role: 'parent', online: false },
      { userId: 'prof-2', name: 'Thiago Mendes', role: 'professor', online: true },
    ],
    lastMessage: {
      id: 'msg-15',
      conversationId: 'conv-3',
      senderId: 'parent-1',
      senderName: 'Maria Santos',
      content: 'Pedro não vai poder ir na quinta, consulta médica',
      sentAt: '2026-03-16T18:00:00Z',
      readAt: '2026-03-16T19:30:00Z',
      type: 'text',
    },
    unreadCount: 0,
    isBroadcast: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-16T18:00:00Z',
  },
];

const MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    { id: 'msg-1', conversationId: 'conv-1', senderId: 'admin-1', senderName: 'Roberto Silva', content: 'Oi Fernanda, como estão as turmas?', sentAt: '2026-03-17T09:00:00Z', readAt: '2026-03-17T09:05:00Z', type: 'text' },
    { id: 'msg-2', conversationId: 'conv-1', senderId: 'prof-1', senderName: 'Fernanda Costa', content: 'Boa dia! Turmas estão cheias, ótima semana', sentAt: '2026-03-17T09:10:00Z', readAt: '2026-03-17T09:12:00Z', type: 'text' },
    { id: 'msg-3', conversationId: 'conv-1', senderId: 'admin-1', senderName: 'Roberto Silva', content: 'Ótimo! Precisamos discutir a grade de abril', sentAt: '2026-03-17T10:00:00Z', readAt: '2026-03-17T10:30:00Z', type: 'text' },
    { id: 'msg-4', conversationId: 'conv-1', senderId: 'prof-1', senderName: 'Fernanda Costa', content: 'Pode ser! Vamos marcar', sentAt: '2026-03-17T12:00:00Z', readAt: '2026-03-17T13:00:00Z', type: 'text' },
    { id: 'msg-5', conversationId: 'conv-1', senderId: 'prof-1', senderName: 'Fernanda Costa', content: 'A turma de terça vai precisar de reposição', sentAt: '2026-03-17T14:30:00Z', readAt: null, type: 'text' },
  ],
  'conv-2': [
    { id: 'msg-6', conversationId: 'conv-2', senderId: 'admin-1', senderName: 'Roberto Silva', content: 'Lucas, parabéns pela evolução!', sentAt: '2026-03-17T09:30:00Z', readAt: '2026-03-17T09:35:00Z', type: 'text' },
    { id: 'msg-7', conversationId: 'conv-2', senderId: 'student-1', senderName: 'Lucas Ferreira', content: 'Muito obrigado professor!', sentAt: '2026-03-17T09:40:00Z', readAt: '2026-03-17T09:45:00Z', type: 'text' },
    { id: 'msg-10', conversationId: 'conv-2', senderId: 'student-1', senderName: 'Lucas Ferreira', content: 'Obrigado professor! Vou praticar os drills', sentAt: '2026-03-17T10:15:00Z', readAt: '2026-03-17T10:20:00Z', type: 'text' },
  ],
};

export function mockListConversations(_userId: string): ChatConversation[] {
  return CONVERSATIONS;
}

export function mockGetMessages(conversationId: string, limit: number): ChatMessage[] {
  const msgs = MESSAGES[conversationId] || [];
  return msgs.slice(-limit);
}

export function mockSendMessage(payload: SendMessagePayload): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    conversationId: payload.conversationId,
    senderId: 'current-user',
    senderName: 'Você',
    content: payload.content,
    sentAt: new Date().toISOString(),
    readAt: null,
    type: payload.type || 'text',
  };
}
