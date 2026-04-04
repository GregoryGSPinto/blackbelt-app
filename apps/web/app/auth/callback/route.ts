import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const inviteToken = searchParams.get('invite_token');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin));
  }

  // Create a single response object — ALL cookies (Supabase session + app)
  // must be set on this same object. Creating a new NextResponse.redirect()
  // loses them, which breaks auth after OAuth.
  let destination = new URL('/', origin);
  const response = NextResponse.redirect(destination);

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

  // Exchange code for session (sets auth cookies on `response`)
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[OAuth callback] Exchange error:', exchangeError.message);
    destination = new URL('/login?error=exchange_failed', origin);
    response.headers.set('Location', destination.toString());
    return response;
  }

  // Password recovery → redirect to reset form instead of dashboard
  const type = searchParams.get('type');
  if (type === 'recovery') {
    destination = new URL('/redefinir-senha', origin);
    response.headers.set('Location', destination.toString());
    return response;
  }

  // If invite token present, redirect to invite cadastro page
  if (inviteToken) {
    destination = new URL(`/cadastro/${encodeURIComponent(inviteToken)}`, origin);
    destination.searchParams.set('from', 'oauth');
    response.headers.set('Location', destination.toString());
    return response;
  }

  // Get user to look up profile
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    destination = new URL('/login?error=no_user', origin);
    response.headers.set('Location', destination.toString());
    return response;
  }

  // Look up profile to determine role redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  // No profile = first-time OAuth user → complete signup
  if (!profile) {
    destination = new URL('/completar-cadastro', origin);
    response.headers.set('Location', destination.toString());
    return response;
  }

  // Look up academy membership to set bb-academy-id cookie
  const { data: membership } = await supabase
    .from('memberships')
    .select('academy_id')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  // Set app cookies so middleware and services can identify role + academy
  const cookieOpts = { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' as const };
  response.cookies.set('bb-active-role', profile.role, cookieOpts);
  if (membership?.academy_id) {
    response.cookies.set('bb-academy-id', membership.academy_id, cookieOpts);
  }

  // Redirect by role (must match middleware ROLE_DASHBOARD)
  const roleRoutes: Record<string, string> = {
    super_admin: '/superadmin',
    superadmin: '/superadmin',
    admin: '/admin',
    gestor: '/admin',
    professor: '/professor',
    recepcao: '/recepcao',
    recepcionista: '/recepcao',
    aluno_adulto: '/dashboard',
    aluno_teen: '/teen',
    aluno_kids: '/kids',
    responsavel: '/parent',
    franqueador: '/franqueador',
  };

  destination = new URL(roleRoutes[profile.role] || '/selecionar-perfil', origin);
  response.headers.set('Location', destination.toString());
  return response;
}
