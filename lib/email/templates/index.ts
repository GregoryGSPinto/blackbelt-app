import type { EmailTemplate } from '../send';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0e;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <span style="font-size:24px;font-weight:800;color:#dc2626;">BLACK</span><span style="font-size:24px;font-weight:800;color:#fafafa;">BELT</span>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">${content}</td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:#71717a;font-size:12px;margin:0;">BlackBelt — Gestão de Academias de Artes Marciais</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function welcomeTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Bem-vindo ao BlackBelt!</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.name || 'Aluno'}</strong>,
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Sua conta na academia <strong style="color:#fafafa;">${data.academy || ''}</strong> foi criada com sucesso.
      Acesse o app para ver suas turmas, horários e começar a treinar!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${data.login_url || '#'}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Acessar BlackBelt
        </a>
      </td></tr>
    </table>
    <p style="color:#71717a;font-size:12px;">Se você não solicitou esta conta, ignore este email.</p>
  `);
}

function paymentReminderTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Lembrete de Mensalidade</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.name || 'Aluno'}</strong>,
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Sua mensalidade de <strong style="color:#fafafa;">R$ ${data.amount || '0,00'}</strong>
      vence em <strong style="color:#eab308;">${data.days || 3} dias</strong> (${data.due_date || ''}).
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Evite atrasos e mantenha seu acesso à academia em dia.
    </p>
  `);
}

function paymentOverdueTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Mensalidade Atrasada</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.name || 'Aluno'}</strong>,
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Sua mensalidade de <strong style="color:#fafafa;">R$ ${data.amount || '0,00'}</strong>
      está <strong style="color:#dc2626;">atrasada há ${data.days || 0} dias</strong>.
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Regularize sua situação para continuar tendo acesso às aulas e conteúdos.
    </p>
  `);
}

function beltPromotionTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Parabéns pela Graduação!</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.name || 'Aluno'}</strong>,
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Você foi promovido de <strong style="color:#fafafa;">${data.from_belt || ''}</strong>
      para <strong style="color:#dc2626;">${data.belt || ''}</strong>!
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Continue treinando forte. Oss!
    </p>
  `);
}

function weeklySummaryTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Resumo Semanal</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.admin_name || 'Admin'}</strong>,
      aqui está o resumo da semana na <strong style="color:#fafafa;">${data.academy || ''}</strong>:
    </p>
    <table width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0;border:1px solid rgba(255,255,255,0.06);border-radius:8px;">
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <td style="color:#a1a1aa;font-size:13px;">Novos alunos</td>
        <td align="right" style="color:#fafafa;font-weight:600;font-size:13px;">${data.new_students || 0}</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <td style="color:#a1a1aa;font-size:13px;">Presença média</td>
        <td align="right" style="color:#fafafa;font-weight:600;font-size:13px;">${data.avg_attendance || 0}%</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <td style="color:#a1a1aa;font-size:13px;">Receita</td>
        <td align="right" style="color:#fafafa;font-weight:600;font-size:13px;">R$ ${data.revenue || '0'}</td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;font-size:13px;">Inadimplentes</td>
        <td align="right" style="color:#dc2626;font-weight:600;font-size:13px;">${data.overdue_count || 0}</td>
      </tr>
    </table>
  `);
}

function planAlertTemplate(data: Record<string, string | number>): string {
  return layout(`
    <h1 style="color:#fafafa;font-size:22px;margin:0 0 16px;">Alerta de Uso do Plano</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Olá <strong style="color:#fafafa;">${data.admin_name || 'Admin'}</strong>,
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      O recurso <strong style="color:#eab308;">${data.metric || ''}</strong> da sua academia
      está em <strong style="color:#dc2626;">${data.percentage || 0}%</strong> do limite do seu plano.
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">
      Considere fazer upgrade para evitar cobranças de excedente.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${data.upgrade_url || '#'}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Ver Planos
        </a>
      </td></tr>
    </table>
  `);
}

const TEMPLATE_MAP: Record<string, (data: Record<string, string | number>) => string> = {
  'welcome': welcomeTemplate,
  'payment-reminder': paymentReminderTemplate,
  'payment-overdue': paymentOverdueTemplate,
  'belt-promotion': beltPromotionTemplate,
  'weekly-summary': weeklySummaryTemplate,
  'plan-alert': planAlertTemplate,
};

export function getEmailHtml(template: EmailTemplate, data: Record<string, string | number>): string {
  const generator = TEMPLATE_MAP[template];
  if (!generator) throw new Error(`Unknown email template: ${template}`);
  return generator(data);
}
