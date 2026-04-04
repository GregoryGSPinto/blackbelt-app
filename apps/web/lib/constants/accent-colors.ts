export const ACCENT_COLORS = [
  { name: 'Vermelho BB', value: '#C62828' },  // default BlackBelt
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Fucsia', value: '#D946EF' },
] as const;

export const DEFAULT_ACCENT = '#C62828';
export type AccentColor = typeof ACCENT_COLORS[number]['value'];
