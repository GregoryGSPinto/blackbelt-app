import { isMock } from '@/lib/env';
import { handleServiceError, logServiceError } from '@/lib/api/errors';

/**
 * Check if the user has already seen the tour for their profile.
 * Uses the `has_seen_tour` column added in migration 085.
 */
export async function getHasSeenTour(profileId: string): Promise<boolean> {
  if (isMock()) {
    const { mockGetHasSeenTour } = await import('@/lib/mocks/tour.mock');
    return mockGetHasSeenTour(profileId);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('has_seen_tour')
      .eq('id', profileId)
      .single();

    if (error) throw error;

    return data?.has_seen_tour ?? false;
  } catch (error) {
    logServiceError(error, 'tour.getHasSeenTour');
    return false;
  }
}

/**
 * Mark the tour as seen for the given profile.
 * Sets `has_seen_tour = true` on the profiles table.
 */
export async function markTourAsSeen(profileId: string): Promise<void> {
  if (isMock()) {
    const { mockMarkTourAsSeen } = await import('@/lib/mocks/tour.mock');
    mockMarkTourAsSeen(profileId);
    return;
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('profiles')
      .update({ has_seen_tour: true })
      .eq('id', profileId);

    if (error) throw error;
  } catch (error) {
    handleServiceError(error, 'tour.markTourAsSeen');
  }
}

/**
 * Reset the tour for the given profile so it shows again.
 * Sets `has_seen_tour = false` on the profiles table.
 */
export async function resetTourForProfile(profileId: string): Promise<void> {
  if (isMock()) {
    const { mockResetTour } = await import('@/lib/mocks/tour.mock');
    mockResetTour(profileId);
    return;
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('profiles')
      .update({ has_seen_tour: false })
      .eq('id', profileId);

    if (error) throw error;
  } catch (error) {
    handleServiceError(error, 'tour.resetTourForProfile');
  }
}
