'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';
import {
  getActiveTemplate,
  hasAcceptedLatest,
  acceptConductCode,
  getStudentDisciplinaryRecord,
  acknowledgeSanction,
  appealSanction,
} from '@/lib/api/conduct-code.service';
import type {
  ConductTemplate,
  ConductSanction,
} from '@/lib/api/conduct-code.service';

// ── Sanction type labels (PT-BR) ────────────────────────────────────

const SANCTION_TYPE_LABELS: Record<string, string> = {
  verbal_warning: 'Advertencia Verbal',
  written_warning: 'Advertencia Escrita',
  suspension: 'Suspensao',
  ban: 'Banimento',
  community_service: 'Servico Comunitario',
  other: 'Outra',
};

const SEVERITY_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'rgba(34,197,94,0.12)', text: '#16a34a' },
  2: { bg: 'rgba(234,179,8,0.12)', text: '#ca8a04' },
  3: { bg: 'rgba(249,115,22,0.12)', text: '#ea580c' },
  4: { bg: 'rgba(239,68,68,0.12)', text: '#dc2626' },
  5: { bg: 'rgba(127,29,29,0.12)', text: '#7f1d1d' },
};

// ── Loading skeleton ────────────────────────────────────────────────

function ConductSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          height: 28,
          width: '60%',
          borderRadius: 8,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 16,
          width: '40%',
          borderRadius: 6,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 320,
          borderRadius: 12,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 48,
          borderRadius: 10,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Sanction Card ───────────────────────────────────────────────────

function SanctionCard({
  sanction,
  onAcknowledge,
  onAppeal,
}: {
  sanction: ConductSanction;
  onAcknowledge: (id: string) => void;
  onAppeal: (id: string, notes: string) => void;
}) {
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const severityInfo = SEVERITY_COLORS[sanction.severity_level] ?? SEVERITY_COLORS[1];
  const typeLabel = SANCTION_TYPE_LABELS[sanction.sanction_type] ?? sanction.sanction_type;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div
      style={{
        border: '1px solid var(--bb-glass-border)',
        borderRadius: 12,
        padding: 16,
        background: 'var(--bb-depth-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header: type badge + severity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
          }}
        >
          {typeLabel}
        </span>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: severityInfo.bg,
            color: severityInfo.text,
          }}
        >
          Nivel {sanction.severity_level}
        </span>
        {sanction.is_active && (
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: 'rgba(239,68,68,0.12)',
              color: '#dc2626',
            }}
          >
            Ativa
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: 'var(--bb-ink-80)', lineHeight: 1.5, margin: 0 }}>
        {sanction.description}
      </p>

      {/* Dates */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--bb-ink-60)' }}>
        <span>Inicio: {formatDate(sanction.start_date)}</span>
        {sanction.end_date && <span>Fim: {formatDate(sanction.end_date)}</span>}
      </div>

      {/* Appeal status */}
      {sanction.appeal_notes && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--bb-depth-3)',
            fontSize: 13,
            color: 'var(--bb-ink-60)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--bb-ink-80)' }}>Seu recurso: </span>
          {sanction.appeal_notes}
          {sanction.appeal_resolved !== undefined && (
            <span
              style={{
                display: 'block',
                marginTop: 4,
                fontSize: 11,
                fontWeight: 600,
                color: sanction.appeal_resolved ? '#16a34a' : '#ca8a04',
              }}
            >
              {sanction.appeal_resolved ? 'Recurso resolvido' : 'Recurso em analise'}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* Acknowledge button */}
        {!sanction.student_acknowledged && (
          <button
            onClick={() => onAcknowledge(sanction.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--bb-glass-border)',
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-80)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Ciente
          </button>
        )}
        {sanction.student_acknowledged && !sanction.acknowledged_at && null}
        {sanction.student_acknowledged && sanction.acknowledged_at && (
          <span style={{ fontSize: 12, color: 'var(--bb-ink-40)', alignSelf: 'center' }}>
            Ciencia em {formatDate(sanction.acknowledged_at)}
          </span>
        )}

        {/* Appeal button */}
        {!sanction.appeal_notes && (
          <button
            onClick={() => setShowAppeal(!showAppeal)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--bb-glass-border)',
              background: 'transparent',
              color: 'var(--bb-brand)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Recurso
          </button>
        )}
      </div>

      {/* Appeal form */}
      {showAppeal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={appealText}
            onChange={(e) => setAppealText(e.target.value)}
            placeholder="Descreva o motivo do seu recurso..."
            rows={3}
            style={{
              width: '100%',
              resize: 'vertical',
              borderRadius: 8,
              border: '1px solid var(--bb-glass-border)',
              background: 'var(--bb-depth-2)',
              padding: '10px 12px',
              fontSize: 13,
              color: 'var(--bb-ink-100)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={!appealText.trim() || submitting}
              onClick={async () => {
                setSubmitting(true);
                await onAppeal(sanction.id, appealText.trim());
                setSubmitting(false);
                setShowAppeal(false);
                setAppealText('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--bb-brand)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: !appealText.trim() || submitting ? 'not-allowed' : 'pointer',
                opacity: !appealText.trim() || submitting ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar Recurso'}
            </button>
            <button
              onClick={() => {
                setShowAppeal(false);
                setAppealText('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--bb-glass-border)',
                background: 'transparent',
                color: 'var(--bb-ink-60)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function CondutaPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ConductTemplate | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [acceptedDate, setAcceptedDate] = useState<string | null>(null);
  const [sanctions, setSanctions] = useState<ConductSanction[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileId = 'current-user'; // placeholder

  // ── Load data ────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        if (!academyId) {
          setError('Nao foi possivel identificar sua academia.');
          setLoading(false);
          return;
        }

        const [tpl, isAccepted] = await Promise.all([
          getActiveTemplate(academyId),
          hasAcceptedLatest(academyId, profileId),
        ]);

        if (!tpl) {
          setError('Nenhum Codigo de Conduta ativo para esta academia.');
          setLoading(false);
          return;
        }

        setTemplate(tpl);
        setAccepted(isAccepted);

        if (isAccepted) {
          // If accepted, set the accepted date from template's published_at as approximation
          // and fetch disciplinary record
          setAcceptedDate(tpl.published_at ?? tpl.created_at);

          const record = await getStudentDisciplinaryRecord(academyId, profileId);
          const activeSanctions = record.sanctions.filter((s) => s.is_active);
          setSanctions(activeSanctions);
        }
      } catch (err) {
        toast(translateError(err), 'error');
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Accept conduct code ──────────────────────────────────────────

  async function handleAccept() {
    if (!template) return;
    const academyId = getActiveAcademyId();
    if (!academyId) {
      toast('Nao foi possivel identificar sua academia.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await acceptConductCode(academyId, profileId, template.id, template.version);
      if (!result) {
        toast('Erro ao aceitar o Codigo de Conduta. Tente novamente.', 'error');
        return;
      }
      setAccepted(true);
      setAcceptedDate(result.accepted_at);
      toast('Codigo de Conduta aceito com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Acknowledge sanction ─────────────────────────────────────────

  async function handleAcknowledge(sanctionId: string) {
    try {
      const result = await acknowledgeSanction(sanctionId);
      if (!result) {
        toast('Erro ao confirmar ciencia. Tente novamente.', 'error');
        return;
      }
      setSanctions((prev) => prev.map((s) => (s.id === sanctionId ? result : s)));
      toast('Ciencia registrada com sucesso.', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Appeal sanction ──────────────────────────────────────────────

  async function handleAppeal(sanctionId: string, notes: string) {
    try {
      const result = await appealSanction(sanctionId, notes);
      if (!result) {
        toast('Erro ao enviar recurso. Tente novamente.', 'error');
        return;
      }
      setSanctions((prev) => prev.map((s) => (s.id === sanctionId ? result : s)));
      toast('Recurso enviado com sucesso.', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  if (loading) return <ConductSkeleton />;

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 48 }}>&#128220;</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--bb-ink-100)' }}>
          {error}
        </p>
        <p style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>
          Entre em contato com a administracao da academia.
        </p>
        <Link
          href="/dashboard"
          style={{
            marginTop: 8,
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--bb-brand)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // ── State 2: Already accepted ────────────────────────────────────

  if (accepted && template) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 96 }}>
        {/* Success card */}
        <div
          style={{
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 12,
            padding: 20,
            background: 'var(--bb-depth-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 24 }}>&#9989;</span>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>
              Voce ja aceitou o Codigo de Conduta (versao {template.version})
            </p>
            {acceptedDate && (
              <p style={{ fontSize: 12, color: 'var(--bb-ink-40)', margin: '4px 0 0 0' }}>
                Aceito em{' '}
                {new Date(acceptedDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Collapsible full text */}
        <div>
          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid var(--bb-glass-border)',
              background: 'var(--bb-depth-2)',
              color: 'var(--bb-ink-80)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform: showCode ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              &#9654;
            </span>
            Ver Codigo de Conduta
          </button>
          {showCode && (
            <div
              style={{
                marginTop: 8,
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--bb-glass-border)',
                background: 'var(--bb-depth-1)',
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--bb-ink-100)',
                  margin: '0 0 4px 0',
                }}
              >
                {template.title}
              </h3>
              <p style={{ fontSize: 11, color: 'var(--bb-ink-40)', margin: '0 0 12px 0' }}>
                Versao {template.version}
              </p>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--bb-ink-80)',
                  margin: 0,
                  fontFamily: 'inherit',
                }}
              >
                {template.content}
              </pre>
            </div>
          )}
        </div>

        {/* Sanctions section */}
        {sanctions.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--bb-ink-100)',
                margin: '0 0 12px 0',
              }}
            >
              Suas Sancoes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sanctions.map((s) => (
                <SanctionCard
                  key={s.id}
                  sanction={s}
                  onAcknowledge={handleAcknowledge}
                  onAppeal={handleAppeal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            color: 'var(--bb-ink-60)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
        >
          &#8592; Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // ── State 1: Not yet accepted ────────────────────────────────────

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 96 }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--bb-ink-100)',
            margin: 0,
          }}
        >
          Codigo de Conduta
        </h1>
        <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', margin: '4px 0 0 0' }}>
          Leia atentamente e aceite para continuar
        </p>
      </div>

      {/* Template info */}
      {template && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-2)',
          }}
        >
          <span style={{ fontSize: 28 }}>&#128220;</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--bb-ink-100)', margin: 0 }}>
              {template.title}
            </p>
            <p style={{ fontSize: 12, color: 'var(--bb-ink-40)', margin: '2px 0 0 0' }}>
              Versao {template.version}
            </p>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      {template && (
        <div
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-1)',
          }}
        >
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--bb-ink-80)',
              margin: 0,
              fontFamily: 'inherit',
            }}
          >
            {template.content}
          </pre>
        </div>
      )}

      {/* Checkbox */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          cursor: 'pointer',
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid var(--bb-glass-border)',
          background: 'var(--bb-depth-2)',
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{
            marginTop: 2,
            width: 18,
            height: 18,
            flexShrink: 0,
            accentColor: 'var(--bb-brand)',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 14, color: 'var(--bb-ink-80)', lineHeight: 1.4 }}>
          Li e concordo com o Codigo de Conduta
        </span>
      </label>

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={!agreed || submitting}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 10,
          border: 'none',
          background: !agreed || submitting ? 'var(--bb-depth-3)' : 'var(--bb-brand)',
          color: !agreed || submitting ? 'var(--bb-ink-40)' : '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: !agreed || submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Processando...' : 'Aceitar Codigo de Conduta'}
      </button>

      {/* Back link */}
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: 'var(--bb-ink-60)',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
      >
        &#8592; Voltar ao Dashboard
      </Link>
    </div>
  );
}
