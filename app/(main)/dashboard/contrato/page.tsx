'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getMyContracts,
  signStudentContract,
} from '@/lib/api/contracts.service';
import type {
  StudentContract,
  StudentContractStatus,
  SignatureData,
} from '@/lib/api/contracts.service';

// ── Status labels (PT-BR) ──────────────────────────────────────────

const STATUS_LABELS: Record<StudentContractStatus, string> = {
  draft: 'Rascunho',
  pending_signature: 'Pendente Assinatura',
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  renewed: 'Renovado',
};

const STATUS_COLORS: Record<StudentContractStatus, { bg: string; text: string }> = {
  draft: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280' },
  pending_signature: { bg: 'rgba(245,158,11,0.15)', text: '#d97706' },
  active: { bg: 'rgba(34,197,94,0.15)', text: '#16a34a' },
  suspended: { bg: 'rgba(249,115,22,0.15)', text: '#ea580c' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#dc2626' },
  expired: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280' },
  renewed: { bg: 'rgba(59,130,246,0.15)', text: '#2563eb' },
};

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// ── Loading skeleton ────────────────────────────────────────────────

function ContratoSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          height: 28,
          width: '55%',
          borderRadius: 8,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 14,
          width: '35%',
          borderRadius: 6,
          background: 'var(--bb-depth-3)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }}
      />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 120,
            borderRadius: 12,
            background: 'var(--bb-depth-3)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Contract Card ───────────────────────────────────────────────────

function ContractCard({
  contract,
  onSign,
}: {
  contract: StudentContract;
  onSign: (contract: StudentContract) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = STATUS_COLORS[contract.status] ?? STATUS_COLORS.draft;
  const statusLabel = STATUS_LABELS[contract.status] ?? contract.status;

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
      {/* Header row: plan name + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>
            {contract.plan_name}
          </p>
          <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', margin: 0 }}>
            {contract.modalities}
          </p>
        </div>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: statusColor.bg,
            color: statusColor.text,
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Value + dates */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--bb-ink-80)' }}>
        <span style={{ fontWeight: 600 }}>{formatCurrency(contract.monthly_value_cents)}/mes</span>
        <span>Inicio: {formatDate(contract.start_date)}</span>
        <span>Fim: {formatDate(contract.end_date)}</span>
      </div>

      {/* Signed date for active contracts */}
      {contract.status === 'active' && contract.signed_at && (
        <p style={{ fontSize: 12, color: 'var(--bb-ink-40)', margin: 0 }}>
          Assinado em {formatDate(contract.signed_at)}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {contract.status === 'pending_signature' && (
          <button
            onClick={() => onSign(contract)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--bb-brand)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Assinar Contrato
          </button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
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
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              marginRight: 6,
            }}
          >
            &#9654;
          </span>
          {expanded ? 'Ocultar Contrato' : 'Ver Contrato'}
        </button>
      </div>

      {/* Expanded contract body */}
      {expanded && contract.contract_body_html && (
        <div
          style={{
            marginTop: 4,
            padding: 16,
            borderRadius: 10,
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-1)',
            maxHeight: 400,
            overflowY: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: contract.contract_body_html }}
        />
      )}
    </div>
  );
}

// ── Sign Contract Flow ──────────────────────────────────────────────

function SignContractFlow({
  contract,
  onCancel,
  onSigned,
}: {
  contract: StudentContract;
  onCancel: () => void;
  onSigned: () => void;
}) {
  const { toast } = useToast();

  const [consents, setConsents] = useState({
    injury_waiver: false,
    medical_clearance: false,
    image_consent: false,
    lgpd_consent: false,
  });
  const [sigName, setSigName] = useState('');
  const [sigCpf, setSigCpf] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allConsentsChecked =
    consents.injury_waiver &&
    consents.medical_clearance &&
    consents.image_consent &&
    consents.lgpd_consent;

  const canSign = allConsentsChecked && sigName.trim().length >= 3 && sigCpf.replace(/\D/g, '').length === 11;

  async function handleSign() {
    if (!canSign || submitting) return;

    setSubmitting(true);
    try {
      const signatureData: SignatureData = {
        name: sigName.trim(),
        cpf: sigCpf.replace(/\D/g, ''),
        ip: '0.0.0.0', // resolved server-side in production
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };

      await signStudentContract(contract.id, signatureData, consents);
      toast('Contrato assinado com sucesso!', 'success');
      onSigned();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleConsent(key: keyof typeof consents) {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--bb-ink-100)',
            margin: 0,
          }}
        >
          Assinar Contrato
        </h2>
        <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', margin: '4px 0 0 0' }}>
          {contract.plan_name} — {formatCurrency(contract.monthly_value_cents)}/mes
        </p>
      </div>

      {/* Contract body (scrollable) */}
      {contract.contract_body_html && (
        <div
          style={{
            maxHeight: 360,
            overflowY: 'auto',
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-1)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--bb-ink-80)',
          }}
          dangerouslySetInnerHTML={{ __html: contract.contract_body_html }}
        />
      )}

      {/* Consent checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--bb-ink-100)', margin: 0 }}>
          Consentimentos obrigatorios
        </p>

        {([
          { key: 'injury_waiver' as const, label: 'Aceito o Termo de Responsabilidade por Lesoes' },
          { key: 'medical_clearance' as const, label: 'Declaro ter Atestado Medico' },
          { key: 'image_consent' as const, label: 'Autorizo o uso de minha imagem' },
          { key: 'lgpd_consent' as const, label: 'Concordo com a Politica de Privacidade (LGPD)' },
        ]).map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--bb-glass-border)',
              background: consents[key] ? 'rgba(34,197,94,0.06)' : 'var(--bb-depth-2)',
              transition: 'background 0.2s',
            }}
          >
            <input
              type="checkbox"
              checked={consents[key]}
              onChange={() => toggleConsent(key)}
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
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Signature fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--bb-ink-100)', margin: 0 }}>
          Assinatura digital
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label
            style={{ fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)' }}
          >
            Nome completo
          </label>
          <input
            type="text"
            value={sigName}
            onChange={(e) => setSigName(e.target.value)}
            placeholder="Digite seu nome completo"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--bb-glass-border)',
              background: 'var(--bb-depth-2)',
              fontSize: 14,
              color: 'var(--bb-ink-100)',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label
            style={{ fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)' }}
          >
            CPF
          </label>
          <input
            type="text"
            value={sigCpf}
            onChange={(e) => setSigCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--bb-glass-border)',
              background: 'var(--bb-depth-2)',
              fontSize: 14,
              color: 'var(--bb-ink-100)',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleSign}
          disabled={!canSign || submitting}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '14px 24px',
            borderRadius: 10,
            border: 'none',
            background: !canSign || submitting ? 'var(--bb-depth-3)' : 'var(--bb-brand)',
            color: !canSign || submitting ? 'var(--bb-ink-40)' : '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: !canSign || submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Processando...' : 'Assinar Contrato'}
        </button>

        <button
          onClick={onCancel}
          disabled={submitting}
          style={{
            padding: '14px 24px',
            borderRadius: 10,
            border: '1px solid var(--bb-glass-border)',
            background: 'transparent',
            color: 'var(--bb-ink-60)',
            fontSize: 15,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ContratoPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<StudentContract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [signingContract, setSigningContract] = useState<StudentContract | null>(null);

  const profileId = 'current-user'; // placeholder

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyContracts(profileId);
      setContracts(data);
    } catch (err) {
      toast(translateError(err), 'error');
      setError('Erro ao carregar contratos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadContracts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading state ─────────────────────────────────────────────────

  if (loading) return <ContratoSkeleton />;

  // ── Error state ───────────────────────────────────────────────────

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
        <span style={{ fontSize: 48 }}>&#128196;</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--bb-ink-100)' }}>
          {error}
        </p>
        <p style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>
          Verifique sua conexao e tente novamente.
        </p>
        <button
          onClick={loadContracts}
          style={{
            marginTop: 8,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--bb-brand)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // ── Sign flow ─────────────────────────────────────────────────────

  if (signingContract) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 96 }}>
        <SignContractFlow
          contract={signingContract}
          onCancel={() => setSigningContract(null)}
          onSigned={() => {
            setSigningContract(null);
            loadContracts();
          }}
        />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────

  if (contracts.length === 0) {
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
        <span style={{ fontSize: 48 }}>&#128196;</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--bb-ink-100)' }}>
          Nenhum contrato encontrado
        </p>
        <p style={{ fontSize: 14, color: 'var(--bb-ink-40)' }}>
          Voce ainda nao possui contratos vinculados a sua conta.
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

  // ── Contracts list ────────────────────────────────────────────────

  const pendingContracts = contracts.filter((c) => c.status === 'pending_signature');
  const otherContracts = contracts.filter((c) => c.status !== 'pending_signature');

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
          Meus Contratos
        </h1>
        <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', margin: '4px 0 0 0' }}>
          Gerencie e assine seus contratos
        </p>
      </div>

      {/* Pending signature section */}
      {pendingContracts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <span style={{ fontSize: 18 }}>&#9888;</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#d97706', margin: 0 }}>
              {pendingContracts.length === 1
                ? 'Voce possui 1 contrato pendente de assinatura'
                : `Voce possui ${pendingContracts.length} contratos pendentes de assinatura`}
            </p>
          </div>

          {pendingContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onSign={setSigningContract}
            />
          ))}
        </div>
      )}

      {/* Other contracts */}
      {otherContracts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingContracts.length > 0 && (
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--bb-ink-100)',
                margin: 0,
              }}
            >
              Historico
            </h2>
          )}

          {otherContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onSign={setSigningContract}
            />
          ))}
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
