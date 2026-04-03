import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * CRON: Daily subscription billing ruler check
 * Schedule: 0 8 * * * (every day at 8 AM UTC = 5 AM BRT)
 *
 * For each academy_subscription with status NOT in (trial, cancelled, manual_free):
 *   - Compute days overdue from next_due_date or current_period_end
 *   - Transition status: active → grace → warning → suspended → blocked
 */

export async function GET(request: NextRequest) {
  // Verify Vercel CRON secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  let processed = 0;
  let transitioned = 0;

  // Fetch all subscriptions that are not in terminal/exempt states
  const { data: subscriptions, error } = await supabase
    .from('academy_subscriptions')
    .select('id, academy_id, status, next_due_date, current_period_end, trial_ends_at')
    .not('status', 'in', '(cancelled,manual_free)');

  if (error) {
    console.error('[subscription-check] Query error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const sub of subscriptions ?? []) {
    processed++;

    // Skip trial that hasn't expired yet
    if (sub.status === 'trial') {
      if (sub.trial_ends_at && new Date(sub.trial_ends_at) > now) continue;
      // Trial expired → move to grace
      await updateStatus(supabase, sub.id, sub.academy_id, 'grace');
      transitioned++;
      continue;
    }

    // Determine overdue date
    const dueDate = sub.next_due_date || sub.current_period_end;
    if (!dueDate) continue;

    const due = new Date(dueDate);
    const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

    // Not overdue → ensure active
    if (daysOverdue <= 0) {
      if (sub.status !== 'full' && sub.status !== 'active' && sub.status !== 'discovery') {
        await updateStatus(supabase, sub.id, sub.academy_id, 'full');
        transitioned++;
      }
      continue;
    }

    // Compute new status based on days overdue
    let newStatus: string;
    if (daysOverdue <= 3) {
      newStatus = 'grace';
    } else if (daysOverdue <= 5) {
      newStatus = 'warning';
    } else if (daysOverdue <= 15) {
      newStatus = 'suspended';
    } else {
      newStatus = 'blocked';
    }

    // Only update if status changed
    if (sub.status !== newStatus) {
      await updateStatus(supabase, sub.id, sub.academy_id, newStatus);
      transitioned++;
    }
  }

  return NextResponse.json({
    processed,
    transitioned,
    timestamp: now.toISOString(),
  });
}

async function updateStatus(
  supabase: SupabaseClient,
  subscriptionId: string,
  academyId: string,
  newStatus: string,
) {
  const academyStatus = newStatus === 'full' ? 'active' : newStatus;

  await Promise.all([
    supabase
      .from('academy_subscriptions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId),
    supabase
      .from('academies')
      .update({ status: academyStatus, updated_at: new Date().toISOString() })
      .eq('id', academyId),
  ]);
}
