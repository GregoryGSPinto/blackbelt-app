import type { SupabaseClient } from '@supabase/supabase-js';
import { ServiceError, logServiceError } from '@/lib/api/errors';

const SERVICE = 'supabase-helpers';

/**
 * Fetches the current authenticated user's profile from the `profiles` table.
 * Returns `null` when no session or no matching profile row exists.
 */
export async function getCurrentProfile(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new ServiceError(401, SERVICE, authError.message);
    }

    if (!user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new ServiceError(500, SERVICE, profileError.message);
    }

    return profile;
  } catch (error) {
    logServiceError(error, SERVICE);
    return null;
  }
}

/**
 * Resolves the `academy_id` from the current user's first active membership.
 * Returns `null` when the user has no active memberships.
 */
export async function getAcademyId(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new ServiceError(401, SERVICE, authError.message);
    }

    if (!user) {
      return null;
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (membershipError) {
      // PGRST116 = no rows found — not a server error, just no membership
      if (membershipError.code === 'PGRST116') {
        return null;
      }
      throw new ServiceError(500, SERVICE, membershipError.message);
    }

    return membership.academy_id as string;
  } catch (error) {
    logServiceError(error, SERVICE);
    return null;
  }
}

/**
 * Same as `getAcademyId` but throws a `ServiceError` (403) when no active
 * membership is found, making it safe to use in code paths that require a
 * tenant context.
 */
export async function requireAcademyId(supabase: SupabaseClient): Promise<string> {
  const academyId = await getAcademyId(supabase);

  if (!academyId) {
    throw new ServiceError(
      403,
      SERVICE,
      'No active academy membership found for the current user',
    );
  }

  return academyId;
}
