'use client';

import { useState, useEffect } from 'react';
import { isMock } from '@/lib/env';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Resolves the current user's student UUID from their profile.
 * In mock mode: returns 'stu-1'.
 * In real mode: queries the students table by profile_id.
 */
export function useStudentId(): { studentId: string | null; loading: boolean } {
  const { profile } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(isMock() ? 'stu-1' : null);
  const [loading, setLoading] = useState(!isMock());

  useEffect(() => {
    if (isMock()) {
      setStudentId('stu-1');
      setLoading(false);
      return;
    }

    if (!profile?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();

        const { data } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', profile!.id)
          .limit(1)
          .maybeSingle();

        if (!cancelled) {
          setStudentId(data?.id ?? null);
        }
      } catch {
        console.warn('[useStudentId] Failed to resolve student ID');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [profile?.id]);

  return { studentId, loading };
}
