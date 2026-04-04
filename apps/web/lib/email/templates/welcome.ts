// ============================================================
// BlackBelt v2 — Template: Boas-vindas (F5)
// Email enviado quando um novo aluno e cadastrado na academia.
// ============================================================

interface WelcomeEmailData {
  name: string;
  academyName: string;
  loginUrl: string;
  tempPassword?: string;
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  return {
    subject: `Bem-vindo a ${data.academyName}!`,
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
          <h1 style="color:#C62828;font-size:22px;margin:0 0 16px;">Bem-vindo, ${data.name}!</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Voce foi cadastrado na academia <strong>${data.academyName}</strong>.
            Sua jornada nas artes marciais comeca agora!
          </p>
          ${data.tempPassword ? `
          <div style="background:#FFF3E0;border-left:4px solid #FF9800;padding:16px;margin:16px 0;border-radius:4px;">
            <p style="margin:0;color:#333;font-size:14px;"><strong>Sua senha temporaria:</strong> ${data.tempPassword}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#666;">Voce sera solicitado a trocar no primeiro login.</p>
          </div>
          ` : ''}
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 8px;">No BlackBelt voce pode:</p>
          <ul style="color:#555;font-size:14px;line-height:2;margin:0 0 24px;padding-left:20px;">
            <li>Acompanhar suas presencas e evolucao</li>
            <li>Ver horarios das suas turmas</li>
            <li>Receber avaliacoes do professor</li>
            <li>Conquistar badges e graduacoes</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${data.loginUrl}" style="display:inline-block;background:#C62828;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Acessar BlackBelt
              </a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
            Este email foi enviado automaticamente pelo BlackBelt.
            Se voce nao se cadastrou, ignore este email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
