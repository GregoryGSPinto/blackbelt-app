import { isMock } from '@/lib/env';
import type { TrialStudent, TrialConfig } from '@/lib/api/trial.service';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type TrialNotificationType =
  | 'welcome'
  | 'day3_reminder'
  | 'day5_reminder'
  | 'expiry_warning'
  | 'post_expiry_offer';

export interface TrialNotificationResult {
  type: TrialNotificationType;
  studentId: string;
  studentName: string;
  phone: string;
  sent: boolean;
  error?: string;
}

export interface TrialNotificationSummary {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  results: TrialNotificationResult[];
}

// ────────────────────────────────────────────────────────────
// Message templates
// ────────────────────────────────────────────────────────────

function getNotificationMessage(
  student: TrialStudent,
  type: TrialNotificationType,
  config?: TrialConfig,
): string {
  const firstName = student.name.split(' ')[0];

  switch (type) {
    case 'welcome':
      return (
        config?.welcome_message?.replace('{nome}', firstName) ??
        `Olá ${firstName}! 👋 Bem-vindo(a) à nossa academia! Seu período experimental de 7 dias começou. Aproveite todas as modalidades! Qualquer dúvida, estamos aqui. 🥋`
      );
    case 'day3_reminder':
      return `Oi ${firstName}! 😊 Já faz 3 dias do seu período experimental. Como está sendo a experiência? Tem alguma dúvida sobre as aulas ou horários? Estamos aqui pra te ajudar! 💪`;
    case 'day5_reminder':
      return `Ei ${firstName}! 🥋 Seu período experimental está quase acabando! Já aproveitou todas as modalidades? Se precisar de ajuda pra escolher um plano, é só falar. Queremos te ver por aqui! 🔥`;
    case 'expiry_warning':
      return (
        config?.expiry_warning_message?.replace('{nome}', firstName) ??
        `${firstName}, seu período experimental termina amanhã! 😢 Foi ótimo ter você conosco. Que tal continuar essa jornada? Fale conosco sobre nossos planos! 🥋✨`
      );
    case 'post_expiry_offer': {
      const discount = config?.conversion_discount_percent ?? 10;
      return `${firstName}, temos uma oferta especial pra você! 🎉 Como participou do período experimental, garantimos ${discount}% de desconto na sua matrícula. Essa oferta é por tempo limitado! Vem treinar com a gente! 💪🥋`;
    }
  }
}

// ────────────────────────────────────────────────────────────
// Day calculation helpers
// ────────────────────────────────────────────────────────────

function daysSinceStart(student: TrialStudent): number {
  const start = new Date(student.trial_start_date);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntilEnd(student: TrialStudent): number {
  const end = new Date(student.trial_end_date);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSinceEnd(student: TrialStudent): number {
  const end = new Date(student.trial_end_date);
  const now = new Date();
  return Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
}

// ────────────────────────────────────────────────────────────
// Determine which notification a student should receive
// ────────────────────────────────────────────────────────────

function getNotificationTypeForStudent(
  student: TrialStudent,
  config: TrialConfig,
): TrialNotificationType | null {
  const status = student.status;

  if (status === 'active') {
    const sinceStart = daysSinceStart(student);
    const untilEnd = daysUntilEnd(student);

    // Day 0 welcome
    if (sinceStart === 0 && config.send_welcome_whatsapp) {
      return 'welcome';
    }
    // Day 3 reminder
    if (sinceStart === 3 && config.send_day3_reminder) {
      return 'day3_reminder';
    }
    // Day 5 reminder
    if (sinceStart === 5 && config.send_day5_reminder) {
      return 'day5_reminder';
    }
    // Expiry warning (1 day before end)
    if (untilEnd === 1 && config.send_expiry_notification) {
      return 'expiry_warning';
    }
  }

  // Post-expiry offer (1 day after expired)
  if (status === 'expired') {
    const sincEnd = daysSinceEnd(student);
    if (sincEnd === 1 && config.send_post_expiry_offer) {
      return 'post_expiry_offer';
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// Process notifications for an academy
// ────────────────────────────────────────────────────────────

export async function processTrialNotifications(
  academyId: string,
): Promise<TrialNotificationSummary> {
  const summary: TrialNotificationSummary = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    results: [],
  };

  try {
    if (isMock()) {
      const { mockProcessTrialNotifications } = await import(
        '@/lib/mocks/trial-notifications.mock'
      );
      return mockProcessTrialNotifications(academyId);
    }

    const { getAdminClient } = await import('@/lib/supabase/admin');
    const supabase = getAdminClient();

    // Load config
    const { data: configRow } = await supabase
      .from('trial_config')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (!configRow) return summary;
    const config = configRow as TrialConfig;

    // Load active + recently expired trial students
    const { data: students } = await supabase
      .from('trial_students')
      .select('*')
      .eq('academy_id', academyId)
      .in('status', ['active', 'expired']);

    if (!students || students.length === 0) return summary;

    // Load already-sent notifications for today (to avoid duplicates)
    const today = new Date().toISOString().slice(0, 10);
    const { data: sentToday } = await supabase
      .from('trial_activity_log')
      .select('trial_student_id, activity_type')
      .eq('academy_id', academyId)
      .in('activity_type', [
        'follow_up_whatsapp',
      ])
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    const sentTodaySet = new Set(
      (sentToday ?? []).map((s) => s.trial_student_id),
    );

    for (const row of students) {
      const student = row as TrialStudent;
      summary.processed++;

      // Skip if already notified today
      if (sentTodaySet.has(student.id)) {
        summary.skipped++;
        continue;
      }

      const notifType = getNotificationTypeForStudent(student, config);
      if (!notifType) {
        summary.skipped++;
        continue;
      }

      // Send WhatsApp via the whatsapp_messages queue
      const message = getNotificationMessage(student, notifType, config);
      const phone = student.phone.replace(/\D/g, '');

      try {
        await supabase.from('whatsapp_messages').insert({
          academy_id: academyId,
          to_phone: phone,
          to_name: student.name,
          template_slug: `trial_${notifType}`,
          variables: { message },
          status: 'queued',
        });

        // Log activity
        await supabase.from('trial_activity_log').insert({
          trial_student_id: student.id,
          academy_id: academyId,
          activity_type: 'follow_up_whatsapp',
          details: { notification_type: notifType, message },
        });

        summary.sent++;
        summary.results.push({
          type: notifType,
          studentId: student.id,
          studentName: student.name,
          phone,
          sent: true,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        summary.failed++;
        summary.results.push({
          type: notifType,
          studentId: student.id,
          studentName: student.name,
          phone,
          sent: false,
          error: errorMsg,
        });
      }
    }
  } catch (err) {
    logServiceError(err, 'trial-notifications');
  }

  return summary;
}

// ────────────────────────────────────────────────────────────
// Process all academies (for cron job)
// ────────────────────────────────────────────────────────────

export async function processAllAcademyTrialNotifications(): Promise<{
  academies: number;
  totalSent: number;
  totalFailed: number;
}> {
  if (isMock()) {
    return { academies: 1, totalSent: 3, totalFailed: 0 };
  }

  const { getAdminClient } = await import('@/lib/supabase/admin');
  const supabase = getAdminClient();

  // Get all academies with trial config
  const { data: configs } = await supabase
    .from('trial_config')
    .select('academy_id');

  if (!configs || configs.length === 0) {
    return { academies: 0, totalSent: 0, totalFailed: 0 };
  }

  let totalSent = 0;
  let totalFailed = 0;

  for (const row of configs) {
    const result = await processTrialNotifications(row.academy_id);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return {
    academies: configs.length,
    totalSent,
    totalFailed,
  };
}
