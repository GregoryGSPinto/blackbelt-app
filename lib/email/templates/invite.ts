// ============================================================
// BlackBelt v2 — Template: Convite (F5)
// Email enviado quando um membro e convidado para a academia.
// ============================================================

interface InviteEmailData {
  name: string;
  academyName: string;
  role: string;
  inviteUrl: string;
  inviterName: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsavel',
  recepcao: 'Recepcionista',
};

export function inviteEmail(data: InviteEmailData): { subject: string; html: string } {
  const roleLabel = ROLE_LABELS[data.role] || data.role;

  return {
    subject: `Voce foi convidado para ${data.academyName}`,
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
          <h1 style="color:#C62828;font-size:22px;margin:0 0 16px;">Voce foi convidado!</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Ola <strong>${data.name}</strong>,
          </p>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
            <strong>${data.inviterName}</strong> convidou voce para fazer parte da academia
            <strong>${data.academyName}</strong> como <strong>${roleLabel}</strong>.
          </p>
          <div style="background:#F5F5F5;border-radius:8px;padding:16px;margin:16px 0;">
            <table width="100%" cellpadding="4" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:13px;width:100px;">Academia:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.academyName}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:13px;">Funcao:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${roleLabel}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:13px;">Convidado por:</td>
                <td style="color:#333;font-size:13px;font-weight:600;">${data.inviterName}</td>
              </tr>
            </table>
          </div>
          <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Clique no botao abaixo para aceitar o convite e criar sua conta:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${data.inviteUrl}" style="display:inline-block;background:#C62828;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Aceitar Convite
              </a>
            </td></tr>
          </table>
          <p style="color:#999;font-size:13px;margin:24px 0 0;text-align:center;">
            Este convite expira em 7 dias.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
            Se voce nao reconhece este convite, ignore este email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
