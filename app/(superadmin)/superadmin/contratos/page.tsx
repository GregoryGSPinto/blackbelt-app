'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getSoftwareContractTemplate,
  updateSoftwareContractTemplate,
  type SoftwareContractTemplate,
} from '@/lib/api/contracts.service';

// ── Helpers ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Loading Skeleton ─────────────────────────────────────────────────

function ContratosSkeleton() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-5 w-96" />
      <Skeleton variant="card" className="h-20" />
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-40" />
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────

function EmptyTemplate({ onCriar }: { onCriar: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
        textAlign: 'center',
        background: 'var(--bb-depth-2)',
        border: '1px dashed var(--bb-glass-border)',
        borderRadius: 12,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={48}
        height={48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--bb-ink-40)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      <h2
        style={{
          marginTop: 16,
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--bb-ink-100)',
        }}
      >
        Nenhum modelo de contrato
      </h2>
      <p
        style={{
          marginTop: 8,
          fontSize: 14,
          color: 'var(--bb-ink-60)',
          maxWidth: 400,
        }}
      >
        Ainda nao existe um modelo de contrato de software cadastrado. Crie o primeiro modelo para
        gerar contratos entre a BlackBelt e as academias.
      </p>
      <button
        type="button"
        onClick={onCriar}
        style={{
          marginTop: 24,
          padding: '10px 24px',
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          background: 'var(--bb-brand)',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Criar primeiro modelo
      </button>
    </div>
  );
}

// ── Clause Row ───────────────────────────────────────────────────────

function ClauseRow({
  clauseKey,
  clauseValue,
  onChangeKey,
  onChangeValue,
  onRemove,
  readOnly,
  inputStyle,
}: {
  clauseKey: string;
  clauseValue: string;
  onChangeKey: (v: string) => void;
  onChangeValue: (v: string) => void;
  onRemove: () => void;
  readOnly: boolean;
  inputStyle: CSSProperties;
}) {
  if (readOnly) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          padding: '8px 0',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <span
          style={{
            flex: '0 0 200px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--bb-ink-80)',
            wordBreak: 'break-word',
          }}
        >
          {clauseKey}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: 'var(--bb-ink-60)',
            wordBreak: 'break-word',
          }}
        >
          {clauseValue}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="text"
        value={clauseKey}
        onChange={(e) => onChangeKey(e.target.value)}
        placeholder="Chave (ex: cancelamento)"
        style={{
          ...inputStyle,
          flex: '1 1 180px',
          minWidth: 0,
          padding: '8px 12px',
          fontSize: 13,
          borderRadius: 8,
        }}
      />
      <input
        type="text"
        value={clauseValue}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="Valor da clausula"
        style={{
          ...inputStyle,
          flex: '2 1 240px',
          minWidth: 0,
          padding: '8px 12px',
          fontSize: 13,
          borderRadius: 8,
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        title="Remover clausula"
        style={{
          flex: '0 0 auto',
          padding: '6px 10px',
          fontSize: 13,
          fontWeight: 600,
          color: '#ef4444',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Remover
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function SuperadminContratosPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<SoftwareContractTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editClauses, setEditClauses] = useState<{ key: string; value: string }[]>([]);

  // ── Load ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const data = await getSoftwareContractTemplate();
        setTemplate(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Enter edit mode ─────────────────────────────────────────────────

  function enterEditMode(tpl?: SoftwareContractTemplate | null) {
    const source = tpl ?? template;
    if (source) {
      setEditTitle(source.title);
      setEditBody(source.body_html);
      setEditClauses(
        Object.entries(source.plan_clauses).map(([key, value]) => ({ key, value })),
      );
    } else {
      setEditTitle('');
      setEditBody('');
      setEditClauses([]);
    }
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  // ── Clause helpers ──────────────────────────────────────────────────

  function addClause() {
    setEditClauses((prev) => [...prev, { key: '', value: '' }]);
  }

  function updateClauseKey(idx: number, newKey: string) {
    setEditClauses((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, key: newKey } : c)),
    );
  }

  function updateClauseValue(idx: number, newValue: string) {
    setEditClauses((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, value: newValue } : c)),
    );
  }

  function removeClause(idx: number) {
    setEditClauses((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Save ────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!editTitle.trim()) {
      toast('O titulo e obrigatorio.', 'error');
      return;
    }
    if (!editBody.trim()) {
      toast('O corpo HTML e obrigatorio.', 'error');
      return;
    }

    // Build plan_clauses from key-value pairs
    const planClauses: Record<string, string> = {};
    for (const clause of editClauses) {
      const k = clause.key.trim();
      const v = clause.value.trim();
      if (k) {
        planClauses[k] = v;
      }
    }

    setSaving(true);
    try {
      const updated = await updateSoftwareContractTemplate({
        title: editTitle.trim(),
        body_html: editBody,
        plan_clauses: planClauses,
      });
      setTemplate(updated);
      setEditing(false);
      toast('Modelo salvo com sucesso! Nova versao criada.', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────

  const inputStyle: CSSProperties = {
    width: '100%',
    background: 'var(--bb-depth-2)',
    color: 'var(--bb-ink-100)',
    border: '1px solid var(--bb-glass-border)',
    outline: 'none',
  };

  const cardStyle: CSSProperties = {
    background: 'var(--bb-depth-3)',
    border: '1px solid var(--bb-glass-border)',
    borderRadius: 12,
    padding: 20,
  };

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) return <ContratosSkeleton />;

  // ── No template — empty state ───────────────────────────────────────

  if (!template && !editing) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link
              href="/superadmin"
              style={{
                fontSize: 14,
                color: 'var(--bb-ink-40)',
                textDecoration: 'none',
              }}
            >
              SuperAdmin
            </Link>
            <span style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>/</span>
            <span style={{ fontSize: 14, color: 'var(--bb-ink-80)' }}>Contratos</span>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--bb-ink-100)',
              margin: 0,
            }}
          >
            Modelo de Contrato de Software
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: 14,
              color: 'var(--bb-ink-60)',
            }}
          >
            Gerencie o modelo de contrato entre a BlackBelt e as academias parceiras.
          </p>
        </div>

        <EmptyTemplate onCriar={() => enterEditMode(null)} />
      </div>
    );
  }

  // ── Edit mode ───────────────────────────────────────────────────────

  if (editing) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link
              href="/superadmin"
              style={{
                fontSize: 14,
                color: 'var(--bb-ink-40)',
                textDecoration: 'none',
              }}
            >
              SuperAdmin
            </Link>
            <span style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>/</span>
            <Link
              href="/superadmin/contratos"
              onClick={(e) => {
                e.preventDefault();
                cancelEdit();
              }}
              style={{
                fontSize: 14,
                color: 'var(--bb-ink-40)',
                textDecoration: 'none',
              }}
            >
              Contratos
            </Link>
            <span style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>/</span>
            <span style={{ fontSize: 14, color: 'var(--bb-ink-80)' }}>Editar</span>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--bb-ink-100)',
              margin: 0,
            }}
          >
            {template ? 'Editar Modelo de Contrato' : 'Criar Modelo de Contrato'}
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: 14,
              color: 'var(--bb-ink-60)',
            }}
          >
            {template
              ? `Versao atual: v${template.version}. Ao salvar, uma nova versao sera criada automaticamente.`
              : 'Preencha os campos abaixo para criar o primeiro modelo de contrato.'}
          </p>
        </div>

        {/* Title Input */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--bb-ink-80)',
              marginBottom: 8,
            }}
          >
            Titulo do contrato
          </label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Ex: Contrato de Licenca de Software BlackBelt"
            style={{
              ...inputStyle,
              padding: '10px 14px',
              fontSize: 14,
              borderRadius: 8,
            }}
          />
        </div>

        {/* Body HTML */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--bb-ink-80)',
              marginBottom: 8,
            }}
          >
            Corpo HTML do contrato
          </label>
          <p
            style={{
              fontSize: 12,
              color: 'var(--bb-ink-40)',
              marginBottom: 12,
            }}
          >
            Use variaveis como {'{{ACADEMY_NAME}}'}, {'{{PLAN_NAME}}'}, {'{{MONTHLY_VALUE}}'}, etc.
          </p>
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={20}
            placeholder="<h1>Contrato de Licenca de Software</h1>..."
            style={{
              ...inputStyle,
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: 'monospace',
              borderRadius: 8,
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Plan Clauses Editor */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--bb-ink-80)',
                }}
              >
                Clausulas por plano
              </label>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--bb-ink-40)',
                  marginTop: 2,
                }}
              >
                Pares chave-valor com regras especificas de cada plano.
              </p>
            </div>
            <button
              type="button"
              onClick={addClause}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--bb-brand)',
                background: 'rgba(var(--bb-brand-rgb, 99,102,241), 0.1)',
                border: '1px solid var(--bb-brand)',
                borderRadius: 8,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Adicionar clausula
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editClauses.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  padding: 24,
                  fontSize: 13,
                  color: 'var(--bb-ink-40)',
                }}
              >
                Nenhuma clausula adicionada.
              </p>
            )}
            {editClauses.map((clause, idx) => (
              <ClauseRow
                key={idx}
                clauseKey={clause.key}
                clauseValue={clause.value}
                onChangeKey={(v) => updateClauseKey(idx, v)}
                onChangeValue={(v) => updateClauseValue(idx, v)}
                onRemove={() => removeClause(idx)}
                readOnly={false}
                inputStyle={inputStyle}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bb-ink-60)',
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 8,
              cursor: 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: saving ? 'var(--bb-ink-40)' : 'var(--bb-brand)',
              border: 'none',
              borderRadius: 8,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Salvando...' : template ? 'Salvar nova versao' : 'Criar modelo'}
          </button>
        </div>
      </div>
    );
  }

  // ── View mode (template exists) ─────────────────────────────────────

  if (!template) return null;

  const clauseEntries = Object.entries(template.plan_clauses);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link
            href="/superadmin"
            style={{
              fontSize: 14,
              color: 'var(--bb-ink-40)',
              textDecoration: 'none',
            }}
          >
            SuperAdmin
          </Link>
          <span style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>/</span>
          <span style={{ fontSize: 14, color: 'var(--bb-ink-80)' }}>Contratos</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--bb-ink-100)',
              margin: 0,
            }}
          >
            Modelo de Contrato de Software
          </h1>
          <button
            type="button"
            onClick={() => enterEditMode()}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--bb-brand)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Editar modelo
          </button>
        </div>
        <p
          style={{
            marginTop: 4,
            fontSize: 14,
            color: 'var(--bb-ink-60)',
          }}
        >
          Gerencie o modelo de contrato entre a BlackBelt e as academias parceiras.
        </p>
      </div>

      {/* Template Info Card */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--bb-ink-40)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Titulo
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--bb-ink-100)',
              }}
            >
              {template.title}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--bb-ink-40)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Versao
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--bb-brand)',
                background: 'rgba(var(--bb-brand-rgb, 99,102,241), 0.1)',
                borderRadius: 20,
              }}
            >
              v{template.version}
            </span>
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--bb-ink-40)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Ultima atualizacao
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'var(--bb-ink-80)',
              }}
            >
              {formatDate(template.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* HTML Body Preview */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--bb-ink-80)',
            marginBottom: 12,
          }}
        >
          Pre-visualizacao do contrato
        </p>
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 8,
            padding: 24,
            maxHeight: 500,
            overflow: 'auto',
            color: '#1a1a1a',
            fontSize: 14,
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: template.body_html }}
        />
      </div>

      {/* Plan Clauses */}
      <div style={cardStyle}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--bb-ink-80)',
            marginBottom: 4,
          }}
        >
          Clausulas por plano
        </p>
        <p
          style={{
            fontSize: 12,
            color: 'var(--bb-ink-40)',
            marginBottom: 16,
          }}
        >
          Regras especificas vinculadas a cada plano contratado.
        </p>

        {clauseEntries.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: 24,
              fontSize: 13,
              color: 'var(--bb-ink-40)',
            }}
          >
            Nenhuma clausula cadastrada neste modelo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {clauseEntries.map(([key, value]) => (
              <ClauseRow
                key={key}
                clauseKey={key}
                clauseValue={value}
                onChangeKey={() => {}}
                onChangeValue={() => {}}
                onRemove={() => {}}
                readOnly
                inputStyle={inputStyle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
