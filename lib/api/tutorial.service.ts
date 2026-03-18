import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

// ── localStorage fallback helpers ─────────────────────────────────────

function getLocalProgress(): TutorialProgress[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProgress(items: TutorialProgress[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

// ── Service functions ─────────────────────────────────────────────────

export async function getTutorialProgress(userId: string): Promise<TutorialProgress[]> {
  try {
    if (isMock()) {
      return getLocalProgress().filter((p) => p.user_id === userId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data ?? []) as TutorialProgress[];
    } catch {
      console.warn('[tutorial.getTutorialProgress] Supabase unavailable, using localStorage');
      return getLocalProgress().filter((p) => p.user_id === userId);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.getProgress');
    return [];
  }
}

export async function startTutorial(userId: string, tutorialId: string): Promise<void> {
  try {
    if (isMock()) {
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'in_progress';
        existing.current_step = 0;
        existing.started_at = new Date().toISOString();
        existing.completed_at = null;
        existing.skipped_at = null;
      } else {
        items.push({
          id: crypto.randomUUID(),
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'in_progress',
          current_step: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          skipped_at: null,
          created_at: new Date().toISOString(),
        });
      }
      saveLocalProgress(items);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'in_progress',
          current_step: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          skipped_at: null,
        }, { onConflict: 'user_id,tutorial_id' });
    } catch {
      console.warn('[tutorial.startTutorial] Supabase unavailable, using localStorage');
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'in_progress';
        existing.current_step = 0;
        existing.started_at = new Date().toISOString();
        existing.completed_at = null;
        existing.skipped_at = null;
      } else {
        items.push({
          id: crypto.randomUUID(),
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'in_progress',
          current_step: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          skipped_at: null,
          created_at: new Date().toISOString(),
        });
      }
      saveLocalProgress(items);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.start');
  }
}

export async function updateTutorialStep(userId: string, tutorialId: string, step: number): Promise<void> {
  try {
    if (isMock()) {
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.current_step = step;
      }
      saveLocalProgress(items);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase
        .from('tutorial_progress')
        .update({ current_step: step })
        .eq('user_id', userId)
        .eq('tutorial_id', tutorialId);
    } catch {
      console.warn('[tutorial.updateStep] Supabase unavailable, using localStorage');
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) existing.current_step = step;
      saveLocalProgress(items);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.updateStep');
  }
}

export async function completeTutorial(userId: string, tutorialId: string): Promise<void> {
  try {
    if (isMock()) {
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'completed';
        existing.completed_at = new Date().toISOString();
      }
      saveLocalProgress(items);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase
        .from('tutorial_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('tutorial_id', tutorialId);
    } catch {
      console.warn('[tutorial.completeTutorial] Supabase unavailable, using localStorage');
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'completed';
        existing.completed_at = new Date().toISOString();
      }
      saveLocalProgress(items);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.complete');
  }
}

export async function skipTutorial(userId: string, tutorialId: string): Promise<void> {
  try {
    if (isMock()) {
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'skipped';
        existing.skipped_at = new Date().toISOString();
      } else {
        items.push({
          id: crypto.randomUUID(),
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'skipped',
          current_step: 0,
          started_at: null,
          completed_at: null,
          skipped_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
      saveLocalProgress(items);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'skipped',
          skipped_at: new Date().toISOString(),
        }, { onConflict: 'user_id,tutorial_id' });
    } catch {
      console.warn('[tutorial.skipTutorial] Supabase unavailable, using localStorage');
      const items = getLocalProgress();
      const existing = items.find((p) => p.user_id === userId && p.tutorial_id === tutorialId);
      if (existing) {
        existing.status = 'skipped';
        existing.skipped_at = new Date().toISOString();
      } else {
        items.push({
          id: crypto.randomUUID(),
          user_id: userId,
          tutorial_id: tutorialId,
          status: 'skipped',
          current_step: 0,
          started_at: null,
          completed_at: null,
          skipped_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
      saveLocalProgress(items);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.skip');
  }
}

export async function resetTutorial(userId: string, tutorialId: string): Promise<void> {
  try {
    if (isMock()) {
      const items = getLocalProgress().filter(
        (p) => !(p.user_id === userId && p.tutorial_id === tutorialId),
      );
      saveLocalProgress(items);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      await supabase
        .from('tutorial_progress')
        .delete()
        .eq('user_id', userId)
        .eq('tutorial_id', tutorialId);
    } catch {
      console.warn('[tutorial.resetTutorial] Supabase unavailable, using localStorage');
      const items = getLocalProgress().filter(
        (p) => !(p.user_id === userId && p.tutorial_id === tutorialId),
      );
      saveLocalProgress(items);
    }
  } catch (error) {
    handleServiceError(error, 'tutorial.reset');
  }
}
