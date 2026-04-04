'use client';

// Simplified theme context for site (always dark)
export function useTheme() {
  return { resolvedTheme: 'dark' as const };
}
