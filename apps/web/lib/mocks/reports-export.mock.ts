const delay = () => new Promise((r) => setTimeout(r, 500));

export async function mockGeneratePDF(title: string, _id: string): Promise<Blob> {
  await delay();
  // Generate a simple text-based placeholder PDF-like blob
  const content = [
    '==================================================',
    'BLACKBELT — Relatório',
    '==================================================',
    '',
    `Título: ${title}`,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
    '',
    'Este é um relatório placeholder gerado em modo mock.',
    'Em produção, será gerado via jsPDF + html2canvas',
    'com gráficos e tabelas formatados.',
    '',
    '==================================================',
    'Gerado por BlackBelt v2',
    '==================================================',
  ].join('\n');
  return new Blob([content], { type: 'text/plain' });
}
