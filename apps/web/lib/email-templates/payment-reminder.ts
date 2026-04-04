import { emailLayout } from './base';

export interface PaymentReminderData {
  nome: string;
  valor: string;
  vencimento: string;
  academia: string;
  linkPagamento: string;
}

export function paymentReminderEmail(data: PaymentReminderData): string {
  return emailLayout(
    `<p>Ola <strong>${data.nome}</strong>,</p>
<p>Este e um lembrete de que sua mensalidade na <strong>${data.academia}</strong> vence em <strong>3 dias</strong>.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#f5f5f5">
<td style="padding:12px;border:1px solid #eee;font-weight:600">Valor</td>
<td style="padding:12px;border:1px solid #eee">R$ ${data.valor}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Vencimento</td>
<td style="padding:12px;border:1px solid #eee">${data.vencimento}</td>
</tr>
</table>
<p>Realize o pagamento antecipado para evitar inconvenientes.</p>`,
    data.linkPagamento,
    'Pagar Agora',
  );
}
