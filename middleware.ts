import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = ['/', '/login', '/cadastro', '/convite', '/esqueci-senha', '/redefinir-senha', '/senha-alterada', '/selecionar-perfil', '/completar-cadastro', '/status', '/termos', '/privacidade', '/verificar', '/onboarding', '/cadastrar-academia', '/landing', '/precos', '/ajuda', '/sobre', '/contato', '/blog', '/comecar', '/g', '/auth/callback'];

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

// Mock mode: original bb-token logic
function handleMockAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const token = request.cookies.get('bb-token')?.value;

  if (isPublic && token) {
    // Never block these pages — user may be switching accounts or browsing
    if (pathname === '/' || pathname === '/login' || pathname.startsWith('/cadastro') || pathname === '/selecionar-perfil' || pathname === '/completar-cadastro' || pathname.startsWith('/convite') || pathname.startsWith('/comecar')) {
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

// Real Supabase auth
async function handleSupabaseAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated user on public page → redirect to dashboard
  // EXCEPT these pages — always allow (user switching accounts or browsing)
  if (isPublic && user) {
    if (pathname === '/' || pathname === '/login' || pathname.startsWith('/cadastro') || pathname === '/selecionar-perfil' || pathname === '/completar-cadastro' || pathname.startsWith('/convite') || pathname.startsWith('/comecar')) {
      return response;
    }
    const activeRole = request.cookies.get('bb-active-role')?.value;
    if (activeRole) {
      const dashboard = ROLE_DASHBOARD[activeRole];
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }
    return response;
  }

  if (isPublic) return response;

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

  return response;
}

export async function middleware(request: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  if (useMock) {
    return handleMockAuth(request);
  }

  return handleSupabaseAuth(request);
}

export const config = {
  matcher: ['/((?!_next|static|favicon\\.ico|api).*)'],
};
