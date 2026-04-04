'use client';

import { usePathname } from 'next/navigation';
import { NpsSurveyModal } from './NpsSurveyModal';

const AUTH_PATHS = ['/login', '/cadastro', '/esqueci-senha', '/registrar', '/cadastrar-academia', '/selecionar-perfil'];

export function BetaWidgets() {
  const pathname = usePathname();

  // Don't show on auth/public pages
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p));
  if (isAuthPage) return null;

  return <NpsSurveyModal />;
}
