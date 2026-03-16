import type { Metadata } from 'next';
import { ProfessorShell } from '@/components/shell/ProfessorShell';

export const metadata: Metadata = { title: 'Professor' };

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return <ProfessorShell>{children}</ProfessorShell>;
}
