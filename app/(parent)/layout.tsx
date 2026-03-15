import { ParentShell } from '@/components/shell/ParentShell';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentShell>{children}</ParentShell>;
}
