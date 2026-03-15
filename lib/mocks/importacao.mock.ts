import type { ParsedCSVResult, ImportRow, DuplicateCheckResult, ImportResult } from '@/lib/api/importacao.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const SAMPLE_ROWS: ImportRow[] = [
  { name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 98888-1111', modality: 'BJJ', belt: 'Branca' },
  { name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(11) 98888-2222', modality: 'Muay Thai', belt: '' },
  { name: 'Roberto Alves', email: 'roberto@email.com', phone: '(11) 98888-3333', modality: 'BJJ', belt: 'Azul' },
  { name: 'Ana Carol', email: 'anacarol@email.com', phone: '(11) 98888-4444', modality: 'Judô', belt: 'Amarela' },
  { name: 'Marcos Souza', email: 'marcos@email.com', phone: '(11) 98888-5555', modality: 'BJJ', belt: 'Branca' },
  { name: 'Juliana Costa', email: 'juliana@email.com', phone: '(11) 98888-6666', modality: 'Muay Thai', belt: '' },
  { name: 'Rafael Mendes', email: 'rafael@email.com', phone: '(11) 98888-7777', modality: 'BJJ', belt: 'Roxa' },
  { name: 'Patrícia Ramos', email: 'patricia@email.com', phone: '(11) 98888-8888', modality: 'Judô', belt: 'Laranja' },
];

export async function mockParseCSV(_file: File): Promise<ParsedCSVResult> {
  await delay();
  return {
    headers: ['name', 'email', 'phone', 'modality', 'belt'],
    rows: SAMPLE_ROWS.map((r) => ({ ...r })),
    totalRows: SAMPLE_ROWS.length,
  };
}

export async function mockDetectDuplicates(rows: ImportRow[], _academyId: string): Promise<DuplicateCheckResult> {
  await delay();
  const duplicates: number[] = [2];
  const matchDetails: Record<number, string> = {
    2: 'Email roberto@email.com já cadastrado (Roberto Alves - Turma BJJ Avançado)',
  };

  return { duplicates, matchDetails };
}

export async function mockImportStudents(rows: ImportRow[], _academyId: string): Promise<ImportResult> {
  await delay();
  const total = rows.length;
  const skipped = 1;
  const errors = 0;
  return {
    imported: total - skipped - errors,
    skipped,
    errors,
    errorDetails: [],
  };
}
