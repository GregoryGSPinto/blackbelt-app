import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';

type UnsubscribeFn = () => void;

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

export interface RealtimeMessage {
  id: string;
  from_id: string;
  content: string;
  created_at: string;
}

export interface RealtimeAttendance {
  id: string;
  student_id: string;
  method: string;
  checked_at: string;
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: RealtimeNotification) => void
): UnsubscribeFn {
  if (isMock()) return () => {};

  const supabase = createBrowserClient();
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload: { new: RealtimeNotification }) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMessages(
  conversationProfileId: string,
  currentProfileId: string,
  callback: (message: RealtimeMessage) => void
): UnsubscribeFn {
  if (isMock()) return () => {};

  const supabase = createBrowserClient();
  const channel = supabase
    .channel(`messages:${conversationProfileId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_id=eq.${currentProfileId}`,
      },
      (payload: { new: RealtimeMessage }) => {
        if (payload.new.from_id === conversationProfileId) {
          callback(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAttendance(
  classId: string,
  callback: (attendance: RealtimeAttendance) => void
): UnsubscribeFn {
  if (isMock()) return () => {};

  const supabase = createBrowserClient();
  const channel = supabase
    .channel(`attendance:${classId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'attendance',
        filter: `class_id=eq.${classId}`,
      },
      (payload: { new: RealtimeAttendance }) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
