import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  redirect(activeRole ? ROLE_DASHBOARD[activeRole] ?? '/selecionar-perfil' : '/login');
}
