'use client';

import { useState, useRef, useCallback } from 'react';
import {
  parseCSV,
  detectDuplicates,
  importStudents,
  type ParsedCSVResult,
  type DuplicateCheckResult,
  type ImportResult,
} from '@/lib/api/importacao.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

type Phase = 'upload' | 'mapping' | 'preview' | 'importing' | 'report';

const EXPECTED_COLUMNS = ['name', 'email', 'phone', 'modality', 'belt'] as const;

const COLUMN_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  phone: 'Telefone',
  modality: 'Modalidade',
  belt: 'Faixa',
};

export default function ImportarPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCSVResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<DuplicateCheckResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast('Por favor, selecione um arquivo CSV', 'error');
      return;
    }
    setParsing(true);
    try {
      const result = await parseCSV(file);
      setParsedData(result);
      // Auto-map columns if headers match expected
      const autoMap: Record<string, string> = {};
      result.headers.forEach((h) => {
        const lower = h.toLowerCase().trim();
        if (lower === 'nome' || lower === 'name') autoMap[h] = 'name';
        else if (lower === 'email' || lower === 'e-mail') autoMap[h] = 'email';
        else if (lower === 'telefone' || lower === 'phone' || lower === 'celular') autoMap[h] = 'phone';
        else if (lower === 'modalidade' || lower === 'modality') autoMap[h] = 'modality';
        else if (lower === 'faixa' || lower === 'belt') autoMap[h] = 'belt';
      });
      setColumnMapping(autoMap);
      setPhase('mapping');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setParsing(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  async function handleConfirmMapping() {
    if (!parsedData) return;
    setParsing(true);
    try {
      const dupeResult = await detectDuplicates(parsedData.rows, 'academy-1');
      setDuplicates(dupeResult);
      setPhase('preview');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (!parsedData) return;
    setPhase('importing');
    setImportProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const nonDuplicateRows = parsedData.rows.filter(
        (_, idx) => !duplicates?.duplicates.includes(idx),
      );
      const result = await importStudents(nonDuplicateRows, 'academy-1');
      clearInterval(interval);
      setImportProgress(100);
      setImportResult(result);
      setPhase('report');
    } catch (err) {
      clearInterval(interval);
      toast(translateError(err), 'error');
      setPhase('preview');
    }
  }

  function handleReset() {
    setPhase('upload');
    setParsedData(null);
    setColumnMapping({});
    setDuplicates(null);
    setImportResult(null);
    setImportProgress(0);
  }

  const allColumnsMapped = EXPECTED_COLUMNS.every((col) =>
    Object.values(columnMapping).includes(col),
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-bb-black">Importar Alunos</h1>
        <p className="mt-1 text-sm text-bb-gray-500">Importe alunos em massa a partir de um arquivo CSV.</p>
      </div>

      {/* Phase: Upload */}
      {phase === 'upload' && (
        <Card className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              dragOver
                ? 'border-bb-red bg-red-50'
                : 'border-bb-gray-300 hover:border-bb-gray-400'
            }`}
          >
            {parsing ? (
              <Spinner />
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bb-gray-100 text-3xl">
                  📄
                </div>
                <p className="mt-4 text-sm font-medium text-bb-black">
                  Arraste o arquivo CSV aqui
                </p>
                <p className="mt-1 text-xs text-bb-gray-500">ou clique para selecionar</p>
                <p className="mt-4 text-xs text-bb-gray-400">
                  Colunas esperadas: Nome, Email, Telefone, Modalidade, Faixa
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </Card>
      )}

      {/* Phase: Column Mapping */}
      {phase === 'mapping' && parsedData && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-bb-black">Mapeamento de Colunas</h2>
          <p className="mt-1 text-sm text-bb-gray-500">
            Associe cada coluna do CSV ao campo correspondente. {parsedData.totalRows} linha(s) encontrada(s).
          </p>

          <div className="mt-4 space-y-3">
            {parsedData.headers.map((header) => (
              <div key={header} className="flex items-center gap-4">
                <span className="w-40 truncate text-sm font-medium text-bb-gray-700">{header}</span>
                <span className="text-bb-gray-400">→</span>
                <select
                  value={columnMapping[header] ?? ''}
                  onChange={(e) =>
                    setColumnMapping((prev) => {
                      const next = { ...prev };
                      // Remove previous mapping for this target
                      Object.keys(next).forEach((k) => {
                        if (next[k] === e.target.value && k !== header) {
                          delete next[k];
                        }
                      });
                      if (e.target.value) next[header] = e.target.value;
                      else delete next[header];
                      return next;
                    })
                  }
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                >
                  <option value="">-- Ignorar --</option>
                  {EXPECTED_COLUMNS.map((col) => (
                    <option key={col} value={col}>{COLUMN_LABELS[col]}</option>
                  ))}
                </select>
                {columnMapping[header] && (
                  <span className="text-xs text-green-600">&#10003;</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={handleReset}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={handleConfirmMapping}
              disabled={!allColumnsMapped}
              loading={parsing}
            >
              Verificar Duplicatas
            </Button>
          </div>
        </Card>
      )}

      {/* Phase: Preview */}
      {phase === 'preview' && parsedData && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-bb-black">Pré-visualização</h2>
              <p className="mt-1 text-sm text-bb-gray-500">
                {parsedData.totalRows} aluno(s) encontrado(s)
                {duplicates && duplicates.duplicates.length > 0 && (
                  <span className="ml-2 text-amber-600">
                    ({duplicates.duplicates.length} duplicata(s) detectada(s))
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bb-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">#</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Nome</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Telefone</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Modalidade</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Faixa</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.map((row, idx) => {
                  const isDuplicate = duplicates?.duplicates.includes(idx);
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-bb-gray-100 ${
                        isDuplicate ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-bb-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 text-bb-black">{row.name}</td>
                      <td className="px-3 py-2 text-bb-gray-600">{row.email}</td>
                      <td className="px-3 py-2 text-bb-gray-600">{row.phone}</td>
                      <td className="px-3 py-2 text-bb-gray-600">{row.modality}</td>
                      <td className="px-3 py-2 text-bb-gray-600">{row.belt || '—'}</td>
                      <td className="px-3 py-2">
                        {isDuplicate ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Duplicata
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Novo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {duplicates && duplicates.duplicates.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">Duplicatas detectadas:</p>
              {Object.entries(duplicates.matchDetails).map(([rowIdx, detail]) => (
                <p key={rowIdx} className="mt-1 text-xs text-amber-700">
                  Linha {Number(rowIdx) + 1}: {detail}
                </p>
              ))}
              <p className="mt-2 text-xs text-amber-600">
                Linhas duplicadas serão ignoradas na importação.
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={handleReset}>Cancelar</Button>
            <Button variant="ghost" onClick={() => setPhase('mapping')}>Voltar</Button>
            <Button className="flex-1" onClick={handleImport}>
              Importar {parsedData.rows.length - (duplicates?.duplicates.length ?? 0)} aluno(s)
            </Button>
          </div>
        </Card>
      )}

      {/* Phase: Importing */}
      {phase === 'importing' && (
        <Card className="p-6">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-sm font-medium text-bb-black">Importando alunos...</p>
            <div className="mx-auto mt-4 max-w-xs">
              <div className="h-2 rounded-full bg-bb-gray-200">
                <div
                  className="h-full rounded-full bg-bb-red transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-bb-gray-500">{importProgress}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Phase: Report */}
      {phase === 'report' && importResult && (
        <Card className="p-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
              &#10003;
            </div>
            <h2 className="mt-4 text-lg font-bold text-bb-black">Importação Concluída</h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{importResult.imported}</p>
              <p className="text-sm text-green-600">Importados</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
              <p className="text-sm text-amber-600">Ignorados (duplicatas)</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
              <p className="text-sm text-red-600">Erros</p>
            </div>
          </div>

          {importResult.errorDetails.length > 0 && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Detalhes dos erros:</p>
              {importResult.errorDetails.map((err, idx) => (
                <p key={idx} className="mt-1 text-xs text-red-700">
                  Linha {err.row}: {err.reason}
                </p>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={handleReset}>Importar Outro Arquivo</Button>
            <Button className="flex-1" onClick={() => window.history.back()}>
              Voltar ao Painel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
