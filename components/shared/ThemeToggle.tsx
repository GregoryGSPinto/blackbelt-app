'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

type ThemeMode = 'system' | 'light' | 'dark';

const ICONS: Record<ThemeMode, { label: string; path: string }> = {
  light: {
    label: 'Modo claro',
    path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  },
  dark: {
    label: 'Modo escuro',
    path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  },
  system: {
    label: 'Automatico',
    path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
};

const CYCLE: ThemeMode[] = ['system', 'light', 'dark'];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function handleToggle() {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
  }

  const icon = ICONS[theme];

  return (
    <button
      onClick={handleToggle}
      className="rounded-lg p-2 transition-all duration-300"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--bb-ink-60)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bb-depth-4)';
        e.currentTarget.style.color = 'var(--bb-ink-80)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--bb-ink-60)';
      }}
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

ThemeToggle.displayName = 'ThemeToggle';
