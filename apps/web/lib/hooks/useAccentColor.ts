'use client';

import { useState, useEffect, useCallback } from 'react';
import { isMock } from '@/lib/env';
import { ACCENT_COLORS, DEFAULT_ACCENT } from '@/lib/constants/accent-colors';
import { logServiceError } from '@/lib/api/errors';

function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--bb-accent', color);
  // Also derive a lighter version for hover/surface states (10% opacity)
  document.documentElement.style.setProperty('--bb-accent-light', color + '1A');
}

export function useAccentColor() {
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('bb-accent-color');
    if (saved) {
      setAccentColorState(saved);
      applyAccentColor(saved);
    }
  }, []);

  const setAccentColor = useCallback(async (color: string) => {
    setAccentColorState(color);
    applyAccentColor(color);
    localStorage.setItem('bb-accent-color', color);

    // Also save to profile if not mock
    if (!isMock()) {
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ accent_color: color })
            .eq('user_id', user.id);
        }
      } catch (error) {
        // Silently fail — localStorage is the fallback
        logServiceError(error, 'accentColor.save');
      }
    }
  }, []);

  return { accentColor, setAccentColor, ACCENT_COLORS };
}
