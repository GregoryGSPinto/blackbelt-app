// ============================================================
// BlackBelt v2 — Template: Lembrete de Pagamento (F5)
// Email enviado quando uma mensalidade esta proxima do vencimento.
// ============================================================

interface PaymentReminderEmailData {
  name: string;
  amount: number;
  dueDate: string;
  paymentUrl: string;
  academyName: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function paymentReminderEmail(data: PaymentReminderEmailData): { subject: string; html: string } {
  return {
    subject: `Lembrete: Mensalidade ${data.academyName} vence em breve`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#C62828;padding:24px 32px;text-align:center;">
          <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">BLACKBELT</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="color:#C62828;font-size:22px;margin:0 0 16px;">Lembrete de Mensalidade</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Ola <strong>${data.name}</strong>,
          </p>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Sua mensalidade na <strong>${data.academyName}</strong> esta proxima do vencimento.
          </p>
          <div style="background:#FFF8E1;border:1px solid #FFE082;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
            <p style="color:#F57F17;font-size:13px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">Valor da mensalidade</p>
            <p style="color:#333;font-size:28px;font-weight:800;margin:0 0 8px;">${formatCurrency(data.amount)}</p>
            <p style="color:#666;font-size:14px;margin:0;">Vencimento: <strong>${data.dueDate}</strong></p>
          </div>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:16px 0 24px;">
            Evite atrasos e mantenha seu acesso a academia em dia.
            Pague pelo link abaixo:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${data.paymentUrl}" style="display:inline-block;background:#C62828;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Pagar Agora
              </a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
            ${data.academyName} — Gerenciado pelo BlackBelt.
            Se ja efetuou o pagamento, desconsidere este email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
