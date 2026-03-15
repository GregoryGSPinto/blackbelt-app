'use client';

import { useEffect, useState } from 'react';
import { getThemeMode, toggleTheme, initTheme, type ThemeMode } from '@/lib/utils/theme';

const ICONS: Record<ThemeMode, { label: string; path: string }> = {
  light: {
    label: 'Modo claro',
    path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  },
  dark: {
    label: 'Modo escuro',
    path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  },
  auto: {
    label: 'Automatico',
    path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMode(getThemeMode());
    setMounted(true);
  }, []);

  function handleToggle() {
    const next = toggleTheme();
    setMode(next);
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="rounded-lg p-2 text-bb-gray-500 transition-all duration-300 hover:bg-bb-gray-100"
        aria-label="Tema"
        disabled
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.light.path} />
        </svg>
      </button>
    );
  }

  const icon = ICONS[mode];

  return (
    <button
      onClick={handleToggle}
      className="rounded-lg p-2 text-bb-gray-500 transition-all duration-300 hover:bg-bb-gray-100 dark:text-bb-gray-300 dark:hover:bg-bb-gray-700"
      aria-label={icon.label}
      title={`Tema: ${icon.label}`}
    >
      <svg
        className="h-5 w-5 transition-transform duration-300 hover:rotate-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
      </svg>
    </button>
  );
}
