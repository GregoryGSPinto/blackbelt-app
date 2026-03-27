// ============================================================
// BlackBelt v2 — Template: Confirmacao de Consentimento Parental (F5)
// Email enviado ao responsavel apos autorizar o uso do app pelo menor.
// ============================================================

interface ParentalConsentEmailData {
  guardianName: string;
  childName: string;
  academyName: string;
  consentDate: string;
}

export function parentalConsentEmail(data: ParentalConsentEmailData): { subject: string; html: string } {
  return {
    subject: `Consentimento registrado — ${data.childName} em ${data.academyName}`,
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
          <h1 style="color:#C62828;font-size:22px;margin:0 0 16px;">Consentimento Parental Registrado</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Ola <strong>${data.guardianName}</strong>,
          </p>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Este email confirma que voce autorizou <strong>${data.childName}</strong> a utilizar
            o aplicativo BlackBelt na academia <strong>${data.academyName}</strong>.
          </p>
          <div style="background:#E8F5E9;border:1px solid #A5D6A7;border-radius:8px;padding:20px;margin:16px 0;">
            <table width="100%" cellpadding="6" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:13px;width:140px;">Responsavel:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.guardianName}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:13px;">Menor autorizado:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.childName}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:13px;">Academia:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.academyName}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:13px;">Data do consentimento:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.consentDate}</td>
              </tr>
            </table>
          </div>
          <h2 style="color:#333;font-size:16px;margin:24px 0 12px;">Dados coletados do menor:</h2>
          <ul style="color:#555;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
            <li>Nome e data de nascimento</li>
            <li>Dados de presenca e evolucao na academia</li>
            <li>Fotos de perfil (se enviadas)</li>
          </ul>
          <h2 style="color:#333;font-size:16px;margin:16px 0 12px;">Dados NAO coletados:</h2>
          <ul style="color:#555;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
            <li>Localizacao do menor</li>
            <li>Dados compartilhados com terceiros</li>
            <li>Anuncios ou rastreamento publicitario</li>
          </ul>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:16px 0 0;">
            Voce pode revogar este consentimento a qualquer momento nas configuracoes do app
            ou entrando em contato com a academia.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
            Este email e um registro legal do consentimento parental conforme LGPD e COPPA.
            Guarde-o para referencia.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
