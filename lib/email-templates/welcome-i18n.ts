import type { SupportedLocale } from '@/lib/types/regional';
import { emailLayoutI18n, getEmailStrings } from './i18n';

export function welcomeEmailI18n(data: { nome: string; academia: string }, locale: SupportedLocale = 'pt-BR'): string {
  const s = getEmailStrings(locale).welcome;
  const features = s.features.map((f) => `<li>${f}</li>`).join('\n');
  return emailLayoutI18n(
    `<p>${s.greeting(data.nome)}</p>
<p>${s.body(data.academia)}</p>
<ul style="color:#333;line-height:2">${features}</ul>
<p>${s.signoff}</p>`,
    locale,
    'https://blackbelts.com.br/dashboard',
    getEmailStrings(locale).accessApp,
  );
}
