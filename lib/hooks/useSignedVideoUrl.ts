'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSignedUrl } from '@/lib/api/video-upload.service';

interface UseSignedVideoUrlResult {
  url: string | null;
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

export function useSignedVideoUrl(storagePath: string | null): UseSignedVideoUrlResult {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storagePathRef = useRef(storagePath);
  storagePathRef.current = storagePath;

  const fetchSignedUrl = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const signedUrl = await getSignedUrl(path);
      // Only update if the path hasn't changed during the async call
      if (storagePathRef.current === path) {
        setUrl(signedUrl);
      }
    } catch (err) {
      if (storagePathRef.current === path) {
        const message = err instanceof Error ? err.message : 'Erro ao gerar URL assinada';
        setError(message);
        setUrl(null);
      }
    } finally {
      if (storagePathRef.current === path) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // If no path, reset and bail
    if (!storagePath) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Initial fetch
    fetchSignedUrl(storagePath);

    // Auto-renew every 50 minutes
    timerRef.current = setInterval(() => {
      if (storagePathRef.current) {
        fetchSignedUrl(storagePathRef.current);
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [storagePath, fetchSignedUrl]);

  return { url, loading, error };
}
