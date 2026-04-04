'use client';

/**
 * Download contract content as a professionally formatted PDF.
 * Uses html2pdf.js (dynamically imported) to convert DOM element to PDF.
 */
export async function downloadContractPDF(
  elementId: string,
  fileName?: string,
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const html2pdf = (await import('html2pdf.js')).default;

  await html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: fileName || 'contrato.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save();
}
