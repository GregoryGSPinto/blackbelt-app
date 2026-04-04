import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type SuggestionPriority = 'high' | 'medium' | 'low';

export type SuggestionCategory =
  // Student
  | 'frequency_drop'
  | 'near_record'
  | 'near_achievement'
  | 'new_modality'
  // Admin
  | 'capacity_warning'
  | 'lead_followup'
  | 'slow_slot'
  // Teacher
  | 'evaluation_candidate'
  | 'absent_student';

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  icon: string;
  dismissedUntil: string | null;
}

export type UserRole = 'student' | 'admin' | 'teacher';

export async function getSuggestions(
  role: UserRole,
  userId: string,
  academyId: string,
): Promise<Suggestion[]> {
  try {
    if (isMock()) {
      const { mockGetSuggestions } = await import('@/lib/mocks/suggestions.mock');
      return mockGetSuggestions(role, userId, academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('academy_id', academyId)
      .eq('role', role)
      .is('dismissed_until', null);
    if (error) {
      logServiceError(error, 'suggestions');
      return [];
    }
    return (data ?? []) as unknown as Suggestion[];
  } catch (error) {
    logServiceError(error, 'suggestions');
    return [];
  }
}

export async function dismissSuggestion(suggestionId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDismissSuggestion } = await import('@/lib/mocks/suggestions.mock');
      return mockDismissSuggestion(suggestionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('suggestions')
      .update({ dismissed_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
      .eq('id', suggestionId);
    if (error) {
      logServiceError(error, 'suggestions');
    }
  } catch (error) {
    logServiceError(error, 'suggestions');
  }
}
