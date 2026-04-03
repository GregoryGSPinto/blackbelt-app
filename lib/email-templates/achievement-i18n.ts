import type { SupportedLocale } from '@/lib/types/regional';
import { emailLayoutI18n, getEmailStrings } from './i18n';

export function achievementEmailI18n(data: { nome: string; conquista: string; descricao: string }, locale: SupportedLocale = 'pt-BR'): string {
  const s = getEmailStrings(locale).achievement;
  return emailLayoutI18n(
    `<p>${s.greeting(data.nome)}</p>
<p>${s.unlocked}</p>
<div style="background:#FFF3E0;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
<p style="font-size:32px;margin:0">🏆</p>
<p style="font-size:18px;font-weight:700;color:#333;margin:8px 0 4px">${data.conquista}</p>
<p style="font-size:14px;color:#666;margin:0">${data.descricao}</p>
</div>
<p>${s.keepGoing}</p>`,
    locale,
    'https://blackbelts.com.br/dashboard/conquistas',
    s.cta,
  );
}
