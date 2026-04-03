'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import type { CertificadoTeorico } from '@/lib/api/academia-teorica.service';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────
export interface CertificadoTemplateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  certificado: CertificadoTeorico;
}

// ────────────────────────────────────────────────────────────
// Belt color map for accent
// ────────────────────────────────────────────────────────────
const FAIXA_COLOR: Record<string, string> = {
  branca: '#e5e7eb',
  cinza: '#9ca3af',
  amarela: '#eab308',
  laranja: '#f97316',
  verde: '#22c55e',
  azul: '#3b82f6',
  roxa: '#a855f7',
  marrom: '#92400e',
  preta: '#1f2937',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
export const CertificadoTemplate = forwardRef<HTMLDivElement, CertificadoTemplateProps>(
  ({ certificado, className, ...props }, ref) => {
    const accentColor = FAIXA_COLOR[certificado.faixa.toLowerCase()] ?? 'var(--bb-brand-primary)';

    return (
      <div
        ref={ref}
        className={cn(
          'relative mx-auto w-full max-w-xl overflow-hidden rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] shadow-[var(--bb-shadow-lg)]',
          className,
        )}
        {...props}
      >
        {/* ── Decorative border ── */}
        <div
          className="absolute inset-0 rounded-[var(--bb-radius-lg)] ring-4"
          style={{ borderColor: accentColor, boxShadow: `inset 0 0 0 4px ${accentColor}30` }}
        />

        {/* ── Inner padding ── */}
        <div className="relative px-6 py-8 sm:px-10 sm:py-12">
          {/* ── Top accent bar ── */}
          <div
            className="mx-auto mb-6 h-1 w-32 rounded-full"
            style={{ backgroundColor: accentColor }}
          />

          {/* ── Header ── */}
          <div className="text-center">
            <h2
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: accentColor }}
            >
              BlackBelt
            </h2>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--bb-ink-100)] sm:text-3xl">
              Certificado Teorico
            </h1>
          </div>

          {/* ── Divider ── */}
          <div className="mx-auto my-6 h-px w-3/4 bg-[var(--bb-glass-border)]" />

          {/* ── Body ── */}
          <div className="text-center">
            <p className="text-sm text-[var(--bb-ink-60)]">Certificamos que</p>
            <p className="mt-2 text-xl font-extrabold text-[var(--bb-ink-100)] sm:text-2xl">
              {certificado.alunoNome}
            </p>
            <p className="mt-3 text-sm text-[var(--bb-ink-60)]">
              completou com exito o modulo
            </p>
            <p className="mt-2 text-base font-bold text-[var(--bb-ink-100)]">
              &ldquo;{certificado.moduloTitulo} &mdash; Faixa {certificado.faixa}&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
              com aproveitamento de{' '}
              <span className="font-bold text-[var(--bb-ink-100)]">{certificado.nota}%</span>
            </p>
          </div>

          {/* ── Divider ── */}
          <div className="mx-auto my-6 h-px w-3/4 bg-[var(--bb-glass-border)]" />

          {/* ── Details ── */}
          <div className="space-y-2 text-center text-sm">
            <div className="flex items-center justify-center gap-2 text-[var(--bb-ink-60)]">
              <span className="font-medium text-[var(--bb-ink-80)]">Academia:</span>
              <span>{certificado.academiaNome}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[var(--bb-ink-60)]">
              <span className="font-medium text-[var(--bb-ink-80)]">Professor:</span>
              <span>{certificado.professorNome}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[var(--bb-ink-60)]">
              <span className="font-medium text-[var(--bb-ink-80)]">Data:</span>
              <span>{formatDate(certificado.emitidoEm)}</span>
            </div>
          </div>

          {/* ── Verification ── */}
          <div className="mt-6 rounded-lg bg-[var(--bb-depth-1)] p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--bb-ink-40)]">
              Verificar autenticidade
            </p>
            <p className="mt-1 text-xs font-mono text-[var(--bb-ink-60)] break-all">
              blackbelts.com.br/verificar/{certificado.codigoVerificacao}
            </p>
          </div>

          {/* ── Bottom accent bar ── */}
          <div
            className="mx-auto mt-6 h-1 w-32 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    );
  },
);

CertificadoTemplate.displayName = 'CertificadoTemplate';
