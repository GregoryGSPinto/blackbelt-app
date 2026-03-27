import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface DataHealthIssue {
  id: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionRoute: string;
  entityId: string;
}

export interface DataHealthCategory {
  name: string;
  icon: string;
  issues: DataHealthIssue[];
}

export interface DataHealthReport {
  totalIssues: number;
  resolvedIssues: number;
  categories: DataHealthCategory[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getDataHealthReport(academyId: string): Promise<DataHealthReport> {
  if (isMock()) {
    return {
      totalIssues: 14,
      resolvedIssues: 9,
      categories: [
        {
          name: 'Cadastro',
          icon: '👤',
          issues: [
            { id: 'dh-1', description: 'Aluno Roberto Alves sem responsavel vinculado', severity: 'high', actionLabel: 'Vincular responsavel', actionRoute: '/admin/alunos/student-5', entityId: 'student-5' },
            { id: 'dh-2', description: 'Aluna Ana Souza sem data de nascimento', severity: 'medium', actionLabel: 'Completar cadastro', actionRoute: '/admin/alunos/student-8', entityId: 'student-8' },
            { id: 'dh-3', description: 'Teen Lucas sem ativacao de convite', severity: 'high', actionLabel: 'Reenviar convite', actionRoute: '/admin/convites', entityId: 'invite-3' },
          ],
        },
        {
          name: 'Financeiro',
          icon: '💰',
          issues: [
            { id: 'dh-4', description: 'Cobranca de Maria Ferreira sem pagador definido', severity: 'high', actionLabel: 'Definir pagador', actionRoute: '/admin/financeiro', entityId: 'invoice-12' },
          ],
        },
        {
          name: 'Turma',
          icon: '📚',
          issues: [
            { id: 'dh-5', description: 'Aluno Pedro Costa sem turma', severity: 'medium', actionLabel: 'Definir turma', actionRoute: '/admin/alunos/student-11', entityId: 'student-11' },
          ],
        },
      ],
    };
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const issues: DataHealthCategory[] = [];

    // Alunos sem turma
    const { data: noClass } = await supabase
      .from('students')
      .select('id, profiles(display_name)')
      .eq('academy_id', academyId)
      .is('class_id', null)
      .limit(20);

    if (noClass && noClass.length > 0) {
      issues.push({
        name: 'Turma',
        icon: '📚',
        issues: noClass.map((s: Record<string, unknown>) => ({
          id: `dh-noclass-${s.id}`,
          description: `Aluno ${(s.profiles as Record<string, unknown>)?.display_name ?? 'Sem nome'} sem turma`,
          severity: 'medium' as const,
          actionLabel: 'Definir turma',
          actionRoute: `/admin/alunos/${s.id}`,
          entityId: s.id as string,
        })),
      });
    }

    const totalIssues = issues.reduce((sum, cat) => sum + cat.issues.length, 0);

    return {
      totalIssues,
      resolvedIssues: 0,
      categories: issues,
    };
  } catch (err) {
    console.error('[getDataHealthReport] error:', err);
    return { totalIssues: 0, resolvedIssues: 0, categories: [] };
  }
}
