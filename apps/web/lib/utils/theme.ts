/**
 * Theme utilities — used by the FOUC prevention inline script.
 * The ThemeContext is the source of truth at runtime.
 *
 * Standard Tailwind pattern: :root = light (default), .dark = dark override.
 * Only the `dark` class is toggled on <html>.
 */

export const THEME_STORAGE_KEY = 'bb-theme';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Returns the inline script string for FOUC prevention.
 * Must be inserted as a blocking <script> in <head>.
 */
export function getThemeInitScript(): string {
  return `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e){}
})();
`.trim();
}
