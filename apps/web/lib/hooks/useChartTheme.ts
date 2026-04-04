'use client';

import { useMemo } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

export interface ChartTheme {
  text: string;
  grid: string;
  tooltip: { bg: string; border: string; text: string; radius: number };
  colors: string[];
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();

  return useMemo(() => {
    if (resolvedTheme === 'dark') {
      return {
        text: '#4A4F63',
        grid: 'rgba(42, 46, 62, 0.5)',
        tooltip: { bg: '#1A1D28', border: 'rgba(255,255,255,0.06)', text: '#F4F4F7', radius: 12 },
        colors: ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#F97316'],
      };
    }
    return {
      text: '#6B7085',
      grid: 'rgba(0,0,0,0.06)',
      tooltip: { bg: '#FFFFFF', border: 'rgba(0,0,0,0.06)', text: '#0F1117', radius: 12 },
      colors: ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#F97316'],
    };
  }, [resolvedTheme]);
}
