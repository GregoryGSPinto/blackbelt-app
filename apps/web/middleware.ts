import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const AUTH_ENTRY_PATHS = ['/', '/login', '/cadastro', '/convite', '/esqueci-senha', '/redefinir-senha', '/senha-alterada', '/selecionar-perfil', '/comecar'];
const PUBLIC_OPERATIONAL_PATHS = [
  '/completar-cadastro',
  '/status',
  '/termos',
  '/privacidade',
  '/privacidade-menores',
  '/verificar',
  '/onboarding',
  '/cadastrar-academia',
  '/registro-academia',
  '/ajuda',
  '/contato',
  '/g',
  '/auth/callback',
  '/compete',
  '/app-store',
  '/changelog',
  '/developers',
  '/marketplace',
  '/ranking',
  '/campeonatos',
  '/.well-known',
  '/excluir-conta',
  '/suporte',
];
const MARKETING_REDIRECT_PATHS = ['/landing', '/precos', '/sobre', '/blog', '/beta-invite', '/aula-experimental'];
const PUBLIC_PATHS = [...AUTH_ENTRY_PATHS, ...PUBLIC_OPERATIONAL_PATHS, ...MARKETING_REDIRECT_PATHS];

const ROLE_DASHBOARD: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  gestor: '/admin',
  professor: '/professor',
  recepcao: '/recepcao',
  aluno_adulto: '/dashboard',
  aluno_teen: '/teen',
  aluno_kids: '/kids',
  responsavel: '/parent',
  franqueador: '/franqueador',
};

const ROUTE_ROLE: Record<string, string> = {
  '/superadmin': 'superadmin',
  '/cockpit': 'superadmin',
  '/admin': 'admin',
  '/professor': 'professor',
  '/recepcao': 'recepcao',
  '/dashboard': 'aluno_adulto',
  '/teen': 'aluno_teen',
  '/kids': 'aluno_kids',
  '/parent': 'responsavel',
  '/franqueador': 'franqueador',
};

function decodeTokenPayload(token: string): Record<string, string | number> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// Mock mode: original bb-token logic
function handleMockAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const token = request.cookies.get('bb-token')?.value;

  if (isPublic && token) {
    // Never block these pages — user may be switching accounts or browsing
    if (isAuthEntryPath(pathname) || pathname === '/completar-cadastro') {
      return NextResponse.next();
    }
    const payload = decodeTokenPayload(token);
    if (payload && typeof payload.exp === 'number' && Date.now() < payload.exp * 1000) {
      const role = payload.role as string;
      const dashboard = ROLE_DASHBOARD[role];
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }
  }

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number' || Date.now() >= payload.exp * 1000) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('bb-token');
    return response;
  }

  const role = payload.role as string;
  const matchedRoute = Object.keys(ROUTE_ROLE).find(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  if (matchedRoute) {
    const expectedRole = ROUTE_ROLE[matchedRoute];
    if (expectedRole !== role) {
      const correctDashboard = ROLE_DASHBOARD[role] ?? '/login';
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  return NextResponse.next();
}

// Real Supabase auth — uses getAll/setAll pattern required by @supabase/ssr 0.9+
async function handleSupabaseAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  // Mutable response — setAll recreates it to keep cookies in sync
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Update request cookies so downstream code sees fresh values
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // 2. Recreate response with updated request (carries cookies to browser)
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This refreshes the session and sets updated cookies via setAll
  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated user on public page → redirect to dashboard
  // EXCEPT these pages — always allow (user switching accounts or browsing)
  if (isPublic && user) {
    if (isAuthEntryPath(pathname) || pathname === '/completar-cadastro') {
      return supabaseResponse;
    }
    const activeRole = request.cookies.get('bb-active-role')?.value;
    if (activeRole) {
      const dashboard = ROLE_DASHBOARD[activeRole];
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }
    return supabaseResponse;
  }

  if (isPublic) return supabaseResponse;

  // Protected route: no user → redirect to login
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based route guard
  const activeRole = request.cookies.get('bb-active-role')?.value;
  if (activeRole) {
    const matchedRoute = Object.keys(ROUTE_ROLE).find(
      (route) => pathname === route || pathname.startsWith(route + '/'),
    );

    if (matchedRoute) {
      const expectedRole = ROUTE_ROLE[matchedRoute];
      if (expectedRole !== activeRole) {
        const correctDashboard = ROLE_DASHBOARD[activeRole] ?? '/login';
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
    }
  }

  return supabaseResponse;
}

const isNativeBuildFlag =
  process.env.NEXT_PUBLIC_CAPACITOR === 'true' ||
  process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

const NATIVE_BLOCKED_PATHS = ['/', '/precos', '/planos', '/pricing', '/landing', '/comecar'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block pricing/marketing routes in native builds (Apple Guideline 3.1.3a)
  if (isNativeBuildFlag && NATIVE_BLOCKED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  if (useMock) {
    return handleMockAuth(request);
  }

  return handleSupabaseAuth(request);
}

export const config = {
  matcher: ['/((?!_next|static|api|.*\\.(?:png|svg|ico|json|webmanifest|js|css|woff2?|ttf|eot)$).*)'],
};
