import type { SupportedLocale, SupportedCurrency } from '@/lib/types/regional';
import { LOCALE_DEFAULTS } from '@/lib/types/regional';

/** Format currency value according to locale */
export function formatCurrency(value: number, locale: SupportedLocale = 'pt-BR', currency?: SupportedCurrency): string {
  const cur = currency ?? LOCALE_DEFAULTS[locale].currency;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(value);
}

/** Format date according to locale conventions */
export function formatDate(date: Date | string, locale: SupportedLocale = 'pt-BR', options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaults: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Intl.DateTimeFormat(locale, options ?? defaults).format(d);
}

/** Format date with long month name */
export function formatDateLong(date: Date | string, locale: SupportedLocale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Format time according to locale (24h / 12h) */
export function formatTime(date: Date | string, locale: SupportedLocale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hour12 = LOCALE_DEFAULTS[locale].timeFormat === '12h';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12 }).format(d);
}

/** Format relative time (e.g., "2 days ago") */
export function formatRelativeTime(date: Date | string, locale: SupportedLocale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, 'minute');
  return rtf.format(diffSecs, 'second');
}

/** Format number with locale-specific separators */
export function formatNumber(value: number, locale: SupportedLocale = 'pt-BR', options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/** Format percentage */
export function formatPercent(value: number, locale: SupportedLocale = 'pt-BR', decimals = 0): string {
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value / 100);
}
