import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const inviteToken = searchParams.get('invite_token');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin));
  }

  const response = NextResponse.redirect(new URL('/', origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Exchange code for session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[OAuth callback] Exchange error:', exchangeError.message);
    return NextResponse.redirect(new URL('/login?error=exchange_failed', origin));
  }

  // If invite token present, redirect to invite cadastro page
  if (inviteToken) {
    const inviteUrl = new URL(`/cadastro/${encodeURIComponent(inviteToken)}`, origin);
    inviteUrl.searchParams.set('from', 'oauth');
    return NextResponse.redirect(inviteUrl);
  }

  // Get user to look up profile
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=no_user', origin));
  }

  // Look up profile to determine role redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // No profile = first-time OAuth user → complete signup
  if (!profile) {
    return NextResponse.redirect(new URL('/completar-cadastro', origin));
  }

  // Redirect by role
  const roleRoutes: Record<string, string> = {
    super_admin: '/superadmin',
    admin: '/admin',
    professor: '/professor',
    recepcionista: '/recepcao',
    aluno_adulto: '/aluno',
    aluno_teen: '/teen',
    aluno_kids: '/kids',
    responsavel: '/responsavel',
    franqueador: '/franqueador',
  };

  const destination = roleRoutes[profile.role] || '/selecionar-perfil';
  return NextResponse.redirect(new URL(destination, origin));
}
