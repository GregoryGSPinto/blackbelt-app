import type { SupportedLocale } from '@/lib/types/regional';
import { emailLayoutI18n, getEmailStrings } from './i18n';

export function classReminderEmailI18n(data: { nome: string; modalidade: string; horario: string }, locale: SupportedLocale = 'pt-BR'): string {
  const s = getEmailStrings(locale).classReminder;
  return emailLayoutI18n(
    `<p>${s.greeting(data.nome)}</p>
<p>${s.body(data.modalidade, data.horario)}</p>`,
    locale,
    'https://app.blackbelt.com/turmas',
    s.cta,
  );
}
