import { getPendingCheckins, markCheckinSynced, getPendingFeedback, clearSynced } from './db';
import { createBrowserClient } from '@/lib/supabase/client';

export async function syncOfflineData(): Promise<{ checkins: number; feedback: number; errors: number }> {
  let checkins = 0, feedback = 0, errors = 0;
  try {
    const supabase = createBrowserClient();

    const pendingCheckins = await getPendingCheckins();
    for (const item of pendingCheckins) {
      try {
        const { error } = await supabase.from('attendance').insert({
          academy_id: item.academyId,
          student_id: item.studentId,
          class_id: item.classId,
          check_in_method: item.method,
          checked_in_at: item.timestamp,
          source: 'offline_sync',
        });
        if (!error) { await markCheckinSynced(item.id); checkins++; }
        else { errors++; }
      } catch { errors++; }
    }

    const pendingFb = await getPendingFeedback();
    for (const item of pendingFb) {
      try {
        const { error } = await supabase.from('user_feedback').insert({
          academy_id: item.academyId,
          profile_id: item.profileId,
          type: item.type,
          message: item.message,
          rating: item.rating,
        });
        if (!error) { feedback++; }
        else { errors++; }
      } catch { errors++; }
    }

    await clearSynced();
  } catch { errors++; }
  return { checkins, feedback, errors };
}

export function setupAutoSync() {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', async () => {
    console.log('[Offline Sync] Back online — syncing...');
    const result = await syncOfflineData();
    console.log('[Offline Sync]', result);
  });
}
