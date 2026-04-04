import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const EMPTY_RESPONSE = { plan: null, subscription: null, usage: null };

export async function GET() {
  try {
    // ── Mock mode ──
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    if (isMock) {
      return NextResponse.json({
        plan: {
          id: 'plan-pro',
          tier: 'pro',
          name: 'Pro',
          price_monthly: 249,
          is_custom_price: false,
          max_alunos: 200,
          max_professores: 10,
          max_unidades: 2,
          max_storage_gb: 50,
          max_turmas: 9999,
          features: [
            'gestao_alunos', 'checkin', 'financeiro_basico', 'agenda',
            'notificacoes', 'biblioteca_videos', 'pedagogico', 'ia',
            'compete', 'api', 'franquia', 'whatsapp',
          ],
          trial_days: 7,
        },
        subscription: {
          id: 'sub-mock-1',
          academy_id: 'academy-1',
          tier_id: 'tier-3',
          status: 'discovery',
          trial_started_at: '2026-03-10T00:00:00Z',
          trial_ends_at: '2026-03-17T00:00:00Z',
          discovery_ends_at: '2026-06-08T00:00:00Z',
          plan_started_at: '2026-03-10T00:00:00Z',
          total_price: 249,
          billing_cycle: 'monthly',
        },
        usage: {
          id: 'usage-mock-1',
          academy_id: 'academy-1',
          plan: 'pro',
          students_active: 45,
          units: 1,
          classes: 5,
          usage_percent: 22,
        },
      });
    }

    // ── Auth: get current user via cookies ──
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(EMPTY_RESPONSE, { status: 401 });
    }

    // ── Resolve academy_id from profiles ──
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('academy_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (profileError || !profile?.academy_id) {
      console.warn('[api/academy/plan] Perfil sem academy_id:', profileError?.message);
      return NextResponse.json(EMPTY_RESPONSE);
    }

    const academyId = profile.academy_id;

    // ── Fetch subscription + plan (join) and usage in parallel ──
    const [subscriptionResult, usageResult] = await Promise.all([
      supabase
        .from('academy_subscriptions')
        .select(`
          id,
          academy_id,
          tier_id,
          paid_modules,
          additional_professors,
          additional_units,
          billing_cycle,
          package_id,
          total_price,
          status,
          trial_started_at,
          trial_ends_at,
          discovery_ends_at,
          plan_started_at,
          current_period_start,
          current_period_end,
          cancelled_at,
          cancellation_reason,
          plan_id,
          plan_name,
          price_cents,
          billing_type,
          asaas_subscription_id,
          asaas_customer_id,
          next_due_date,
          platform_plans (
            id,
            tier,
            name,
            price_monthly,
            is_custom_price,
            max_alunos,
            max_professores,
            max_unidades,
            max_storage_gb,
            max_turmas,
            overage_aluno,
            overage_professor,
            overage_unidade,
            overage_storage_gb,
            features,
            is_popular,
            is_active,
            trial_days,
            trial_tier,
            sort_order
          )
        `)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('academy_usage')
        .select('id, academy_id, plan, students_active, units, classes, usage_percent')
        .eq('academy_id', academyId)
        .limit(1)
        .maybeSingle(),
    ]);

    // ── Build response (never crash) ──
    const subscription = subscriptionResult.data ?? null;
    const plan = subscription?.platform_plans ?? null;
    const usageData = usageResult.data ?? null;

    // Separate the nested platform_plans from subscription
    const subscriptionClean = subscription
      ? (() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { platform_plans: _plans, ...rest } = subscription;
          return rest;
        })()
      : null;

    return NextResponse.json({
      plan,
      subscription: subscriptionClean,
      usage: usageData,
    });
  } catch (error) {
    console.error('[api/academy/plan] Erro inesperado:', error);
    return NextResponse.json(EMPTY_RESPONSE);
  }
}
