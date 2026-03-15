// ── L28: Temporal Context ──────────────────────────────────────────────
// Pure utility functions for time-aware UI context. No service needed.

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface DayContext {
  dayOfWeek: number;
  message: string | null;
}

export interface MonthContext {
  isMonthStart: boolean;
  isMonthEnd: boolean;
  message: string | null;
}

/**
 * Returns a Portuguese greeting based on the current hour.
 */
export function getGreeting(now?: Date): string {
  const hour = (now ?? new Date()).getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Returns the semantic time-of-day bucket.
 */
export function getTimeContext(now?: Date): TimeOfDay {
  const hour = (now ?? new Date()).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Returns special-day context for motivational messages.
 * Sunday = 0, Monday = 1, ... Saturday = 6
 */
export function getDayContext(now?: Date): DayContext {
  const date = now ?? new Date();
  const dayOfWeek = date.getDay();

  const messages: Record<number, string> = {
    0: 'Domingo de descanso! Recarregue as energias.',
    1: 'Semana nova! Bora comecar com tudo!',
    2: 'Terca-feira: mantenha o ritmo!',
    3: 'Quarta-feira: metade da semana, nao desanime!',
    4: 'Quinta-feira: quase la, foco no treino!',
    5: 'Ultima aula da semana! Termine com forca!',
    6: 'Sabado: treino extra pra quem quer evoluir!',
  };

  return {
    dayOfWeek,
    message: messages[dayOfWeek] ?? null,
  };
}

/**
 * Returns month-boundary context for billing/reporting awareness.
 */
export function getMonthContext(now?: Date): MonthContext {
  const date = now ?? new Date();
  const day = date.getDate();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const isMonthStart = day <= 5;
  const isMonthEnd = day >= lastDay - 4;

  let message: string | null = null;
  if (isMonthStart) {
    message = 'Inicio do mes! Hora de revisar metas e renovar a energia.';
  } else if (isMonthEnd) {
    message = 'Final do mes! Confira seu progresso e feche forte.';
  }

  return { isMonthStart, isMonthEnd, message };
}
