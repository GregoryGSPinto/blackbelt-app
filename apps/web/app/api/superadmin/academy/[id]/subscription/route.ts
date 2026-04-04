import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type Action = 'extend_trial' | 'activate' | 'suspend' | 'unblock';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: academyId } = await params;

  // Create Supabase server client
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Verify caller is superadmin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['super_admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
  }

  // Parse body
  const body = await request.json() as { action: Action; days?: number };
  const { action, days } = body;

  if (!action) {
    return NextResponse.json({ error: 'Acao obrigatoria' }, { status: 400 });
  }

  const validActions: Action[] = ['extend_trial', 'activate', 'suspend', 'unblock'];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: `Acao invalida: ${action}` }, { status: 400 });
  }

  try {
    switch (action) {
      case 'extend_trial': {
        const extendDays = days ?? 7;
        const { data: sub } = await supabase
          .from('academy_subscriptions')
          .select('trial_ends_at')
          .eq('academy_id', academyId)
          .maybeSingle();

        const currentEnd = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : new Date();
        const baseDate = currentEnd > new Date() ? currentEnd : new Date();
        const newEnd = new Date(baseDate);
        newEnd.setDate(newEnd.getDate() + extendDays);

        await supabase
          .from('academy_subscriptions')
          .update({
            trial_ends_at: newEnd.toISOString(),
            status: 'trial',
            updated_at: new Date().toISOString(),
          })
          .eq('academy_id', academyId);

        await supabase
          .from('academies')
          .update({
            status: 'trial',
            trial_ends_at: newEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', academyId);

        return NextResponse.json({
          success: true,
          action,
          trial_ends_at: newEnd.toISOString(),
          message: `Trial estendido em ${extendDays} dias`,
        });
      }

      case 'activate': {
        await supabase
          .from('academy_subscriptions')
          .update({ status: 'full', updated_at: new Date().toISOString() })
          .eq('academy_id', academyId);

        await supabase
          .from('academies')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', academyId);

        return NextResponse.json({ success: true, action, message: 'Plano ativado' });
      }

      case 'suspend': {
        await supabase
          .from('academy_subscriptions')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('academy_id', academyId);

        await supabase
          .from('academies')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', academyId);

        return NextResponse.json({ success: true, action, message: 'Academia suspensa' });
      }

      case 'unblock': {
        await supabase
          .from('academy_subscriptions')
          .update({ status: 'full', updated_at: new Date().toISOString() })
          .eq('academy_id', academyId);

        await supabase
          .from('academies')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', academyId);

        return NextResponse.json({ success: true, action, message: 'Bloqueio removido' });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
