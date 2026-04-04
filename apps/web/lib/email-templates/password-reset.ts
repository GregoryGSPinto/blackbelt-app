import { emailLayout } from './base';

export function passwordResetEmail(data: { nome: string; resetLink: string }): string {
  return emailLayout(
    `<p>Olá <strong>${data.nome}</strong>,</p>
<p>Recebemos uma solicitação para redefinir sua senha no BlackBelt.</p>
<p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
<p style="color:#999;font-size:12px;margin-top:24px">Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.</p>`,
    data.resetLink,
    'Redefinir Senha',
  );
}
