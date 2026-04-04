import type { SupportedLocale } from '@/lib/types/regional';
import { emailLayoutI18n, getEmailStrings } from './i18n';

export function invoiceEmailI18n(data: { nome: string; valor: string; vencimento: string; linkPagamento: string }, locale: SupportedLocale = 'pt-BR'): string {
  const s = getEmailStrings(locale).invoice;
  return emailLayoutI18n(
    `<p>${s.greeting(data.nome)}</p>
<p>${s.body(data.valor, data.vencimento)}</p>`,
    locale,
    data.linkPagamento,
    s.cta,
  );
}
