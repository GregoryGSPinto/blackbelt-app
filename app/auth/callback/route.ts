import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const inviteToken = searchParams.get('invite_token');
  const next = searchParams.get('next') ?? '/selecionar-perfil';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin));
  }

  // If invite token present, redirect back to cadastro page after session exchange
  const redirectTo = inviteToken
    ? `/cadastro/${encodeURIComponent(inviteToken)}?from=oauth`
    : next;

  const response = NextResponse.redirect(new URL(redirectTo, origin));

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_exchange', origin));
  }

  return response;
}
