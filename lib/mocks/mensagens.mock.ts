import { MessageChannel } from '@/lib/types';
import type { Message } from '@/lib/types';
import type { ConversationDTO, MessageDTO } from '@/lib/api/mensagens.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const CONVERSATIONS: ConversationDTO[] = [
  { id: 'conv-1', participant_name: 'João Mendes', participant_avatar: null, last_message: 'Professor, preciso de ajuda com a técnica de guarda', last_message_time: '14:30', unread_count: 2 },
  { id: 'conv-2', participant_name: 'Maria Oliveira', participant_avatar: null, last_message: 'Obrigada pela dica de ontem!', last_message_time: '10:15', unread_count: 0 },
  { id: 'conv-3', participant_name: 'Rafael Souza', participant_avatar: null, last_message: 'Posso fazer reposição na turma de manhã?', last_message_time: 'Ontem', unread_count: 1 },
  { id: 'conv-4', participant_name: 'Lucas Ferreira', participant_avatar: null, last_message: 'Quando será a próxima avaliação?', last_message_time: 'Ontem', unread_count: 0 },
  { id: 'conv-5', participant_name: 'Ana Costa', participant_avatar: null, last_message: 'Vou faltar amanhã, tudo bem?', last_message_time: '2 dias', unread_count: 0 },
];

const MESSAGES_BY_CONV: Record<string, MessageDTO[]> = {
  'conv-1': [
    { id: 'm-1', from_id: 'stu-1', from_name: 'João Mendes', content: 'Professor, tudo bem?', sent_at: '2026-03-14T14:00:00Z', is_mine: false },
    { id: 'm-2', from_id: 'prof-1', from_name: 'Carlos Silva', content: 'Tudo sim, João! Em que posso ajudar?', sent_at: '2026-03-14T14:05:00Z', is_mine: true },
    { id: 'm-3', from_id: 'stu-1', from_name: 'João Mendes', content: 'Estou com dificuldade na passagem de guarda. Tem alguma dica?', sent_at: '2026-03-14T14:10:00Z', is_mine: false },
    { id: 'm-4', from_id: 'prof-1', from_name: 'Carlos Silva', content: 'Claro! Foca na pressão do quadril e no controle das mangas. Amanhã vamos treinar isso.', sent_at: '2026-03-14T14:15:00Z', is_mine: true },
    { id: 'm-5', from_id: 'stu-1', from_name: 'João Mendes', content: 'Perfeito, obrigado! Vou assistir o vídeo que você compartilhou também.', sent_at: '2026-03-14T14:20:00Z', is_mine: false },
    { id: 'm-6', from_id: 'stu-1', from_name: 'João Mendes', content: 'Professor, preciso de ajuda com a técnica de guarda', sent_at: '2026-03-14T14:30:00Z', is_mine: false },
  ],
  'conv-2': [
    { id: 'm-10', from_id: 'stu-2', from_name: 'Maria Oliveira', content: 'Professor, aquela dica da raspagem foi ótima!', sent_at: '2026-03-14T10:00:00Z', is_mine: false },
    { id: 'm-11', from_id: 'prof-1', from_name: 'Carlos Silva', content: 'Que bom! Continue praticando, você está evoluindo muito.', sent_at: '2026-03-14T10:10:00Z', is_mine: true },
    { id: 'm-12', from_id: 'stu-2', from_name: 'Maria Oliveira', content: 'Obrigada pela dica de ontem!', sent_at: '2026-03-14T10:15:00Z', is_mine: false },
  ],
};

export async function mockGetConversations(_userId: string): Promise<ConversationDTO[]> {
  await delay();
  return CONVERSATIONS;
}

export async function mockGetMessages(conversationId: string): Promise<MessageDTO[]> {
  await delay();
  return MESSAGES_BY_CONV[conversationId] ?? [];
}

export async function mockSendMessage(toId: string, content: string): Promise<Message> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `msg-${Date.now()}`,
    from_id: 'prof-1',
    to_id: toId,
    channel: MessageChannel.Direct,
    content,
    read_at: null,
    created_at: now,
    updated_at: now,
  };
}

export async function mockMarkRead(_conversationId: string): Promise<void> {
  await delay();
}
