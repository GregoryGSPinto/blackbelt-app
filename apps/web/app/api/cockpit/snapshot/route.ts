import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminClient } from '@/lib/supabase/admin';

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ── Auth check ───────────────────────────────────────────────────────────────

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Option 1: internal token
  const internalToken = process.env.INTERNAL_API_TOKEN;
  const headerToken = req.headers.get('x-internal-token');
  if (internalToken && headerToken && headerToken === internalToken) {
    return true;
  }

  // Option 2: super_admin via cookie auth
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'super_admin')
      .limit(1)
      .single();

    return !!membership;
  } catch {
    return false;
  }
}

// ── Safe count helper ────────────────────────────────────────────────────────

async function countRows(
  promise: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await promise;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 },
      );
    }

    // ── Mock mode ──
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    if (isMock) {
      const date = todayISO();
      const mockMetrics = {
        total_academies: 3,
        active_academies: 3,
        trial_academies: 0,
        total_users: 52,
        active_users_7d: 38,
        new_users_today: 2,
        checkins_today: 14,
        active_classes: 8,
        mrr: 891,
      };
      return NextResponse.json({ success: true, date, metrics: mockMetrics });
    }

    // ── Real mode — aggregate metrics via service-role client ──
    const admin = getAdminClient();
    const today = todayISO();
    const sevenDaysAgo = daysAgoISO(7);
    const todayStart = `${today}T00:00:00.000Z`;
    const todayEnd = `${today}T23:59:59.999Z`;

    // 1. Academies
    const totalAcademies = await countRows(
      admin.from('academies').select('*', { count: 'exact', head: true }),
    );
    const activeAcademies = await countRows(
      admin.from('academies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    );
    const trialAcademies = await countRows(
      admin.from('academies').select('*', { count: 'exact', head: true }).or('status.eq.trial,plan.eq.trial'),
    );

    // 2. Users
    const totalUsers = await countRows(
      admin.from('profiles').select('*', { count: 'exact', head: true }),
    );
    const activeUsers7d = await countRows(
      admin.from('attendance').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    );
    const newUsersToday = await countRows(
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart).lte('created_at', todayEnd),
    );

    // 3. Today's checkins
    const checkinsToday = await countRows(
      admin.from('attendance').select('*', { count: 'exact', head: true }).gte('created_at', todayStart).lte('created_at', todayEnd),
    );

    // 4. Active classes
    const activeClasses = await countRows(
      admin.from('classes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    );

    // 5. MRR (sum of active subscriptions)
    let mrr = 0;
    try {
      const { data: subRows, error: subErr } = await admin
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active');

      if (!subErr && subRows) {
        mrr = (subRows as Array<{ amount: number }>).reduce((sum, row) => {
          const val = Number(row.amount);
          return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
        mrr = Math.round(mrr * 100) / 100;
      }
    } catch {
      mrr = 0;
    }

    const metrics = {
      total_academies: totalAcademies,
      active_academies: activeAcademies,
      trial_academies: trialAcademies,
      total_users: totalUsers,
      active_users_7d: activeUsers7d,
      new_users_today: newUsersToday,
      checkins_today: checkinsToday,
      active_classes: activeClasses,
      mrr,
    };

    // 6. Upsert into daily_metrics
    try {
      const { error: upsertError } = await admin
        .from('daily_metrics')
        .upsert(
          {
            date: today,
            ...metrics,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'date' },
        );

      if (upsertError) {
        console.error('[cockpit/snapshot] Upsert daily_metrics failed:', upsertError.message);
      }
    } catch (upsertErr) {
      // Table may not exist yet — don't break the response
      console.error('[cockpit/snapshot] daily_metrics upsert error:', upsertErr);
    }

    return NextResponse.json({ success: true, date: today, metrics });
  } catch (err) {
    console.error('[cockpit/snapshot] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
