import { getPendingCheckins, markCheckinSynced, getPendingFeedback, clearSynced } from './db';
import { createBrowserClient } from '@/lib/supabase/client';

let autoSyncSetup = false;

export async function syncOfflineData(): Promise<{ checkins: number; feedback: number; errors: number; conflicts: number }> {
  let checkins = 0, feedback = 0, errors = 0, conflicts = 0;
  try {
    const supabase = createBrowserClient();

    // Sync pending check-ins
    const pendingCheckins = await getPendingCheckins();
    for (const item of pendingCheckins) {
      try {
        // Conflict check: see if a check-in already exists for same student+class+time window
        const { data: existing } = await supabase
          .from('attendance')
          .select('id, checked_in_at')
          .eq('academy_id', item.academyId)
          .eq('student_id', item.studentId)
          .eq('class_id', item.classId)
          .gte('checked_in_at', new Date(new Date(item.timestamp).getTime() - 60 * 60 * 1000).toISOString())
          .lte('checked_in_at', new Date(new Date(item.timestamp).getTime() + 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          // Conflict: check-in already exists for this window — skip duplicate
          await markCheckinSynced(item.id);
          conflicts++;
          continue;
        }

        const { error } = await supabase.from('attendance').insert({
          academy_id: item.academyId,
          student_id: item.studentId,
          class_id: item.classId,
          check_in_method: item.method,
          checked_in_at: item.timestamp,
          source: 'offline_sync',
        });
        if (!error) {
          await markCheckinSynced(item.id);
          checkins++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    // Sync pending feedback
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
        if (!error) {
          feedback++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    await clearSynced();
  } catch {
    errors++;
  }
  return { checkins, feedback, errors, conflicts };
}

export function setupAutoSync() {
  if (typeof window === 'undefined') return;
  if (autoSyncSetup) return;
  autoSyncSetup = true;

  window.addEventListener('online', async () => {
    console.log('[Offline Sync] De volta online — sincronizando...');
    const result = await syncOfflineData();
    console.log('[Offline Sync] Resultado:', result);
  });
}
