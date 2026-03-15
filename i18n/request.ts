import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const raw = cookieStore.get('bb-locale')?.value ?? DEFAULT_LOCALE;
  const locale = SUPPORTED_LOCALES.includes(raw as SupportedLocale) ? raw : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
