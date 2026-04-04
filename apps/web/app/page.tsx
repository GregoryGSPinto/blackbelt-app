import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingPage from '@/features/site/pages/landing-page';

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

export default function AppEntryPage() {
  const activeRole = cookies().get('bb-active-role')?.value;

  if (activeRole && ROLE_DASHBOARD[activeRole]) {
    redirect(ROLE_DASHBOARD[activeRole]);
  }

  // Browser (non-native): show landing page
  // Native builds are already redirected to /login by middleware
  return <LandingPage />;
}
