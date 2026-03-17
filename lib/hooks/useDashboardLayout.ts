'use client';

import { useState, useCallback, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

export type WidgetId =
  | 'headlines'
  | 'chart'
  | 'schedule'
  | 'alerts'
  | 'quick_actions'
  | 'content'
  | 'achievements'
  | 'plan_usage';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  visible: boolean;
  order: number;
}

export type LayoutPreset = 'complete' | 'summary' | 'financial';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'headlines', label: 'Métricas Principais', visible: true, order: 0 },
  { id: 'chart', label: 'Gráfico de Crescimento', visible: true, order: 1 },
  { id: 'schedule', label: 'Hoje na Academia', visible: true, order: 2 },
  { id: 'alerts', label: 'Atenção Necessária', visible: true, order: 3 },
  { id: 'quick_actions', label: 'Ações Rápidas', visible: true, order: 4 },
  { id: 'content', label: 'Conteúdo & Retenção', visible: true, order: 5 },
  { id: 'achievements', label: 'Conquistas', visible: true, order: 6 },
  { id: 'plan_usage', label: 'Uso do Plano', visible: true, order: 7 },
];

const PRESETS: Record<LayoutPreset, WidgetId[]> = {
  complete: ['headlines', 'chart', 'schedule', 'alerts', 'quick_actions', 'content', 'achievements', 'plan_usage'],
  summary: ['headlines', 'quick_actions', 'alerts'],
  financial: ['headlines', 'chart', 'alerts', 'plan_usage'],
};

const STORAGE_KEY = 'bb_dashboard_layout';

// ── Hook ──────────────────────────────────────────────────────

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWidgets(JSON.parse(stored) as WidgetConfig[]);
      }
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    }
  }, []);

  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const moveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reordered = updated.map((w, i) => ({ ...w, order: i }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
      }
      return reordered;
    });
  }, []);

  const applyPreset = useCallback((preset: LayoutPreset) => {
    const visibleIds = PRESETS[preset];
    const updated = DEFAULT_WIDGETS.map((w, i) => ({
      ...w,
      visible: visibleIds.includes(w.id),
      order: i,
    }));
    save(updated);
  }, [save]);

  const resetLayout = useCallback(() => {
    save(DEFAULT_WIDGETS);
  }, [save]);

  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    toggleWidget,
    moveWidget,
    applyPreset,
    resetLayout,
  };
}
