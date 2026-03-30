'use client';

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

/**
 * Garante que loading nunca fica true por mais de `ms` millisegundos.
 * Se o timeout disparar, seta loading=false e loga um warning.
 */
export function useLoadingTimeout(
  loading: boolean,
  setLoading: Dispatch<SetStateAction<boolean>>,
  ms: number = 5000,
  label: string = 'Page'
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`[${label}] Loading timeout ${ms}ms — forçando false`);
        setLoading(false);
      }, ms);
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, ms, label, setLoading]);
}
