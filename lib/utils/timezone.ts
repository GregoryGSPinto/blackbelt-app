import type { SupportedLocale } from '@/lib/types/regional';
import { LOCALE_DEFAULTS } from '@/lib/types/regional';

/** Get default timezone for a given locale */
export function getDefaultTimezone(locale: SupportedLocale): string {
  return LOCALE_DEFAULTS[locale].timezone;
}

/** Get the user's browser timezone */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/Sao_Paulo';
  }
}

/** Convert a date to a specific timezone */
export function toTimezone(date: Date | string, timezone: string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const str = d.toLocaleString('en-US', { timeZone: timezone });
  return new Date(str);
}

/** Format a date displaying the timezone abbreviation */
export function formatWithTimezone(date: Date | string, locale: SupportedLocale, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tz = timezone ?? LOCALE_DEFAULTS[locale].timezone;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
    timeZoneName: 'short',
  }).format(d);
}

/** Get UTC offset string for a timezone (e.g., "UTC-03:00") */
export function getUtcOffset(timezone: string): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' });
  const parts = fmt.formatToParts(now);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  return tzPart?.value ?? 'UTC';
}

/** Common timezones for martial arts academies */
export const COMMON_TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Manaus', label: 'Manaus (AMT)' },
  { value: 'America/Belem', label: 'Belém (BRT)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (BRT)' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
] as const;
