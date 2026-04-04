import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

/**
 * CRON: Daily automated emails
 * Schedule: 0 12 * * * (every day at 12:00 UTC = 9:00 BRT)
 *
 * Handles:
 * 1. Payment reminders (3 days before due date)
 * 2. Overdue payment alerts (1 day after due date)
 * 3. Inactive student reminders (14+ days without check-in, Mondays only)
 * 4. Birthday greetings
 */

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  const results = {
    paymentReminders: 0,
    overdueAlerts: 0,
    inactiveReminders: 0,
    birthdayGreetings: 0,
    errors: 0,
  };

  // 1. Payment reminders — due in 3 days
  try {
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const dueDate = threeDaysFromNow.toISOString().split('T')[0];

    const { data: upcoming } = await supabase
      .from('student_payments')
      .select('id, amount_cents, due_date, student_profile_id, academy_id')
      .eq('status', 'PENDING')
      .eq('due_date', dueDate);

    for (const payment of upcoming ?? []) {
      const student = await getStudentEmail(supabase, payment.student_profile_id);
      const academy = await getAcademyName(supabase, payment.academy_id);
      if (!student?.email) continue;

      await sendEmail({
        to: student.email,
        subject: `Lembrete: sua mensalidade vence em 3 dias — ${academy}`,
        html: paymentReminderHtml(student.name, payment.amount_cents, payment.due_date, academy),
      });
      results.paymentReminders++;
    }
  } catch {
    results.errors++;
  }

  // 2. Overdue alerts — overdue by 1 day
  try {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueDate = yesterday.toISOString().split('T')[0];

    const { data: overdue } = await supabase
      .from('student_payments')
      .select('id, amount_cents, due_date, student_profile_id, academy_id')
      .eq('status', 'PENDING')
      .eq('due_date', overdueDate);

    for (const payment of overdue ?? []) {
      // Update status to OVERDUE
      await supabase
        .from('student_payments')
        .update({ status: 'OVERDUE' })
        .eq('id', payment.id);

      const student = await getStudentEmail(supabase, payment.student_profile_id);
      const academy = await getAcademyName(supabase, payment.academy_id);
      if (!student?.email) continue;

      await sendEmail({
        to: student.email,
        subject: `Mensalidade vencida — ${academy}`,
        html: paymentOverdueHtml(student.name, payment.amount_cents, payment.due_date, academy),
      });
      results.overdueAlerts++;
    }
  } catch {
    results.errors++;
  }

  // 3. Inactive students — only on Mondays (weekly)
  if (now.getDay() === 1) {
    try {
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Get all active students
      const { data: activeStudents } = await supabase
        .from('memberships')
        .select('id, profile_id, academy_id')
        .eq('status', 'active');

      const profileIds = (activeStudents ?? []).map((s) => s.profile_id);
      if (profileIds.length > 0) {
        // Get check-ins in last 14 days
        const { data: recentCheckins } = await supabase
          .from('attendance')
          .select('student_id')
          .gte('checked_at', fourteenDaysAgo.toISOString());

        const activeCheckinIds = new Set((recentCheckins ?? []).map((c) => c.student_id));

        for (const membership of activeStudents ?? []) {
          if (activeCheckinIds.has(membership.profile_id)) continue;

          const student = await getStudentEmail(supabase, membership.profile_id);
          const academy = await getAcademyName(supabase, membership.academy_id);
          if (!student?.email) continue;

          await sendEmail({
            to: student.email,
            subject: `Sentimos sua falta! — ${academy}`,
            html: inactiveStudentHtml(student.name, academy),
          });
          results.inactiveReminders++;
        }
      }
    } catch {
      results.errors++;
    }
  }

  // 4. Birthday greetings
  try {
    const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { data: birthdayProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, email, academy_id, birth_date')
      .not('birth_date', 'is', null)
      .eq('is_active', true);

    for (const profile of birthdayProfiles ?? []) {
      if (!profile.birth_date || !profile.email) continue;
      const bday = profile.birth_date.slice(5); // "MM-DD"
      if (bday !== todayMMDD) continue;

      const academy = await getAcademyName(supabase, profile.academy_id);

      await sendEmail({
        to: profile.email,
        subject: `Feliz aniversario, ${profile.display_name}! 🎉`,
        html: birthdayHtml(profile.display_name, academy),
      });
      results.birthdayGreetings++;
    }
  } catch {
    results.errors++;
  }

  return NextResponse.json({
    ...results,
    timestamp: now.toISOString(),
  });
}

// ── Helpers ──────────────────────────────────────────────────

async function getStudentEmail(supabase: SupabaseClient, profileId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', profileId)
    .maybeSingle();
  return data ? { name: data.display_name, email: data.email } : null;
}

async function getAcademyName(supabase: SupabaseClient, academyId: string) {
  const { data } = await supabase
    .from('academies')
    .select('name')
    .eq('id', academyId)
    .maybeSingle();
  return data?.name ?? 'BlackBelt';
}

function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR');
}

// ── Email HTML Templates (inline, simple) ────────────────────

function paymentReminderHtml(name: string, amountCents: number, dueDate: string, academy: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#1a1a2e;">Lembrete de pagamento</h2>
      <p>Ola, <strong>${name}</strong>!</p>
      <p>Sua mensalidade de <strong>${formatBRL(amountCents)}</strong> na <strong>${academy}</strong> vence em <strong>${formatDate(dueDate)}</strong>.</p>
      <p>Regularize para manter seu acesso ao sistema.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">BlackBelt App — ${academy}</p>
    </div>
  `;
}

function paymentOverdueHtml(name: string, amountCents: number, dueDate: string, academy: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#EF4444;">Mensalidade vencida</h2>
      <p>Ola, <strong>${name}</strong>!</p>
      <p>Sua mensalidade de <strong>${formatBRL(amountCents)}</strong> na <strong>${academy}</strong> venceu em <strong>${formatDate(dueDate)}</strong>.</p>
      <p>Regularize para manter o acesso a todas as funcionalidades.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">BlackBelt App — ${academy}</p>
    </div>
  `;
}

function inactiveStudentHtml(name: string, academy: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#1a1a2e;">Sentimos sua falta!</h2>
      <p>Ola, <strong>${name}</strong>!</p>
      <p>Faz mais de 14 dias que voce nao aparece na <strong>${academy}</strong>.</p>
      <p>Volte pra treinar! Sua evolucao depende da consistencia.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">BlackBelt App — ${academy}</p>
    </div>
  `;
}

function birthdayHtml(name: string, academy: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#1a1a2e;">Feliz aniversario! 🎉</h2>
      <p>Ola, <strong>${name}</strong>!</p>
      <p>A equipe da <strong>${academy}</strong> deseja um feliz aniversario!</p>
      <p>Passe na academia para comemorar com a gente.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">BlackBelt App — ${academy}</p>
    </div>
  `;
}
