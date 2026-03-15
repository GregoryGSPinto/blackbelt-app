import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/cadastro', '/esqueci-senha', '/selecionar-perfil'];

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin',
  professor: '/professor',
  aluno_adulto: '/dashboard',
  aluno_teen: '/teen',
  aluno_kids: '/kids',
  responsavel: '/parent',
};

const ROUTE_ROLE: Record<string, string> = {
  '/admin': 'admin',
  '/professor': 'professor',
  '/dashboard': 'aluno_adulto',
  '/teen': 'aluno_teen',
  '/kids': 'aluno_kids',
  '/parent': 'responsavel',
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const token = request.cookies.get('bb-token')?.value;

  // Authenticated user on public page → redirect to dashboard
  if (isPublic && token) {
    const payload = decodeTokenPayload(token);
    if (payload && typeof payload.exp === 'number' && Date.now() < payload.exp * 1000) {
      const role = payload.role as string;
      const dashboard = ROLE_DASHBOARD[role];
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    }
  }

  // Public pages don't need further checks
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected route: no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Decode & validate token
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number' || Date.now() >= payload.exp * 1000) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('bb-token');
    return response;
  }

  // Check role vs route
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

export const config = {
  matcher: ['/((?!_next|static|favicon\\.ico|api).*)'],
};
