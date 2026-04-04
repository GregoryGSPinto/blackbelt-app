import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('group_messages')
      .select('*, profiles(display_name)')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logServiceError(error, 'group-chat');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.profiles as Record<string, unknown> | null;
      return {
        id: row.id as string,
        classId: row.class_id as string,
        authorId: row.author_id as string,
        authorName: (profile?.display_name as string) ?? '',
        content: row.content as string,
        createdAt: row.created_at as string,
      };
    });
  } catch (error) {
    logServiceError(error, 'group-chat');
    return [];
  }
}

export async function sendGroupMessage(classId: string, content: string): Promise<GroupMessage> {
  try {
    if (isMock()) {
      const { mockSendGroupMessage } = await import('@/lib/mocks/group-chat.mock');
      return mockSendGroupMessage(classId, content);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? '';

    const { data, error } = await supabase
      .from('group_messages')
      .insert({ class_id: classId, author_id: userId, content })
      .select('*, profiles(display_name)')
      .single();

    if (error || !data) {
      logServiceError(error, 'group-chat');
      return { id: '', classId, authorId: userId, authorName: '', content, createdAt: new Date().toISOString() };
    }

    const row = data as Record<string, unknown>;
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      classId: row.class_id as string,
      authorId: row.author_id as string,
      authorName: (profile?.display_name as string) ?? '',
      content: row.content as string,
      createdAt: row.created_at as string,
    };
  } catch (error) {
    logServiceError(error, 'group-chat');
    return { id: '', classId, authorId: '', authorName: '', content, createdAt: new Date().toISOString() };
  }
}
