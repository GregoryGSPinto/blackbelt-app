import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* read-only in some contexts */ }
        },
        remove(name: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value: '', ...options }); } catch { /* read-only in some contexts */ }
        },
      },
    }
  );

  // Verify authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== body.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let role = 'aluno_adulto'; // default
  let academyId: string | null = null;

  // Process invite code if provided
  if (body.inviteCode) {
    const { data: invite } = await supabase
      .from('invites')
      .select('*')
      .eq('code', body.inviteCode)
      .eq('status', 'active')
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Código de convite inválido ou expirado' }, { status: 400 });
    }

    role = invite.role || 'aluno_adulto';
    academyId = invite.academy_id;

    // Mark invite as used
    await supabase
      .from('invites')
      .update({ status: 'used', used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', invite.id);
  }

  // Create profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    user_id: user.id,
    email: body.email,
    display_name: body.name || body.email?.split('@')[0] || 'Usuário',
    role,
    academy_id: academyId,
    avatar_url: body.avatarUrl,
    status: 'active',
  }, { onConflict: 'user_id' });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Create membership if has academy
  if (academyId) {
    await supabase.from('memberships').upsert({
      profile_id: user.id,
      academy_id: academyId,
      role,
      status: 'active',
    }, { onConflict: 'profile_id,academy_id' });
  }

  return NextResponse.json({ role, academyId });
}
