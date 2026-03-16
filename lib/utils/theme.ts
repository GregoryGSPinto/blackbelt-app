/**
 * Theme utilities — used by the FOUC prevention inline script.
 * The ThemeContext is the source of truth at runtime.
 *
 * The new design system uses `:root` as dark (default) and `.light` class
 * on <html> for light mode. We also keep `dark` class for Tailwind compat.
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
    var isLight = stored === 'light' ||
      (stored !== 'dark' && !window.matchMedia('(prefers-color-scheme: dark)').matches && stored !== 'system');
    var isDark = stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  } catch(e){}
})();
`.trim();
}
