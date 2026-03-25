// BlackBelt v2 — Email Templates
// All templates return inline-CSS HTML strings for maximum email client compatibility.
// Brand colors: black #0A0A0A, gold #D4AF37, white #FFFFFF

const BRAND = {
  black: '#0A0A0A',
  gold: '#D4AF37',
  white: '#FFFFFF',
  gray: '#666666',
  lightGray: '#F5F5F5',
};

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${BRAND.lightGray};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightGray};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background-color:${BRAND.black};padding:24px 32px;text-align:center;">
          <span style="display:inline-block;background:linear-gradient(135deg,${BRAND.gold},#E5C158);color:${BRAND.black};font-weight:900;font-size:14px;padding:6px 10px;border-radius:6px;margin-right:8px;">BB</span>
          <span style="color:${BRAND.white};font-size:20px;font-weight:700;">Black<span style="color:${BRAND.gold};">Belt</span></span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;">&copy; ${new Date().getFullYear()} BlackBelt. Todos os direitos reservados.</p>
          <p style="margin:4px 0 0;font-size:12px;color:#999;">Vespasiano - MG, Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background-color:${BRAND.gold};color:${BRAND.black};font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;margin:16px 0;">${text}</a>`;
}

// ── 1. Welcome ────────────────────────────────────────

export function welcomeEmail(params: {
  ownerName: string;
  academyName: string;
  loginUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Bem-vindo ao BlackBelt, ${params.ownerName}!`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Sua academia está pronta!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá <strong>${params.ownerName}</strong>, a academia <strong>${params.academyName}</strong> foi cadastrada com sucesso no BlackBelt.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Você tem <strong>7 dias grátis</strong> no plano Black Belt com acesso total a todas as funcionalidades.
      </p>
      <div style="text-align:center;">
        ${button('Acessar Painel', params.loginUrl)}
      </div>
      <p style="color:${BRAND.gray};font-size:14px;line-height:1.6;">
        Próximos passos:
      </p>
      <ol style="color:${BRAND.gray};font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Configure as modalidades da sua academia</li>
        <li>Cadastre seus alunos e professores</li>
        <li>Crie as turmas e horários</li>
        <li>Ative a cobrança automática</li>
      </ol>
    `),
  };
}

// ── 2. Invite ─────────────────────────────────────────

export function inviteEmail(params: {
  inviteeName: string;
  academyName: string;
  role: string;
  inviterName: string;
  acceptUrl: string;
}): { subject: string; html: string } {
  const roleLabels: Record<string, string> = {
    professor: 'Professor(a)',
    recepcao: 'Recepcionista',
    admin: 'Administrador(a)',
    gestor: 'Gestor(a)',
    aluno_adulto: 'Aluno(a)',
    aluno_teen: 'Aluno(a) Teen',
    aluno_kids: 'Aluno(a) Kids',
    responsavel: 'Responsável',
  };
  const roleLabel = roleLabels[params.role] ?? params.role;

  return {
    subject: `Convite: ${params.academyName} no BlackBelt`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Você foi convidado!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá${params.inviteeName ? ` <strong>${params.inviteeName}</strong>` : ''},
        <strong>${params.inviterName}</strong> convidou você para a academia
        <strong>${params.academyName}</strong> como <strong>${roleLabel}</strong>.
      </p>
      <div style="text-align:center;">
        ${button('Aceitar Convite', params.acceptUrl)}
      </div>
      <p style="color:#999;font-size:13px;">Este convite expira em 7 dias. Se você não esperava este email, ignore-o.</p>
    `),
  };
}

// ── 3. Payment Confirmed ──────────────────────────────

export function paymentConfirmedEmail(params: {
  customerName: string;
  value: number;
  description: string;
  paymentDate: string;
  invoiceUrl?: string;
}): { subject: string; html: string } {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value);

  return {
    subject: 'Pagamento confirmado — BlackBelt',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Pagamento confirmado!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá <strong>${params.customerName}</strong>, seu pagamento foi confirmado com sucesso.
      </p>
      <table width="100%" style="margin:16px 0;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:8px 8px 0 0;font-size:14px;color:${BRAND.gray};">Descrição</td>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:8px 8px 0 0;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.description}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:14px;color:${BRAND.gray};">Valor</td>
          <td style="padding:12px 16px;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${formatted}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:0 0 8px 8px;font-size:14px;color:${BRAND.gray};">Data</td>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:0 0 8px 8px;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.paymentDate}</td>
        </tr>
      </table>
      ${params.invoiceUrl ? `<div style="text-align:center;">${button('Ver Comprovante', params.invoiceUrl)}</div>` : ''}
    `),
  };
}

// ── 4. Reset Password ─────────────────────────────────

export function resetPasswordEmail(params: {
  userName: string;
  resetUrl: string;
}): { subject: string; html: string } {
  return {
    subject: 'Redefinir senha — BlackBelt',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Redefinir senha</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá <strong>${params.userName}</strong>, recebemos uma solicitação para redefinir sua senha.
      </p>
      <div style="text-align:center;">
        ${button('Redefinir Senha', params.resetUrl)}
      </div>
      <p style="color:#999;font-size:13px;">Este link expira em 1 hora. Se você não solicitou, ignore este email.</p>
    `),
  };
}

// ── 5. Payment Reminder ───────────────────────────────

export function paymentReminderEmail(params: {
  customerName: string;
  value: number;
  dueDate: string;
  paymentUrl?: string;
}): { subject: string; html: string } {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value);

  return {
    subject: `Lembrete de pagamento — vence em ${params.dueDate}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Lembrete de pagamento</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá <strong>${params.customerName}</strong>, sua mensalidade de <strong>${formatted}</strong>
        vence em <strong>${params.dueDate}</strong>.
      </p>
      ${params.paymentUrl ? `<div style="text-align:center;">${button('Pagar Agora', params.paymentUrl)}</div>` : ''}
      <p style="color:#999;font-size:13px;">Se já efetuou o pagamento, desconsidere este aviso.</p>
    `),
  };
}

// ── 6. Trial Class ────────────────────────────────────

export function trialClassEmail(params: {
  studentName: string;
  academyName: string;
  modality: string;
  dateTime: string;
  address: string;
}): { subject: string; html: string } {
  return {
    subject: `Aula experimental confirmada — ${params.academyName}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.black};">Aula experimental confirmada!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;">
        Olá <strong>${params.studentName}</strong>, sua aula experimental está confirmada!
      </p>
      <table width="100%" style="margin:16px 0;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:8px 8px 0 0;font-size:14px;color:${BRAND.gray};">Academia</td>
          <td style="padding:12px 16px;background:${BRAND.lightGray};border-radius:8px 8px 0 0;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.academyName}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:14px;color:${BRAND.gray};">Modalidade</td>
          <td style="padding:12px 16px;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.modality}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:${BRAND.lightGray};font-size:14px;color:${BRAND.gray};">Data/Hora</td>
          <td style="padding:12px 16px;background:${BRAND.lightGray};font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.dateTime}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border-radius:0 0 8px 8px;font-size:14px;color:${BRAND.gray};">Endereço</td>
          <td style="padding:12px 16px;border-radius:0 0 8px 8px;font-size:14px;color:${BRAND.black};text-align:right;font-weight:600;">${params.address}</td>
        </tr>
      </table>
      <p style="color:${BRAND.gray};font-size:14px;line-height:1.6;">
        Dicas para sua primeira aula:
      </p>
      <ul style="color:${BRAND.gray};font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Use roupas confortáveis</li>
        <li>Chegue 15 minutos antes</li>
        <li>Traga uma garrafa de água</li>
      </ul>
    `),
  };
}
