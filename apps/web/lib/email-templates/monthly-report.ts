import { emailLayout } from './base';

export function monthlyReportEmail(data: {
  nomeResponsavel: string;
  nomeAluno: string;
  mes: string;
  presencas: string;
  totalAulas: string;
  avaliacao: string;
}): string {
  return emailLayout(
    `<p>Olá <strong>${data.nomeResponsavel}</strong>,</p>
<p>Segue o relatório mensal de <strong>${data.nomeAluno}</strong> referente a <strong>${data.mes}</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#f5f5f5"><td style="padding:12px;border:1px solid #eee;font-weight:600">Presenças</td><td style="padding:12px;border:1px solid #eee">${data.presencas} de ${data.totalAulas} aulas</td></tr>
<tr><td style="padding:12px;border:1px solid #eee;font-weight:600">Avaliação Geral</td><td style="padding:12px;border:1px solid #eee">${data.avaliacao}</td></tr>
</table>
<p>Para mais detalhes, acesse o app:</p>`,
    'https://blackbelts.com.br/parent',
    'Ver Detalhes',
  );
}
