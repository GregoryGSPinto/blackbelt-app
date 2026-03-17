/**
 * Export data to CSV and trigger download in browser.
 */
export function exportToCSV(
  data: Record<string, string | number | boolean | null>[],
  filename: string,
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape commas and quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }

  const csv = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `blackbelt_${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate monthly report data (mock).
 */
export function generateMonthlyReportData(): Record<string, string | number | boolean | null>[] {
  return [
    { metrica: 'Alunos Ativos', valor: 172, variacao: '+7.5%' },
    { metrica: 'Novos Alunos', valor: 12, variacao: '+20%' },
    { metrica: 'Receita', valor: 47890, variacao: '+5.2%' },
    { metrica: 'Retenção', valor: 94.2, variacao: '+1.1%' },
    { metrica: 'Inadimplentes', valor: 3, variacao: '-2' },
    { metrica: 'Aulas Realizadas', valor: 96, variacao: '+4' },
    { metrica: 'Presença Média', valor: 78.5, variacao: '+3.2%' },
    { metrica: 'Vídeos Publicados', valor: 8, variacao: '+3' },
  ];
}

/**
 * Generate attendance report data (mock).
 */
export function generateAttendanceReportData(): Record<string, string | number | boolean | null>[] {
  const students = [
    'Rafael Costa', 'Luciana Martins', 'Pedro Henrique', 'Ana Clara', 'Bruno Silva',
    'Camila Oliveira', 'Diego Santos', 'Fernanda Lima', 'Gabriel Rocha', 'Helena Souza',
  ];
  return students.map((name, i) => ({
    aluno: name,
    turma: i % 2 === 0 ? 'BJJ Fundamentos' : 'BJJ Avançado',
    presencas_mes: 12 + Math.floor(Math.random() * 10),
    faltas_mes: Math.floor(Math.random() * 4),
    taxa_presenca: `${75 + Math.floor(Math.random() * 25)}%`,
    streak_atual: Math.floor(Math.random() * 15),
  }));
}

/**
 * Generate financial report data (mock).
 */
export function generateFinancialReportData(): Record<string, string | number | boolean | null>[] {
  const months = ['Jan/2026', 'Fev/2026', 'Mar/2026'];
  return months.map((month) => ({
    periodo: month,
    receita_total: 44000 + Math.floor(Math.random() * 8000),
    pagos: 165 + Math.floor(Math.random() * 10),
    pendentes: Math.floor(Math.random() * 8),
    atrasados: Math.floor(Math.random() * 5),
    inadimplencia_percentual: `${(Math.random() * 3).toFixed(1)}%`,
  }));
}
