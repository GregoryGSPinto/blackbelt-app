import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const params = new URLSearchParams({ role, userId, academyId });
      const res = await fetch(`/api/suggestions?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'suggestions.get');
      return res.json();
    } catch {
      console.warn('[suggestions.getSuggestions] API not available, using fallback');
      return [];
    }

  } catch (error) {
    handleServiceError(error, 'suggestions.get');
  }
}

export async function dismissSuggestion(suggestionId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDismissSuggestion } = await import('@/lib/mocks/suggestions.mock');
      return mockDismissSuggestion(suggestionId);
    }
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/dismiss`, {
        method: 'POST',
      });
      if (!res.ok) throw new ServiceError(res.status, 'suggestions.dismiss');
    } catch {
      console.warn('[suggestions.dismissSuggestion] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'suggestions.dismiss');
  }
}
