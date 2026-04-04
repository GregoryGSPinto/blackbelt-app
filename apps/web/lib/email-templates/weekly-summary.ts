import { emailLayout } from './base';

export interface WeeklySummaryData {
  nomeAdmin: string;
  academia: string;
  semana: string;
  totalAlunos: number;
  novosAlunos: number;
  totalPresencas: number;
  taxaPresenca: string;
  aulasRealizadas: number;
  receitaSemana: string;
  inadimplentes: number;
}

export function weeklySummaryEmail(data: WeeklySummaryData): string {
  return emailLayout(
    `<p>Ola <strong>${data.nomeAdmin}</strong>,</p>
<p>Segue o resumo semanal da <strong>${data.academia}</strong> referente a semana de <strong>${data.semana}</strong>.</p>

<div style="margin:20px 0">
<h3 style="font-size:14px;color:#666;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">Alunos</h3>
<table style="width:100%;border-collapse:collapse">
<tr style="background:#f5f5f5">
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Total de alunos</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700">${data.totalAlunos}</td>
</tr>
<tr>
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Novos esta semana</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;color:#22C55E;font-weight:700">+${data.novosAlunos}</td>
</tr>
</table>
</div>

<div style="margin:20px 0">
<h3 style="font-size:14px;color:#666;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">Presencas</h3>
<table style="width:100%;border-collapse:collapse">
<tr style="background:#f5f5f5">
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Check-ins na semana</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700">${data.totalPresencas}</td>
</tr>
<tr>
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Taxa de presenca</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700">${data.taxaPresenca}</td>
</tr>
<tr>
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Aulas realizadas</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700">${data.aulasRealizadas}</td>
</tr>
</table>
</div>

<div style="margin:20px 0">
<h3 style="font-size:14px;color:#666;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">Financeiro</h3>
<table style="width:100%;border-collapse:collapse">
<tr style="background:#f5f5f5">
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Receita da semana</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700;color:#22C55E">R$ ${data.receitaSemana}</td>
</tr>
<tr>
<td style="padding:10px 12px;border:1px solid #eee;font-weight:600">Inadimplentes</td>
<td style="padding:10px 12px;border:1px solid #eee;text-align:right;font-weight:700;color:${data.inadimplentes > 0 ? '#EF4444' : '#22C55E'}">${data.inadimplentes}</td>
</tr>
</table>
</div>

<p style="font-size:13px;color:#666">Este resumo e gerado automaticamente toda segunda-feira.</p>`,
    'https://blackbelts.com.br/admin',
    'Ver Dashboard Completo',
  );
}
