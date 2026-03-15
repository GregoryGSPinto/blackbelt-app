const STORAGE_KEY = 'bb-theme-preference';

export type ThemeMode = 'light' | 'dark' | 'auto';

function getStoredPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

function shouldBeDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;

  // Auto: dark after 19h (7pm), light before
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getThemeMode(): ThemeMode {
  return getStoredPreference();
}

export function isDarkActive(): boolean {
  return shouldBeDark(getStoredPreference());
}

export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme(shouldBeDark(mode));
}

export function toggleTheme(): ThemeMode {
  const current = getStoredPreference();
  let next: ThemeMode;

  if (current === 'light') {
    next = 'dark';
  } else if (current === 'dark') {
    next = 'auto';
  } else {
    next = 'light';
  }

  setThemeMode(next);
  return next;
}

export function initTheme(): void {
  const mode = getStoredPreference();
  applyTheme(shouldBeDark(mode));

  // If auto, re-check every minute
  if (mode === 'auto') {
    const interval = setInterval(() => {
      const currentMode = getStoredPreference();
      if (currentMode !== 'auto') {
        clearInterval(interval);
        return;
      }
      applyTheme(shouldBeDark('auto'));
    }, 60_000);
  }
}
