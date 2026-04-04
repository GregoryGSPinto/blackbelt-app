import { emailLayout } from './base';

export interface PaymentOverdueData {
  nome: string;
  valor: string;
  vencimento: string;
  diasAtraso: number;
  academia: string;
  linkPagamento: string;
}

export function paymentOverdueEmail(data: PaymentOverdueData): string {
  return emailLayout(
    `<p>Ola <strong>${data.nome}</strong>,</p>
<p>Identificamos que sua mensalidade na <strong>${data.academia}</strong> esta em atraso.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#FEF2F2">
<td style="padding:12px;border:1px solid #FECACA;font-weight:600;color:#991B1B">Valor</td>
<td style="padding:12px;border:1px solid #FECACA;color:#991B1B">R$ ${data.valor}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Vencimento</td>
<td style="padding:12px;border:1px solid #eee">${data.vencimento}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Dias em atraso</td>
<td style="padding:12px;border:1px solid #eee">${data.diasAtraso} dia(s)</td>
</tr>
</table>
<p>Regularize seu pagamento para continuar aproveitando todos os beneficios da academia.</p>
<p style="font-size:13px;color:#666">Em caso de duvidas, entre em contato com a secretaria da sua academia.</p>`,
    data.linkPagamento,
    'Regularizar Pagamento',
  );
}
