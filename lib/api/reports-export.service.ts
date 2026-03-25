import { isMock } from '@/lib/env';

export async function generatePresencaReport(academyId: string, period: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório de Presença — ${period}`, academyId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get all students for this academy with their attendance in the period
      const { data: students, error: studErr } = await supabase
        .from('students')
        .select('id, belt, profile:profiles!students_profile_id_fkey(display_name)')
        .eq('academy_id', academyId);
      if (studErr || !students) {
        console.warn('[generatePresencaReport] students query error:', studErr?.message);
        return new Blob();
      }

      const { data: attendance, error: attErr } = await supabase
        .from('attendance')
        .select('student_id, checked_at, class:classes!attendance_class_id_fkey(name)')
        .in('student_id', students.map((s: { id: string }) => s.id))
        .gte('checked_at', `${period}-01`)
        .order('checked_at', { ascending: true });
      if (attErr) {
        console.warn('[generatePresencaReport] attendance query error:', attErr.message);
        return new Blob();
      }

      // Build CSV
      const rows: string[] = ['Aluno,Faixa,Total Presenças,Aulas'];
      for (const s of students as Array<{ id: string; belt: string; profile: { display_name: string } | null }>) {
        const studentAtt = (attendance ?? []).filter((a: { student_id: string }) => a.student_id === s.id);
        const name = s.profile?.display_name ?? 'N/A';
        const classes = studentAtt.map((a: { class: { name: string } | null }) => a.class?.name ?? '').join('; ');
        rows.push(`"${name}","${s.belt}",${studentAtt.length},"${classes}"`);
      }
      const csv = rows.join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8' });
    } catch (err) {
      console.warn('[reports-export.generatePresencaReport] error, using fallback:', err);
      return new Blob();
    }
  } catch (error) {
    console.warn('[generatePresencaReport] Fallback:', error);
    return new Blob();
  }
}

export async function generateFinanceiroReport(academyId: string, period: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório Financeiro — ${period}`, academyId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // invoices joined through subscriptions → students filtered by academy
      const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('id, amount, status, due_date, paid_at, subscription:subscriptions!invoices_subscription_id_fkey(student:students!subscriptions_student_id_fkey(academy_id))')
        .gte('due_date', `${period}-01`)
        .order('due_date', { ascending: true });
      if (invErr) {
        console.warn('[generateFinanceiroReport] invoices query error:', invErr.message);
        return new Blob();
      }

      // Filter by academy on the client side (RLS already scopes, but be safe)
      const filtered = (invoices ?? []).filter((inv: { subscription: { student: { academy_id: string } | null } | null }) =>
        inv.subscription?.student?.academy_id === academyId
      );

      const rows: string[] = ['Status,Quantidade,Total (R$)'];
      const grouped: Record<string, { count: number; total: number }> = {};
      for (const inv of filtered as Array<{ status: string; amount: number }>) {
        if (!grouped[inv.status]) grouped[inv.status] = { count: 0, total: 0 };
        grouped[inv.status].count++;
        grouped[inv.status].total += Number(inv.amount);
      }
      for (const [status, data] of Object.entries(grouped)) {
        rows.push(`"${status}",${data.count},${data.total.toFixed(2)}`);
      }
      const csv = rows.join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8' });
    } catch (err) {
      console.warn('[reports-export.generateFinanceiroReport] error, using fallback:', err);
      return new Blob();
    }
  } catch (error) {
    console.warn('[generateFinanceiroReport] Fallback:', error);
    return new Blob();
  }
}

export async function generateAlunoReport(studentId: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Relatório do Aluno`, studentId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: student, error: stuErr } = await supabase
        .from('students')
        .select('id, belt, started_at, academy_id, profile:profiles!students_profile_id_fkey(display_name)')
        .eq('id', studentId)
        .single();
      if (stuErr || !student) {
        console.warn('[generateAlunoReport] student query error:', stuErr?.message);
        return new Blob();
      }

      const { data: attendance } = await supabase
        .from('attendance')
        .select('checked_at, class:classes!attendance_class_id_fkey(name)')
        .eq('student_id', studentId)
        .order('checked_at', { ascending: false })
        .limit(100);

      const { data: xp } = await supabase
        .from('xp_ledger')
        .select('amount, reason, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50);

      const profile = student.profile as { display_name: string } | null;
      const lines: string[] = [
        `Relatorio do Aluno: ${profile?.display_name ?? 'N/A'}`,
        `Faixa: ${student.belt}`,
        `Inicio: ${student.started_at}`,
        `Total presencas: ${(attendance ?? []).length}`,
        '',
        'Ultimas presencas:',
        ...(attendance ?? []).slice(0, 20).map((a: { checked_at: string; class: { name: string } | null }) => `  ${a.checked_at} - ${a.class?.name ?? ''}`),
        '',
        'XP recente:',
        ...(xp ?? []).slice(0, 20).map((x: { amount: number; reason: string; created_at: string }) => `  +${x.amount} ${x.reason} (${x.created_at})`),
      ];
      return new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    } catch (err) {
      console.warn('[reports-export.generateAlunoReport] error, using fallback:', err);
      return new Blob();
    }
  } catch (error) {
    console.warn('[generateAlunoReport] Fallback:', error);
    return new Blob();
  }
}

export async function generateRankingReport(academyId: string): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGeneratePDF } = await import('@/lib/mocks/reports-export.mock');
      return mockGeneratePDF(`Ranking Geral`, academyId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get all students for this academy
      const { data: students, error: stuErr } = await supabase
        .from('students')
        .select('id, belt, profile:profiles!students_profile_id_fkey(display_name)')
        .eq('academy_id', academyId);
      if (stuErr || !students || students.length === 0) {
        console.warn('[generateRankingReport] students query error:', stuErr?.message);
        return new Blob();
      }

      // Get XP totals for these students
      const { data: xpRows, error: xpErr } = await supabase
        .from('xp_ledger')
        .select('student_id, amount')
        .in('student_id', students.map((s: { id: string }) => s.id));
      if (xpErr) {
        console.warn('[generateRankingReport] xp_ledger query error:', xpErr.message);
        return new Blob();
      }

      // Aggregate XP per student
      const xpMap: Record<string, number> = {};
      for (const row of (xpRows ?? []) as Array<{ student_id: string; amount: number }>) {
        xpMap[row.student_id] = (xpMap[row.student_id] ?? 0) + row.amount;
      }

      // Build ranking
      const ranked = (students as Array<{ id: string; belt: string; profile: { display_name: string } | null }>)
        .map(s => ({ name: s.profile?.display_name ?? 'N/A', belt: s.belt, xp: xpMap[s.id] ?? 0 }))
        .sort((a, b) => b.xp - a.xp);

      const rows: string[] = ['Posição,Aluno,Faixa,XP Total'];
      ranked.forEach((r, i) => {
        rows.push(`${i + 1},"${r.name}","${r.belt}",${r.xp}`);
      });
      const csv = rows.join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8' });
    } catch (err) {
      console.warn('[reports-export.generateRankingReport] error, using fallback:', err);
      return new Blob();
    }
  } catch (error) {
    console.warn('[generateRankingReport] Fallback:', error);
    return new Blob();
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
