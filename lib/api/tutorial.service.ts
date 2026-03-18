import { isMock } from '@/lib/env';

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  current_step: number;
  started_at: string | null;
  completed_at: string | null;
  skipped_at: string | null;
  created_at: string;
}

const LS_KEY = 'bb_tutorial_progress';

// ── localStorage helpers (always used as cache/fallback) ──────────────

function getLocalProgress(): TutorialProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProgress(items: TutorialProgress[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Upsert a single tutorial entry into the localStorage cache.
 * This is called alongside every Supabase write so that even if
 * future Supabase reads fail, localStorage has the latest state.
 */
function upsertLocalEntry(userId: string, tutorialId: string, patch: Partial<TutorialProgress>) {
  const items = getLocalProgress();
  const idx = items.findIndex((p) => p.user_id === userId && p.tutorial_id === tutorialId);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...patch };
  } else {
    items.push({
      id: crypto.randomUUID(),
      user_id: userId,
      tutorial_id: tutorialId,
      status: 'pending',
      current_step: 0,
      started_at: null,
      completed_at: null,
      skipped_at: null,
      created_at: new Date().toISOString(),
      ...patch,
    });
  }
  saveLocalProgress(items);
}

/**
 * Merge Supabase data with localStorage data. For each tutorial_id,
 * prefer the entry with the "most terminal" status so that completed/skipped
 * state is never lost even if one source is stale.
 */
function mergeProgress(supabaseData: TutorialProgress[], localData: TutorialProgress[], userId: string): TutorialProgress[] {
  const STATUS_WEIGHT: Record<string, number> = {
    pending: 0,
    in_progress: 1,
    skipped: 2,
    completed: 3,
  };

  const map = new Map<string, TutorialProgress>();

  for (const entry of localData.filter((p) => p.user_id === userId)) {
    map.set(entry.tutorial_id, entry);
  }

  for (const entry of supabaseData) {
    const existing = map.get(entry.tutorial_id);
    if (!existing) {
      map.set(entry.tutorial_id, entry);
    } else {
      // Keep the one with higher status weight (more terminal state wins)
      const existingWeight = STATUS_WEIGHT[existing.status] ?? 0;
      const newWeight = STATUS_WEIGHT[entry.status] ?? 0;
      if (newWeight >= existingWeight) {
        map.set(entry.tutorial_id, entry);
      }
    }
  }

  return Array.from(map.values());
}

// ── Service functions ─────────────────────────────────────────────────

export async function getTutorialProgress(userId: string): Promise<TutorialProgress[]> {
  const localData = getLocalProgress().filter((p) => p.user_id === userId);

  if (isMock()) {
    return localData;
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const supabaseData = (data ?? []) as TutorialProgress[];

    // Merge both sources so completed/skipped state is never lost
    const merged = mergeProgress(supabaseData, localData, userId);

    // Sync merged result back to localStorage cache
    const allLocal = getLocalProgress().filter((p) => p.user_id !== userId);
    saveLocalProgress([...allLocal, ...merged]);

    return merged;
  } catch {
    console.warn('[tutorial.getTutorialProgress] Supabase unavailable, using localStorage');
    return localData;
  }
}

export async function startTutorial(userId: string, tutorialId: string): Promise<void> {
  const patch: Partial<TutorialProgress> = {
    status: 'in_progress',
    current_step: 0,
    started_at: new Date().toISOString(),
    completed_at: null,
    skipped_at: null,
  };

  // Always write to localStorage (cache)
  upsertLocalEntry(userId, tutorialId, patch);

  if (isMock()) return;

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase
      .from('tutorial_progress')
      .upsert({
        user_id: userId,
        tutorial_id: tutorialId,
        ...patch,
      }, { onConflict: 'user_id,tutorial_id' });
  } catch {
    console.warn('[tutorial.startTutorial] Supabase unavailable, localStorage used as fallback');
  }
}

export async function updateTutorialStep(userId: string, tutorialId: string, step: number): Promise<void> {
  // Always write to localStorage (cache)
  upsertLocalEntry(userId, tutorialId, { current_step: step });

  if (isMock()) return;

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase
      .from('tutorial_progress')
      .update({ current_step: step })
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId);
  } catch {
    console.warn('[tutorial.updateStep] Supabase unavailable, localStorage used as fallback');
  }
}

export async function completeTutorial(userId: string, tutorialId: string): Promise<void> {
  const patch: Partial<TutorialProgress> = {
    status: 'completed',
    completed_at: new Date().toISOString(),
  };

  // Always write to localStorage (cache)
  upsertLocalEntry(userId, tutorialId, patch);

  if (isMock()) return;

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase
      .from('tutorial_progress')
      .update(patch)
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId);
  } catch {
    console.warn('[tutorial.completeTutorial] Supabase unavailable, localStorage used as fallback');
  }
}

export async function skipTutorial(userId: string, tutorialId: string): Promise<void> {
  const patch: Partial<TutorialProgress> = {
    status: 'skipped',
    skipped_at: new Date().toISOString(),
  };

  // Always write to localStorage (cache)
  upsertLocalEntry(userId, tutorialId, patch);

  if (isMock()) return;

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase
      .from('tutorial_progress')
      .upsert({
        user_id: userId,
        tutorial_id: tutorialId,
        ...patch,
      }, { onConflict: 'user_id,tutorial_id' });
  } catch {
    console.warn('[tutorial.skipTutorial] Supabase unavailable, localStorage used as fallback');
  }
}

export async function resetTutorial(userId: string, tutorialId: string): Promise<void> {
  // Always clear from localStorage
  const items = getLocalProgress().filter(
    (p) => !(p.user_id === userId && p.tutorial_id === tutorialId),
  );
  saveLocalProgress(items);

  if (isMock()) return;

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase
      .from('tutorial_progress')
      .delete()
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId);
  } catch {
    console.warn('[tutorial.resetTutorial] Supabase unavailable, localStorage used as fallback');
  }
}
