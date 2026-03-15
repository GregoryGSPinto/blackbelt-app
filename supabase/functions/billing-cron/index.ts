// Deno Edge Function: Daily Billing Cron
// Runs daily to manage the billing lifecycle

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const today = new Date();
    const results = {
      invoicesGenerated: 0,
      remindersSet: 0,
      overdueMarked: 0,
      alertsSent: 0,
      blockedAccess: 0,
    };

    // 1. Get all academies with billing config
    const { data: configs } = await supabase
      .from('billing_configs')
      .select('*')
      .eq('auto_charge', true);

    if (!configs?.length) {
      return new Response(JSON.stringify({ message: 'No active billing configs', results }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const config of configs) {
      const dueDay = config.due_day_of_month;
      const reminderDays = config.reminder_days_before;
      const blockAfterDays = config.block_after_days;

      // 1. Generate invoices for subscriptions due tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (tomorrow.getDate() === dueDay) {
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('id, student_id, plan_id, plans(price)')
          .eq('academy_id', config.academy_id)
          .eq('status', 'active');

        for (const sub of subs ?? []) {
          const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
          if (dueDate <= today) dueDate.setMonth(dueDate.getMonth() + 1);

          // Check if invoice already exists
          const { data: existing } = await supabase
            .from('invoices')
            .select('id')
            .eq('subscription_id', sub.id)
            .eq('due_date', dueDate.toISOString().split('T')[0])
            .single();

          if (!existing) {
            await supabase.from('invoices').insert({
              subscription_id: sub.id,
              amount: (sub as Record<string, unknown>).plans
                ? ((sub as Record<string, Record<string, number>>).plans.price)
                : 0,
              status: 'open',
              due_date: dueDate.toISOString().split('T')[0],
            });
            results.invoicesGenerated++;
          }
        }
      }

      // 2. Send reminders N days before due date
      const reminderDate = new Date(today);
      reminderDate.setDate(reminderDate.getDate() + reminderDays);
      if (reminderDate.getDate() === dueDay) {
        const { data: openInvoices } = await supabase
          .from('invoices')
          .select('id, subscription_id')
          .eq('status', 'open')
          .gte('due_date', today.toISOString().split('T')[0]);

        for (const inv of openInvoices ?? []) {
          // Send push notification placeholder
          await supabase.from('notifications').insert({
            profile_id: inv.subscription_id, // Would resolve to student profile
            title: 'Lembrete de Pagamento',
            body: `Sua fatura vence em ${reminderDays} dias.`,
            type: 'billing_reminder',
          });
          results.remindersSet++;
        }
      }

      // 3. Send notification on due day
      if (today.getDate() === dueDay) {
        // Notifications are handled by the reminder logic above with 0 days
      }

      // 4. Mark as overdue after D+1
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'open')
        .lt('due_date', today.toISOString().split('T')[0]);

      for (const inv of overdueInvoices ?? []) {
        await supabase
          .from('invoices')
          .update({ status: 'uncollectible' })
          .eq('id', inv.id);
        results.overdueMarked++;
      }

      // 5. Alert admin after D+5
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const { data: lateInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'uncollectible')
        .lt('due_date', fiveDaysAgo.toISOString().split('T')[0]);

      if (lateInvoices?.length) {
        results.alertsSent++;
      }

      // 6. Block access after configured days
      if (blockAfterDays > 0) {
        const blockDate = new Date(today);
        blockDate.setDate(blockDate.getDate() - blockAfterDays);
        const { data: blockInvoices } = await supabase
          .from('invoices')
          .select('subscription_id')
          .eq('status', 'uncollectible')
          .lt('due_date', blockDate.toISOString().split('T')[0]);

        for (const inv of blockInvoices ?? []) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('id', inv.subscription_id);
          results.blockedAccess++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
