// BlackBelt v2 — Edge Function: Generate Monthly Invoices
// Cron: generates invoices for all active subscriptions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // Use service role key for cron jobs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { academy_id } = await req.json();

    // Get all active subscriptions for the academy
    let query = supabase
      .from('subscriptions')
      .select('id, student_id, plan_id, plans(price)')
      .eq('status', 'active');

    if (academy_id) {
      query = query.eq('plans.academy_id', academy_id);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { status: 500 });
    }

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    // Check which subscriptions already have an invoice for this period
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('subscription_id')
      .gte('due_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
      .lte('due_date', new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));

    const existingSubIds = new Set((existingInvoices ?? []).map((i: { subscription_id: string }) => i.subscription_id));

    const newInvoices = (subscriptions ?? [])
      .filter((sub) => !existingSubIds.has(sub.id))
      .map((sub) => ({
        subscription_id: sub.id,
        amount: (sub as Record<string, unknown>).plans ? ((sub as Record<string, unknown>).plans as { price: number }).price : 0,
        status: 'open',
        due_date: dueDateStr,
      }));

    if (newInvoices.length === 0) {
      return new Response(JSON.stringify({ message: 'No new invoices to generate', count: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: created, error: insertError } = await supabase
      .from('invoices')
      .insert(newInvoices)
      .select();

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to generate invoices' }), { status: 500 });
    }

    // Mark past-due subscriptions
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 30);

    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('status', 'active')
      .lt('current_period_end', overdueDate.toISOString());

    return new Response(JSON.stringify({
      success: true,
      count: created?.length ?? 0,
      due_date: dueDateStr,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-invoices error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
