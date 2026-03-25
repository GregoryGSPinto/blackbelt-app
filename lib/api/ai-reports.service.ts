import { isMock } from '@/lib/env';

export async function generateMonthlyNarrative(academyId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateMonthlyNarrative } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateMonthlyNarrative(academyId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch real data for the month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .gte('class_date', startDate)
      .lte('class_date', endDate);

    const { count: studentCount } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId);

    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .gte('due_date', startDate)
      .lte('due_date', endDate);

    const total = attendanceCount ?? 0;
    const students = studentCount ?? 0;
    const invoices = invoiceCount ?? 0;

    return `Relatório mensal (${month}): ${students} alunos ativos, ${total} presenças registradas, ${invoices} cobranças no período. Configure a IA para narrativas detalhadas.`;
  } catch (error) {
    console.warn('[generateMonthlyNarrative] Fallback:', error);
    return '';
  }
}

export async function generateStudentReport(studentId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateStudentReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateStudentReport(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('name, belt, stripes')
      .eq('id', studentId)
      .single();

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    const name = student?.name ?? 'Aluno';
    const belt = student?.belt ?? 'N/A';
    const total = attendanceCount ?? 0;

    return `Relatório de ${name}: Faixa ${belt}, ${total} presenças totais. Configure a IA para relatórios detalhados com análise de desempenho.`;
  } catch (error) {
    console.warn('[generateStudentReport] Fallback:', error);
    return '';
  }
}

export async function generateClassReport(classId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateClassReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateClassReport(classId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId)
      .gte('class_date', startDate)
      .lte('class_date', endDate);

    const total = attendanceCount ?? 0;

    return `Relatório da turma (${month}): ${total} presenças no período. Configure a IA para relatórios narrativos detalhados.`;
  } catch (error) {
    console.warn('[generateClassReport] Fallback:', error);
    return '';
  }
}
