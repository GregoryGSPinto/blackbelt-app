import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface GroupMessage {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export async function getGroupMessages(classId: string, _page: number): Promise<GroupMessage[]> {
  try {
    if (isMock()) {
      const { mockGetGroupMessages } = await import('@/lib/mocks/group-chat.mock');
      return mockGetGroupMessages(classId);
    }
    const res = await fetch(`/api/classes/${classId}/messages`);
    if (!res.ok) throw new ServiceError(res.status, 'groupChat.get');
    return res.json();
  } catch (error) { handleServiceError(error, 'groupChat.get'); }
}

export async function sendGroupMessage(classId: string, content: string): Promise<GroupMessage> {
  try {
    if (isMock()) {
      const { mockSendGroupMessage } = await import('@/lib/mocks/group-chat.mock');
      return mockSendGroupMessage(classId, content);
    }
    const res = await fetch(`/api/classes/${classId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    if (!res.ok) throw new ServiceError(res.status, 'groupChat.send');
    return res.json();
  } catch (error) { handleServiceError(error, 'groupChat.send'); }
}
