'use client';

import { useState, useCallback, useRef, type CSSProperties, type DragEvent } from 'react';
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, ChevronLeft, ArrowRight, X, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { parseCSVFile } from '@/lib/export/csv-exporter';
import {
  IMPORT_TEMPLATES,
  getTemplate,
  suggestMappings,
  validateRow,
} from '@/lib/export/import-templates';
import type {
  ImportTemplate,
  FieldMapping,
  ValidationResult,
} from '@/lib/export/import-templates';

// ── Types ─────────────────────────────────────────────────────

export interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  /** Pre-select a template */
  templateId?: string;
  /** Academy ID for the import */
  academyId: string;
  /** Callback when import is confirmed */
  onImport: (params: {
    template: ImportTemplate;
    mappings: FieldMapping[];
    validRows: Record<string, string>[];
    totalRows: number;
  }) => Promise<{ imported: number; skipped: number; errors: { row: number; message: string }[] }>;
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'result';

// ── Styles ────────────────────────────────────────────────────

const cardStyle: CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const labelStyle: CSSProperties = {
  color: 'var(--bb-ink-60)',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// ── Component ─────────────────────────────────────────────────

export function ImportWizard({
  open,
  onClose,
  templateId,
  academyId: _academyId,
  onImport,
}: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplate | null>(
    templateId ? getTemplate(templateId) ?? null : null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reset ─────────────────────────────────────────────────

  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setValidationResults([]);
    setImporting(false);
    setImportResult(null);
    setDragActive(false);
    if (!templateId) setSelectedTemplate(null);
  }, [templateId]);

  function handleClose() {
    reset();
    onClose();
  }

  // ── File handling ─────────────────────────────────────────

  async function processFile(f: File) {
    setFile(f);
    const parsed = await parseCSVFile(f);
    setHeaders(parsed.headers);
    setRows(parsed.rows);

    if (selectedTemplate) {
      const suggested = suggestMappings(parsed.headers, selectedTemplate);
      setMappings(suggested);
    }

    setStep('mapping');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) {
      processFile(f);
    }
  }

  // ── Mapping ───────────────────────────────────────────────

  function updateMapping(csvColumn: string, systemField: string) {
    setMappings((prev) => {
      // Remove existing mapping for this system field
      const filtered = prev.filter((m) => m.systemField !== systemField && m.csvColumn !== csvColumn);
      if (systemField) {
        filtered.push({ csvColumn, systemField, confidence: 1.0 });
      }
      return filtered;
    });
  }

  function handleTemplateSelect(t: ImportTemplate) {
    setSelectedTemplate(t);
    if (headers.length > 0) {
      setMappings(suggestMappings(headers, t));
    }
  }

  // ── Validation ────────────────────────────────────────────

  function runValidation() {
    if (!selectedTemplate) return;

    const results: ValidationResult[] = rows.map((row, i) => {
      const result = validateRow(row, mappings, selectedTemplate);
      return { ...result, rowNumber: i + 2 }; // +2 for header row + 0-index
    });

    setValidationResults(results);
    setStep('preview');
  }

  // ── Import ────────────────────────────────────────────────

  async function handleImport() {
    if (!selectedTemplate) return;
    setImporting(true);

    try {
      const validRows = validationResults
        .filter((r) => r.valid)
        .map((r) => {
          // Apply transforms
          const result = validateRow(r.data, mappings, selectedTemplate);
          return (result as ReturnType<typeof validateRow>).transformed;
        });

      const result = await onImport({
        template: selectedTemplate,
        mappings,
        validRows,
        totalRows: rows.length,
      });

      setImportResult(result);
      setStep('result');
    } catch {
      setImportResult({
        imported: 0,
        skipped: rows.length,
        errors: [{ row: 0, message: 'Erro inesperado na importação' }],
      });
      setStep('result');
    } finally {
      setImporting(false);
    }
  }

  // ── Computed ──────────────────────────────────────────────

  const validCount = validationResults.filter((r) => r.valid).length;
  const invalidCount = validationResults.filter((r) => !r.valid).length;
  const requiredFieldsMapped = selectedTemplate
    ? selectedTemplate.fields
        .filter((f) => f.required)
        .every((f) => mappings.some((m) => m.systemField === f.key))
    : false;

  // ── Render ────────────────────────────────────────────────

  const stepTitles: Record<WizardStep, string> = {
    upload: 'Importar Dados',
    mapping: 'Mapear Colunas',
    preview: 'Revisar Dados',
    result: 'Resultado',
  };

  return (
    <Modal open={open} onClose={handleClose} variant="fullscreen" title="">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {stepTitles[step]}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            {(['upload', 'mapping', 'preview', 'result'] as WizardStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor:
                      s === step
                        ? '#C62828'
                        : (['upload', 'mapping', 'preview', 'result'].indexOf(step) > i)
                          ? 'var(--bb-success)'
                          : 'var(--bb-depth-5)',
                    color: s === step || (['upload', 'mapping', 'preview', 'result'].indexOf(step) > i)
                      ? '#fff'
                      : 'var(--bb-ink-40)',
                  }}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <ChevronRight className="h-3 w-3" style={{ color: 'var(--bb-ink-20)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleClose} className="p-2" style={{ color: 'var(--bb-ink-40)' }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Template selection */}
          {!templateId && (
            <div>
              <div style={labelStyle} className="mb-2">Tipo de importação</div>
              <div className="grid gap-3 sm:grid-cols-3">
                {IMPORT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className="p-4 text-left transition-all"
                    style={{
                      ...cardStyle,
                      borderColor: selectedTemplate?.id === t.id ? '#C62828' : 'var(--bb-glass-border)',
                      borderWidth: selectedTemplate?.id === t.id ? '2px' : '1px',
                    }}
                  >
                    <div className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {t.name}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {t.description}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: 'var(--bb-ink-30)' }}>
                      {t.fields.filter((f) => f.required).length} obrigatórios · {t.fields.length} campos
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => selectedTemplate && fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl p-12 text-center transition-all"
            style={{
              border: `2px dashed ${dragActive ? '#C62828' : 'var(--bb-glass-border)'}`,
              backgroundColor: dragActive ? 'rgba(198, 40, 40, 0.05)' : 'var(--bb-depth-2)',
              opacity: selectedTemplate ? 1 : 0.5,
              pointerEvents: selectedTemplate ? 'auto' : 'none',
            }}
          >
            <Upload className="h-10 w-10" style={{ color: dragActive ? '#C62828' : 'var(--bb-ink-30)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Arraste o arquivo CSV aqui
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                ou clique para selecionar
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Template fields info */}
          {selectedTemplate && (
            <div style={cardStyle} className="p-4">
              <div style={labelStyle} className="mb-2">
                Campos esperados — {selectedTemplate.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.fields.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    style={{
                      backgroundColor: f.required ? 'rgba(198, 40, 40, 0.1)' : 'var(--bb-depth-5)',
                      color: f.required ? '#C62828' : 'var(--bb-ink-60)',
                    }}
                  >
                    {f.label}
                    {f.required && <span className="font-bold">*</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && selectedTemplate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <FileText className="mr-1 inline h-4 w-4" />
              {file?.name} · {rows.length} linhas · {headers.length} colunas
            </div>
            {!requiredFieldsMapped && (
              <div className="flex items-center gap-1 text-xs" style={{ color: '#C62828' }}>
                <AlertTriangle className="h-3.5 w-3.5" />
                Mapeie todos os campos obrigatórios
              </div>
            )}
          </div>

          {/* Mapping table */}
          <div className="overflow-hidden" style={{ ...cardStyle }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bb-depth-5)' }}>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    Coluna do CSV
                  </th>
                  <th className="px-4 py-2.5 text-center" style={{ color: 'var(--bb-ink-30)' }}>
                    <ArrowRight className="mx-auto h-4 w-4" />
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    Campo no Sistema
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    Amostra
                  </th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header) => {
                  const currentMapping = mappings.find((m) => m.csvColumn === header);
                  const sampleValue = rows[0]?.[header] ?? '';
                  return (
                    <tr
                      key={header}
                      className="border-t"
                      style={{ borderColor: 'var(--bb-glass-border)' }}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                        {header}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <ArrowRight className="mx-auto h-3.5 w-3.5" style={{ color: 'var(--bb-ink-20)' }} />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={currentMapping?.systemField ?? ''}
                          onChange={(e) => updateMapping(header, e.target.value)}
                          className="w-full rounded-md px-2 py-1.5 text-xs"
                          style={{
                            backgroundColor: 'var(--bb-depth-3)',
                            color: 'var(--bb-ink-80)',
                            border: '1px solid var(--bb-glass-border)',
                          }}
                        >
                          <option value="">— Ignorar —</option>
                          {selectedTemplate.fields.map((f) => {
                            const alreadyMapped = mappings.some(
                              (m) => m.systemField === f.key && m.csvColumn !== header,
                            );
                            return (
                              <option key={f.key} value={f.key} disabled={alreadyMapped}>
                                {f.label} {f.required ? '*' : ''} {alreadyMapped ? '(já mapeado)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td
                        className="max-w-[200px] truncate px-4 py-2.5 text-xs"
                        style={{ color: 'var(--bb-ink-40)' }}
                        title={sampleValue}
                      >
                        {sampleValue || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={runValidation}
              disabled={!requiredFieldsMapped}
            >
              Validar dados <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && selectedTemplate && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg p-3" style={cardStyle}>
              <div className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {rows.length}
              </div>
              <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Total de linhas</div>
            </div>
            <div className="rounded-lg p-3" style={cardStyle}>
              <div className="text-2xl font-bold" style={{ color: 'var(--bb-success)' }}>
                {validCount}
              </div>
              <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Válidas</div>
            </div>
            <div className="rounded-lg p-3" style={cardStyle}>
              <div className="text-2xl font-bold" style={{ color: '#C62828' }}>
                {invalidCount}
              </div>
              <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Com erros</div>
            </div>
          </div>

          {/* Preview table */}
          <div className="max-h-[400px] overflow-auto" style={{ ...cardStyle }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr style={{ backgroundColor: 'var(--bb-depth-5)' }}>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    #
                  </th>
                  <th className="px-3 py-2 text-center font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    Status
                  </th>
                  {mappings.map((m) => {
                    const field = selectedTemplate.fields.find((f) => f.key === m.systemField);
                    return (
                      <th
                        key={m.systemField}
                        className="px-3 py-2 text-left font-semibold"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        {field?.label ?? m.systemField}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                    Erros
                  </th>
                </tr>
              </thead>
              <tbody>
                {validationResults.slice(0, 50).map((result, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{
                      borderColor: 'var(--bb-glass-border)',
                      backgroundColor: result.valid ? undefined : 'rgba(198, 40, 40, 0.03)',
                    }}
                  >
                    <td className="px-3 py-2" style={{ color: 'var(--bb-ink-40)' }}>
                      {result.rowNumber}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {result.valid ? (
                        <CheckCircle className="mx-auto h-4 w-4" style={{ color: 'var(--bb-success)' }} />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4" style={{ color: '#C62828' }} />
                      )}
                    </td>
                    {mappings.map((m) => (
                      <td
                        key={m.systemField}
                        className="max-w-[150px] truncate px-3 py-2"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        {result.data[m.csvColumn] ?? '—'}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-xs" style={{ color: '#C62828' }}>
                      {result.errors.join('; ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validationResults.length > 50 && (
              <div className="p-3 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Mostrando 50 de {validationResults.length} linhas
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep('mapping')}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Ajustar mapeamento
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImport}
              loading={importing}
              disabled={validCount === 0 || importing}
            >
              Importar {validCount} registro{validCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            {importResult.imported > 0 ? (
              <CheckCircle className="h-16 w-16" style={{ color: 'var(--bb-success)' }} />
            ) : (
              <XCircle className="h-16 w-16" style={{ color: '#C62828' }} />
            )}
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {importResult.imported > 0 ? 'Importação concluída!' : 'Falha na importação'}
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {importResult.imported} importado{importResult.imported !== 1 ? 's' : ''} ·{' '}
                {importResult.skipped} ignorado{importResult.skipped !== 1 ? 's' : ''}
                {importResult.errors.length > 0 &&
                  ` · ${importResult.errors.length} erro${importResult.errors.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Error details */}
          {importResult.errors.length > 0 && (
            <div className="max-h-[200px] overflow-auto" style={{ ...cardStyle, padding: '1rem' }}>
              <div style={labelStyle} className="mb-2">Detalhes dos erros</div>
              <ul className="space-y-1">
                {importResult.errors.slice(0, 20).map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-mono" style={{ color: 'var(--bb-ink-40)' }}>
                      Linha {err.row}:
                    </span>
                    <span style={{ color: '#C62828' }}>{err.message}</span>
                  </li>
                ))}
                {importResult.errors.length > 20 && (
                  <li className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    ... e mais {importResult.errors.length - 20} erros
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="mr-1 h-4 w-4" /> Nova importação
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Concluir
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
