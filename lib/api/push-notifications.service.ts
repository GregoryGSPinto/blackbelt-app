import { isMock } from '@/lib/env';

export const NOTIFICATION_TEMPLATES = {
  class_reminder: {
    title: 'Aula em {{minutes}} minutos!',
    body: '{{modality}} com {{professor}} as {{time}}. Nao esqueca seu kimono!',
    icon: 'calendar',
  },
  checkin_confirmed: {
    title: 'Check-in confirmado!',
    body: 'Presenca registrada na aula de {{modality}}. Bom treino!',
    icon: 'check',
  },
  belt_promotion: {
    title: 'Parabens pela graduacao!',
    body: 'Voce foi promovido(a) para {{belt}}. Continue evoluindo!',
    icon: 'award',
  },
  payment_due: {
    title: 'Mensalidade proxima do vencimento',
    body: 'Sua mensalidade de R${{value}} vence em {{days}} dias.',
    icon: 'dollar',
  },
  trial_reminder: {
    title: 'Faltam {{days}} dias do seu trial!',
    body: 'Aproveite para conhecer todas as modalidades. {{academy}} te espera!',
    icon: 'clock',
  },
  new_enrollment: {
    title: 'Novo aluno matriculado!',
    body: '{{student_name}} se matriculou em {{modality}}.',
    icon: 'user-plus',
  },
  contract_signed: {
    title: 'Contrato assinado!',
    body: '{{student_name}} assinou o contrato do plano {{plan}}.',
    icon: 'file-text',
  },
  health_alert: {
    title: 'Alerta de saude',
    body: 'Atestado de {{student_name}} vence em {{days}} dias.',
    icon: 'shield',
  },
  feedback_received: {
    title: 'Novo feedback recebido',
    body: '{{student_name}} enviou um feedback — nota {{rating}}/5.',
    icon: 'message',
  },
} as const;

export type NotificationTemplate = keyof typeof NOTIFICATION_TEMPLATES;

export async function sendPushNotification(
  profileId: string,
  template: NotificationTemplate,
  variables: Record<string, string>,
  _academyId?: string,
): Promise<boolean> {
  if (isMock()) {
    console.log(`[MOCK] Push: ${template} -> ${profileId}`, variables);
    return true;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const tmpl = NOTIFICATION_TEMPLATES[template];
    let title: string = tmpl.title;
    let body: string = tmpl.body;
    Object.entries(variables).forEach(([k, v]) => {
      title = title.replace(`{{${k}}}`, v);
      body = body.replace(`{{${k}}}`, v);
    });
    // notifications table uses user_id (auth.users FK), but we have profile_id
    // For now, store in notifications with profile_id as user_id
    const { error } = await supabase.from('notifications').insert({
      user_id: profileId,
      type: template,
      title,
      body,
    });
    if (error) {
      console.error('[sendPushNotification]', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function registerDeviceToken(
  profileId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
): Promise<boolean> {
  if (isMock()) return true;
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('device_tokens').upsert(
      {
        profile_id: profileId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,platform' },
    );
    if (error) {
      console.error('[registerDeviceToken]', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>,
): { title: string; body: string } {
  const tmpl = NOTIFICATION_TEMPLATES[template];
  let title: string = tmpl.title;
  let body: string = tmpl.body;
  Object.entries(variables).forEach(([k, v]) => {
    title = title.replace(`{{${k}}}`, v);
    body = body.replace(`{{${k}}}`, v);
  });
  return { title, body };
}
