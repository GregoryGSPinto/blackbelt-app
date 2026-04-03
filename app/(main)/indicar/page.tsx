'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  getReferralCode,
  getReferralStats,
  listReferrals,
} from '@/lib/api/referral.service';
import type {
  ReferralCode,
  ReferralStats,
  Referral,
} from '@/lib/api/referral.service';
import {
  CopyIcon,
  CheckIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// -- Constants ----------------------------------------------------------------

const GREEN = '#22c55e';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const GRAY = '#6b7280';
const PURPLE = '#a855f7';

const cardStyle = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  boxShadow: 'var(--bb-shadow-sm)',
};

// -- Helpers ------------------------------------------------------------------

const STATUS_CONFIG: Record<Referral['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: AMBER },
  trial: { label: 'Em Trial', color: '#3b82f6' },
  converted: { label: 'Convertido', color: GREEN },
  expired: { label: 'Expirado', color: GRAY },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildWhatsAppUrl(code: string): string {
  const message = encodeURIComponent(
    `Quer gerenciar sua academia com a melhor plataforma? Use meu codigo de indicacao: ${code} e ganhe desconto! Acesse: https://blackbelts.com.br/ref/${code}`,
  );
  return `https://wa.me/?text=${message}`;
}

// -- Placeholder student ID (would come from auth context in production) ------
const STUDENT_ACADEMY_ID = getActiveAcademyId();

// -- Component ----------------------------------------------------------------

export default function IndicarPage() {
  const { toast } = useToast();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // -- Data Loading -----------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [codeData, statsData, referralsList] = await Promise.all([
        getReferralCode(STUDENT_ACADEMY_ID),
        getReferralStats(STUDENT_ACADEMY_ID),
        listReferrals(STUDENT_ACADEMY_ID),
      ]);
      setCode(codeData);
      setStats(statsData);
      setReferrals(referralsList);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -- Copy to clipboard ------------------------------------------------------

  const handleCopy = useCallback(async () => {
    if (!code) return;
    const link = `https://blackbelts.com.br/ref/${code.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Link copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [code, toast]);

  // -- Skeleton ---------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-24">
        <Skeleton variant="card" className="h-40" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <Skeleton variant="card" className="h-16" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const referralLink = code ? `https://blackbelts.com.br/ref/${code.code}` : '';

  return (
    <div className="space-y-5 p-4 pb-24">
      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div
          className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
          style={{ background: RED }}
        />
        <div
          className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full opacity-15"
          style={{ background: AMBER }}
        />
        <div className="relative">
          <span className="text-4xl">🤝</span>
          <h1
            className="mt-2 text-2xl font-bold"
            style={{ color: '#ffffff' }}
          >
            Indique e Ganhe
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Convide amigos e ganhe recompensas exclusivas
          </p>
          {code && (
            <div
              className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Seu codigo:
              </span>
              <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                {code.code}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="mb-2 flex items-center gap-2">
              <UsersIcon className="h-4 w-4" style={{ color: '#3b82f6' }} />
              <span className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                Convidados
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {stats.totalReferrals}
            </p>
          </div>

          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                Convertidos
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: GREEN }}>
              {stats.convertedReferrals}
            </p>
          </div>

          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="mb-2 flex items-center gap-2">
              <ClockIcon className="h-4 w-4" style={{ color: AMBER }} />
              <span className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                Pendentes
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: AMBER }}>
              {stats.pendingRewards}
            </p>
          </div>

          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="mb-2 flex items-center gap-2">
              <StarIcon className="h-4 w-4" style={{ color: PURPLE }} />
              <span className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                Meses Ganhos
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: PURPLE }}>
              {stats.rewardMonthsEarned}
            </p>
          </div>
        </div>
      )}

      {/* ── REFERRAL LINK ───────────────────────────────────────────── */}
      {code && (
        <div className="rounded-xl p-4" style={cardStyle}>
          <p
            className="mb-2 text-xs font-semibold uppercase"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Seu link de indicacao
          </p>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 overflow-hidden rounded-lg px-3 py-2.5"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p
                className="truncate text-sm"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                {referralLink}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95"
              style={{
                background: copied ? `${GREEN}18` : 'var(--bb-depth-2)',
                border: `1px solid ${copied ? GREEN : 'var(--bb-glass-border)'}`,
              }}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4" style={{ color: GREEN }} />
              ) : (
                <CopyIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
              )}
            </button>
          </div>

          {/* Share buttons */}
          <div className="mt-3 flex gap-2">
            <a
              href={buildWhatsAppUrl(code.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: '#25D366',
                color: '#ffffff',
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
              }}
            >
              <CopyIcon className="h-4 w-4" />
              Copiar Link
            </button>
          </div>
        </div>
      )}

      {/* ── REFERRALS LIST ──────────────────────────────────────────── */}
      <div>
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Suas Indicacoes
        </h2>

        {referrals.length === 0 ? (
          <div className="rounded-xl py-10 text-center" style={cardStyle}>
            <span className="text-3xl">📨</span>
            <p className="mt-2 text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma indicacao ainda
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Compartilhe seu link e comece a ganhar recompensas!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((referral) => {
              const statusConfig = STATUS_CONFIG[referral.status];
              return (
                <div
                  key={referral.id}
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{
                    ...cardStyle,
                    borderLeft: `3px solid ${statusConfig.color}`,
                  }}
                >
                  {/* Avatar placeholder */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: `${statusConfig.color}15`,
                      color: statusConfig.color,
                    }}
                  >
                    {referral.referredAcademyName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {referral.referredAcademyName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatDate(referral.createdAt)}
                      {referral.convertedAt && (
                        <span> &middot; Convertido em {formatDate(referral.convertedAt)}</span>
                      )}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{
                      background: `${statusConfig.color}15`,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
