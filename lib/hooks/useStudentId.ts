'use client';

import { useState, useEffect } from 'react';
import { isMock } from '@/lib/env';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Resolves the current user's student UUID from their profile.
 * In mock mode: returns 'stu-1'.
 * In real mode: resolves the active student through an authenticated API route.
 */
export function useStudentId(): { studentId: string | null; loading: boolean } {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(isMock() ? 'stu-1' : null);
  const [loading, setLoading] = useState(!isMock());

  useEffect(() => {
    if (isMock()) {
      setStudentId('stu-1');
      setLoading(false);
      return;
    }

    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setStudentId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function resolve() {
      try {
        const response = await fetch('/api/student/current', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve current student (${response.status})`);
        }

        const data = await response.json();

        if (!cancelled) {
          setStudentId((data?.studentId as string | null | undefined) ?? null);
        }
      } catch {
        console.warn('[useStudentId] Failed to resolve student ID');
        if (!cancelled) setStudentId(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated]);

  return { studentId, loading };
}
