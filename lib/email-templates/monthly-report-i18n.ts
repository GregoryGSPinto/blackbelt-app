import type { SupportedLocale } from '@/lib/types/regional';
import { emailLayoutI18n, getEmailStrings } from './i18n';

export function monthlyReportEmailI18n(
  data: { nomeResponsavel: string; nomeAluno: string; mes: string; presencas: string; totalAulas: string; avaliacao: string },
  locale: SupportedLocale = 'pt-BR',
): string {
  const s = getEmailStrings(locale).monthlyReport;
  return emailLayoutI18n(
    `<p>${s.greeting(data.nomeResponsavel)}</p>
<p>${s.intro(data.nomeAluno, data.mes)}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#f5f5f5"><td style="padding:12px;border:1px solid #eee;font-weight:600">${s.attendance}</td><td style="padding:12px;border:1px solid #eee">${data.presencas} / ${data.totalAulas}</td></tr>
<tr><td style="padding:12px;border:1px solid #eee;font-weight:600">${s.evaluation}</td><td style="padding:12px;border:1px solid #eee">${data.avaliacao}</td></tr>
</table>`,
    locale,
    'https://blackbeltv2.vercel.app/parent',
    s.cta,
  );
}
