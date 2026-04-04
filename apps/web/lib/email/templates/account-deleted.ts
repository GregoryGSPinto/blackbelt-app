// ============================================================
// BlackBelt v2 — Template: Conta Excluida (F5)
// Email enviado como confirmacao apos exclusao de conta.
// ============================================================

interface AccountDeletedEmailData {
  name: string;
}

export function accountDeletedEmail(data: AccountDeletedEmailData): { subject: string; html: string } {
  return {
    subject: 'Sua conta BlackBelt foi excluida',
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
          <h1 style="color:#C62828;font-size:22px;margin:0 0 16px;">Conta Excluida</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Ola <strong>${data.name}</strong>,
          </p>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Confirmamos que sua conta no BlackBelt foi excluida com sucesso.
          </p>
          <div style="background:#FFEBEE;border:1px solid #FFCDD2;border-radius:8px;padding:20px;margin:16px 0;">
            <h3 style="color:#C62828;font-size:14px;margin:0 0 12px;">O que aconteceu com seus dados:</h3>
            <ul style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
              <li>Seus dados pessoais foram anonimizados conforme a LGPD</li>
              <li>Seu perfil foi desativado em todas as academias</li>
              <li>Seus dados de acesso foram removidos permanentemente</li>
              <li>Registros de auditoria serao mantidos por 5 anos (exigencia legal)</li>
            </ul>
          </div>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:16px 0;">
            Esta acao e irreversivel. Se desejar voltar a treinar, sera necessario
            criar uma nova conta.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:16px 0 0;">
            Agradecemos por ter feito parte da comunidade BlackBelt.
            Desejamos tudo de melhor na sua jornada!
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
            Este email foi enviado automaticamente pelo BlackBelt.
            Em caso de duvidas, entre em contato com a sua academia.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
