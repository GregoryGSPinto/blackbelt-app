import type { SupportedLocale } from '@/lib/types/regional';

/** Centralized email strings per locale */
const EMAIL_STRINGS: Record<SupportedLocale, {
  appName: string;
  tagline: string;
  unsubscribe: string;
  accessApp: string;
  welcome: { subject: string; greeting: (name: string) => string; body: (academy: string) => string; features: string[]; signoff: string };
  invoice: { subject: string; greeting: (name: string) => string; body: (amount: string, dueDate: string) => string; cta: string };
  classReminder: { subject: string; greeting: (name: string) => string; body: (modality: string, time: string) => string; cta: string };
  achievement: { subject: string; greeting: (name: string) => string; unlocked: string; keepGoing: string; cta: string };
  monthlyReport: { subject: string; greeting: (name: string) => string; intro: (student: string, month: string) => string; attendance: string; evaluation: string; cta: string };
}> = {
  'pt-BR': {
    appName: 'BlackBelt',
    tagline: 'Gestão de Artes Marciais',
    unsubscribe: 'Cancelar inscrição',
    accessApp: 'Acessar o App',
    welcome: {
      subject: 'Bem-vindo ao BlackBelt!',
      greeting: (name) => `Olá <strong>${name}</strong>,`,
      body: (academy) => `Bem-vindo(a) ao <strong>${academy}</strong>! Sua jornada nas artes marciais começa agora.`,
      features: ['Acompanhar suas presenças e evolução', 'Assistir vídeos de técnicas', 'Receber avaliações do seu professor', 'Conquistar badges e faixas'],
      signoff: 'Bons treinos!',
    },
    invoice: {
      subject: 'Nova fatura disponível',
      greeting: (name) => `Olá <strong>${name}</strong>,`,
      body: (amount, dueDate) => `Sua fatura de <strong>R$ ${amount}</strong> vence em <strong>${dueDate}</strong>.`,
      cta: 'Pagar Fatura',
    },
    classReminder: {
      subject: 'Lembrete de aula',
      greeting: (name) => `Olá <strong>${name}</strong>,`,
      body: (modality, time) => `Lembrete: sua aula de <strong>${modality}</strong> começa às <strong>${time}</strong>.`,
      cta: 'Ver Meus Horários',
    },
    achievement: {
      subject: 'Nova conquista desbloqueada!',
      greeting: (name) => `Parabéns <strong>${name}</strong>!`,
      unlocked: 'Você desbloqueou uma nova conquista:',
      keepGoing: 'Continue treinando para desbloquear mais conquistas!',
      cta: 'Ver Minhas Conquistas',
    },
    monthlyReport: {
      subject: 'Relatório mensal',
      greeting: (name) => `Olá <strong>${name}</strong>,`,
      intro: (student, month) => `Segue o relatório mensal de <strong>${student}</strong> referente a <strong>${month}</strong>:`,
      attendance: 'Presenças',
      evaluation: 'Avaliação Geral',
      cta: 'Ver Detalhes',
    },
  },
  'en-US': {
    appName: 'BlackBelt',
    tagline: 'Martial Arts Management',
    unsubscribe: 'Unsubscribe',
    accessApp: 'Open App',
    welcome: {
      subject: 'Welcome to BlackBelt!',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (academy) => `Welcome to <strong>${academy}</strong>! Your martial arts journey starts now.`,
      features: ['Track your attendance and progress', 'Watch technique videos', 'Receive evaluations from your instructor', 'Earn badges and belt promotions'],
      signoff: 'Train hard!',
    },
    invoice: {
      subject: 'New invoice available',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (amount, dueDate) => `Your invoice of <strong>$${amount}</strong> is due on <strong>${dueDate}</strong>.`,
      cta: 'Pay Invoice',
    },
    classReminder: {
      subject: 'Class reminder',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (modality, time) => `Reminder: your <strong>${modality}</strong> class starts at <strong>${time}</strong>.`,
      cta: 'View My Schedule',
    },
    achievement: {
      subject: 'New achievement unlocked!',
      greeting: (name) => `Congratulations <strong>${name}</strong>!`,
      unlocked: 'You unlocked a new achievement:',
      keepGoing: 'Keep training to unlock more achievements!',
      cta: 'View My Achievements',
    },
    monthlyReport: {
      subject: 'Monthly report',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      intro: (student, month) => `Here is the monthly report for <strong>${student}</strong> for <strong>${month}</strong>:`,
      attendance: 'Attendance',
      evaluation: 'Overall Evaluation',
      cta: 'View Details',
    },
  },
  'es': {
    appName: 'BlackBelt',
    tagline: 'Gestión de Artes Marciales',
    unsubscribe: 'Cancelar suscripción',
    accessApp: 'Abrir App',
    welcome: {
      subject: '¡Bienvenido a BlackBelt!',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (academy) => `¡Bienvenido(a) a <strong>${academy}</strong>! Tu viaje en las artes marciales comienza ahora.`,
      features: ['Seguir tu asistencia y evolución', 'Ver videos de técnicas', 'Recibir evaluaciones de tu profesor', 'Ganar insignias y cinturones'],
      signoff: '¡Buenos entrenamientos!',
    },
    invoice: {
      subject: 'Nueva factura disponible',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (amount, dueDate) => `Tu factura de <strong>€${amount}</strong> vence el <strong>${dueDate}</strong>.`,
      cta: 'Pagar Factura',
    },
    classReminder: {
      subject: 'Recordatorio de clase',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (modality, time) => `Recordatorio: tu clase de <strong>${modality}</strong> comienza a las <strong>${time}</strong>.`,
      cta: 'Ver Mis Horarios',
    },
    achievement: {
      subject: '¡Nuevo logro desbloqueado!',
      greeting: (name) => `¡Felicidades <strong>${name}</strong>!`,
      unlocked: 'Has desbloqueado un nuevo logro:',
      keepGoing: '¡Sigue entrenando para desbloquear más logros!',
      cta: 'Ver Mis Logros',
    },
    monthlyReport: {
      subject: 'Informe mensual',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      intro: (student, month) => `Aquí está el informe mensual de <strong>${student}</strong> para <strong>${month}</strong>:`,
      attendance: 'Asistencia',
      evaluation: 'Evaluación General',
      cta: 'Ver Detalles',
    },
  },
};

export function getEmailStrings(locale: SupportedLocale) {
  return EMAIL_STRINGS[locale] ?? EMAIL_STRINGS['pt-BR'];
}

/** i18n-aware email layout */
export function emailLayoutI18n(content: string, locale: SupportedLocale, ctaUrl?: string, ctaText?: string): string {
  const s = getEmailStrings(locale);
  const lang = locale === 'es' ? 'es' : locale;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#C62828;padding:24px;text-align:center}
.header h1{color:#fff;margin:0;font-size:24px}
.body{padding:32px 24px}
.body p{color:#333;line-height:1.6;margin:0 0 16px}
.cta{display:inline-block;background:#C62828;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;margin:16px 0}
.footer{padding:24px;text-align:center;background:#f5f5f5;font-size:12px;color:#999}
.footer a{color:#999}
</style></head>
<body><div class="container">
<div class="header"><h1>${s.appName}</h1></div>
<div class="body">${content}${ctaUrl ? `<p style="text-align:center"><a href="${ctaUrl}" class="cta">${ctaText ?? s.accessApp}</a></p>` : ''}</div>
<div class="footer">
<p>${s.appName} — ${s.tagline}</p>
<p><a href="{{unsubscribeUrl}}">${s.unsubscribe}</a></p>
</div>
</div></body></html>`;
}
