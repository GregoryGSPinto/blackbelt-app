import { ProfessorShell } from '@/components/shell/ProfessorShell';

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return <ProfessorShell>{children}</ProfessorShell>;
}
