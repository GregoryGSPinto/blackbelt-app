'use client';

import { forwardRef, useState, useRef } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

interface CsvRow {
  Nome: string;
  Email?: string;
  Telefone?: string;
  CPF?: string;
  'Data Nascimento'?: string;
  Faixa?: string;
  Turma?: string;
  Plano?: string;
  _valid: boolean;
  _errors: string[];
  _row: number;
}

interface CsvImportModalProps {
  onClose: () => void;
  onImport?: (rows: CsvRow[]) => void;
}

function validateRow(row: Record<string, string>, index: number): CsvRow {
  const errors: string[] = [];
  if (!row.Nome || row.Nome.trim().length < 3) errors.push('Nome obrigatorio (min 3 caracteres)');
  if (row.Email && !row.Email.includes('@')) errors.push('Email invalido');
  return {
    Nome: row.Nome ?? '',
    Email: row.Email,
    Telefone: row.Telefone,
    CPF: row.CPF,
    'Data Nascimento': row['Data Nascimento'],
    Faixa: row.Faixa,
    Turma: row.Turma,
    Plano: row.Plano,
    _valid: errors.length === 0,
    _errors: errors,
    _row: index + 1,
  };
}

const CsvImportModal = forwardRef<HTMLDivElement, CsvImportModalProps>(
  function CsvImportModal({ onClose, onImport }, ref) {
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<CsvRow[]>([]);
    const [importing, setImporting] = useState(false);

    const validCount = rows.filter((r) => r._valid).length;
    const errorCount = rows.filter((r) => !r._valid).length;

    async function handleFile(file: File) {
      try {
        const Papa = (await import('papaparse')).default;
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = (results.data as Record<string, string>[]).map((r, i) => validateRow(r, i));
            setRows(parsed);
          },
          error: (err) => toast(`Erro ao ler arquivo: ${err.message}`, 'error'),
        });
      } catch (err) {
        toast(translateError(err), 'error');
      }
    }

    async function handleImport() {
      setImporting(true);
      try {
        const valid = rows.filter((r) => r._valid);
        onImport?.(valid);
        toast(`${valid.length} alunos importados com sucesso!`, 'success');
        onClose();
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setImporting(false);
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div
          ref={ref}
          className="w-full max-w-lg rounded-xl p-6"
          style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="mb-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Importar Planilha
          </h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Envie um arquivo .csv com os dados dos alunos
          </p>

          {rows.length === 0 ? (
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8"
              style={{ borderColor: 'var(--bb-glass-border)' }}
              onClick={() => fileRef.current?.click()}
            >
              <span className="text-3xl">📄</span>
              <p className="mt-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Clique para selecionar arquivo CSV
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Colunas: Nome, Email, Telefone, CPF, Data Nascimento, Faixa, Turma, Plano
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-4 flex gap-3">
                <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{validCount}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Validos</p>
                </div>
                <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <p className="text-lg font-bold" style={{ color: '#ef4444' }}>{errorCount}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Com erro</p>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4 max-h-60 overflow-auto rounded-lg" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <th className="p-2 text-left" style={{ color: 'var(--bb-ink-60)' }}>#</th>
                      <th className="p-2 text-left" style={{ color: 'var(--bb-ink-60)' }}>Nome</th>
                      <th className="p-2 text-left" style={{ color: 'var(--bb-ink-60)' }}>Email</th>
                      <th className="p-2 text-left" style={{ color: 'var(--bb-ink-60)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((row) => (
                      <tr key={row._row} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <td className="p-2" style={{ color: 'var(--bb-ink-40)' }}>{row._row}</td>
                        <td className="p-2" style={{ color: 'var(--bb-ink-80)' }}>{row.Nome}</td>
                        <td className="p-2" style={{ color: 'var(--bb-ink-60)' }}>{row.Email ?? '-'}</td>
                        <td className="p-2">
                          {row._valid ? (
                            <span style={{ color: '#22c55e' }}>OK</span>
                          ) : (
                            <span style={{ color: '#ef4444' }}>{row._errors.join(', ')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 20 && (
                  <p className="p-2 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    ...e mais {rows.length - 20} linhas
                  </p>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg px-4 py-3 text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              Cancelar
            </button>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="flex-1 rounded-lg px-4 py-3 text-sm font-bold disabled:opacity-50"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                {importing ? 'Importando...' : `Importar ${validCount} alunos`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CsvImportModal.displayName = 'CsvImportModal';

export { CsvImportModal };
export type { CsvImportModalProps, CsvRow };
