export type SupportedLocale = 'pt-BR' | 'en-US' | 'es';

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR';

export interface RegionalConfig {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  timezone: string;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  timeFormat: '24h' | '12h';
}

export const LOCALE_DEFAULTS: Record<SupportedLocale, RegionalConfig> = {
  'pt-BR': { locale: 'pt-BR', currency: 'BRL', timezone: 'America/Sao_Paulo', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
  'en-US': { locale: 'en-US', currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/dd/yyyy', timeFormat: '12h' },
  'es': { locale: 'es', currency: 'EUR', timezone: 'Europe/Madrid', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
};

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  'pt-BR': 'Português (BR)',
  'en-US': 'English (US)',
  'es': 'Español',
};
