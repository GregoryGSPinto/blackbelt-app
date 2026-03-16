import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
// types defined locally

export interface ConversationDTO {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string | null;
  participant_belt: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_at_risk: boolean;
}

export interface MessageDTO {
  id: string;
  from_id: string;
  from_name: string;
  from_avatar: string | null;
  content: string;
  sent_at: string;
  is_mine: boolean;
  read_at: string | null;
}

export interface StudentContextDTO {
  student_id: string;
  display_name: string;
  belt: string;
  avatar: string | null;
  last_attendance: string | null;
  streak: number;
  health_score: number;
  latest_evaluation: {
    technique: number;
    discipline: number;
    attendance: number;
    evolution: number;
    date: string;
  } | null;
  current_plan: string | null;
  plan_status: 'active' | 'past_due' | 'cancelled' | null;
  is_at_risk: boolean;
}

export interface SuggestedMessageDTO {
  id: string;
  label: string;
  content: string;
}

export async function getConversations(profileId: string): Promise<ConversationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetConversations } = await import('@/lib/mocks/mensagens.mock');
      return mockGetConversations(profileId);
    }
    const res = await fetch(`/api/mensagens?profileId=${profileId}`);
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

export async function sendMessage(conversationId: string, content: string): Promise<MessageDTO> {
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/mensagens.mock');
      return mockSendMessage(conversationId, content);
    }
    const res = await fetch(`/api/mensagens/${conversationId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.send');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.send');
  }
}

export async function getStudentContext(studentId: string): Promise<StudentContextDTO> {
  try {
    if (isMock()) {
      const { mockGetStudentContext } = await import('@/lib/mocks/mensagens.mock');
      return mockGetStudentContext(studentId);
    }
    const res = await fetch(`/api/mensagens/context/${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.studentContext');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.studentContext');
  }
}

export async function getSuggestedMessages(studentId: string): Promise<SuggestedMessageDTO[]> {
  try {
    if (isMock()) {
      const { mockGetSuggestedMessages } = await import('@/lib/mocks/mensagens.mock');
      return mockGetSuggestedMessages(studentId);
    }
    const res = await fetch(`/api/mensagens/suggestions/${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'mensagens.suggestions');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mensagens.suggestions');
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
