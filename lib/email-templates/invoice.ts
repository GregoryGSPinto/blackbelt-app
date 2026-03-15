import { emailLayout } from './base';

export function invoiceEmail(data: { nome: string; valor: string; vencimento: string; linkPagamento: string }): string {
  return emailLayout(
    `<p>Olá <strong>${data.nome}</strong>,</p>
<p>Sua fatura de <strong>R$ ${data.valor}</strong> vence em <strong>${data.vencimento}</strong>.</p>
<p>Clique no botão abaixo para realizar o pagamento:</p>`,
    data.linkPagamento,
    'Pagar Fatura',
  );
}
