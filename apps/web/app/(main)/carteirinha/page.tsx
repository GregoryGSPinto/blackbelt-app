'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStudentCard, type StudentCard } from '@/lib/api/access-control.service';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/lib/hooks/useToast';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { translateError } from '@/lib/utils/error-translator';
import { shareContent } from '@/lib/utils/share';
import { Share2, Printer, Shield, QrCode } from 'lucide-react';

// ── Belt color mapping ─────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  Branca: '#FFFFFF',
  Cinza: '#9CA3AF',
  Amarela: '#EAB308',
  Laranja: '#F97316',
  Verde: '#22C55E',
  Azul: '#3B82F6',
  Roxa: '#8B5CF6',
  Marrom: '#92400E',
  Preta: '#1F2937',
  Coral: '#F43F5E',
  Vermelha: '#DC2626',
};

const BELT_TEXT_ON: Record<string, string> = {
  Branca: 'var(--bb-ink-100)',
  Cinza: '#FFFFFF',
  Amarela: 'var(--bb-ink-100)',
  Laranja: '#FFFFFF',
  Verde: '#FFFFFF',
  Azul: '#FFFFFF',
  Roxa: '#FFFFFF',
  Marrom: '#FFFFFF',
  Preta: '#FFFFFF',
  Coral: '#FFFFFF',
  Vermelha: '#FFFFFF',
};

// ── QR Code SVG ────────────────────────────────────────────────────────

function QRCodeDisplay({ token, size = 180 }: { token: string; size?: number }) {
  const cells = 21;
  const cellSize = size / cells;
  const hash = token.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div className="mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
        <rect width={size} height={size} fill="white" rx={8} />
        {Array.from({ length: cells }, (_, row) =>
          Array.from({ length: cells }, (__, col) => {
            const isFinderTL = row < 7 && col < 7;
            const isFinderTR = row < 7 && col >= cells - 7;
            const isFinderBL = row >= cells - 7 && col < 7;
            const isFinder = isFinderTL || isFinderTR || isFinderBL;

            let filled = false;
            if (isFinder) {
              const lr = isFinderTL ? row : isFinderTR ? row : row - (cells - 7);
              const lc = isFinderTL ? col : isFinderTR ? col - (cells - 7) : col;
              const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
              const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
              filled = outer || inner;
            } else {
              filled = ((hash + row * 31 + col * 17) % 3) !== 0;
            }

            return filled ? (
              <rect
                key={`${row}-${col}`}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1F2937"
                rx={1}
              />
            ) : null;
          }),
        )}
      </svg>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function CarteirinhaPage() {
  const { toast } = useToast();
  const { studentId, loading: studentIdLoading } = useStudentId();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<StudentCard | null>(null);
  const [countdown, setCountdown] = useState('');

  const loadCard = useCallback(() => {
    if (!studentId) return;
    getStudentCard(studentId)
      .then(setCard)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [studentId, toast]);

  useEffect(() => {
    if (studentIdLoading) return;
    if (!studentId) {
      setLoading(false);
      return;
    }
    loadCard();
  }, [studentId, studentIdLoading, loadCard]);

  // Auto-renew QR code countdown
  useEffect(() => {
    if (!card) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(card.qr_code_expires).getTime();
      const remaining = Math.max(0, expiresAt - Date.now());

      if (remaining <= 0) {
        loadCard();
        return;
      }

      const min = Math.floor(remaining / 60000);
      const sec = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${min}:${sec.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [card, loadCard]);

  // ── Share handler ─────────────────────────────────────────────────

  async function handleShare() {
    if (!card) return;
    const shared = await shareContent({
      title: 'Minha Carteirinha BlackBelt',
      text: `${card.student_name} - Faixa ${card.belt} | ${card.academy}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    if (shared) {
      toast('Compartilhado com sucesso!', 'success');
    }
  }

  // ── Print handler ─────────────────────────────────────────────────

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  // ── Loading / empty states ────────────────────────────────────────

  if (loading || studentIdLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Shield className="h-12 w-12 text-[var(--bb-ink-20)]" />
        <h2 className="mt-4 text-lg font-bold text-[var(--bb-ink-100)]">Carteirinha indisponivel</h2>
        <p className="mt-1 text-sm text-[var(--bb-ink-40)]">
          Nao foi possivel carregar sua carteirinha digital.
        </p>
      </div>
    );
  }

  const beltColor = BELT_COLORS[card.belt] || '#3B82F6';
  const beltTextColor = BELT_TEXT_ON[card.belt] || '#FFFFFF';
  const isActive = card.membership_active;
  const memberSince = new Date(card.member_since).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 px-4 pb-24 pt-4">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">Carteirinha Digital</h1>
      </div>

      {/* ── ID Card ──────────────────────────────────────────────── */}
      <div
        className="relative mx-auto w-full max-w-sm overflow-hidden print:max-w-none print:shadow-none"
        style={{
          borderRadius: 'var(--bb-radius-xl, 16px)',
          border: '1px solid var(--bb-glass-border)',
          background: 'var(--bb-depth-2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Card Header — brand gradient */}
        <div
          className="relative px-5 pb-14 pt-5"
          style={{ background: 'var(--bb-brand-gradient)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Carteirinha do Aluno
              </p>
              <p className="mt-0.5 text-sm font-bold text-white">{card.academy}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Avatar — overlapping the header */}
        <div className="relative -mt-10 flex justify-center">
          <div
            className="rounded-full p-1"
            style={{
              background: 'var(--bb-depth-2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Avatar
              name={card.student_name}
              src={card.photo_url}
              size="xl"
              className="ring-2"
              style={{ '--tw-ring-color': beltColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Student Info */}
        <div className="px-5 pt-3 text-center">
          <h2 className="text-lg font-bold text-[var(--bb-ink-100)]">{card.student_name}</h2>

          {/* Belt stripe */}
          <div className="mx-auto mt-2 flex items-center justify-center gap-2">
            <div
              className="h-4 w-20 rounded-full"
              style={{
                backgroundColor: beltColor,
                border: card.belt === 'Branca' ? '1px solid var(--bb-glass-border)' : 'none',
                boxShadow: `0 2px 8px ${beltColor}40`,
              }}
            />
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: beltColor,
                color: beltTextColor,
                border: card.belt === 'Branca' ? '1px solid var(--bb-glass-border)' : 'none',
              }}
            >
              Faixa {card.belt}
            </span>
          </div>

          {/* Modalities */}
          {card.modalities && card.modalities.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {card.modalities.map((mod) => (
                <span
                  key={mod}
                  className="rounded-full px-3 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: 'var(--bb-depth-3, #f3f4f6)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-5 my-4" style={{ borderTop: '1px dashed var(--bb-glass-border)' }} />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bb-ink-30)]">
              Membro desde
            </p>
            <p className="mt-0.5 text-sm font-medium text-[var(--bb-ink-80)]">{memberSince}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bb-ink-30)]">
              ID do Aluno
            </p>
            <p className="mt-0.5 font-mono text-sm font-medium text-[var(--bb-ink-80)]">
              {card.student_id}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bb-ink-30)]">
              Unidade
            </p>
            <p className="mt-0.5 text-sm font-medium text-[var(--bb-ink-80)]">{card.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bb-ink-30)]">
              Status
            </p>
            <div className="mt-0.5 flex items-center justify-end gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? '#22C55E' : '#EF4444' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: isActive ? '#22C55E' : '#EF4444' }}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 my-4" style={{ borderTop: '1px dashed var(--bb-glass-border)' }} />

        {/* QR Code section */}
        <div className="px-5 pb-5 text-center">
          {isActive ? (
            <>
              <div
                className="mx-auto inline-block rounded-xl p-3"
                style={{ backgroundColor: 'var(--bb-depth-1, #fafafa)' }}
              >
                <QRCodeDisplay token={card.qr_code_token} size={160} />
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[var(--bb-ink-40)]">
                <QrCode className="h-3.5 w-3.5" />
                <p className="text-xs">Apresente para check-in</p>
              </div>
              <p className="mt-1 text-[10px] text-[var(--bb-ink-30)]">
                Atualiza em {countdown || '...'}
              </p>
            </>
          ) : (
            <div className="rounded-xl py-8" style={{ backgroundColor: 'var(--bb-depth-1, #fafafa)' }}>
              <Shield className="mx-auto h-10 w-10 text-[var(--bb-ink-20)]" />
              <p className="mt-2 text-sm font-semibold" style={{ color: '#EF4444' }}>
                Matricula Inativa
              </p>
              <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                Regularize sua situacao para acessar a academia.
              </p>
            </div>
          )}
        </div>

        {/* Validity footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderTop: '1px solid var(--bb-glass-border)',
            backgroundColor: 'var(--bb-depth-1, #fafafa)',
          }}
        >
          <span className="text-[10px] text-[var(--bb-ink-30)]">BlackBelt Academy</span>
          <span className="text-[10px] text-[var(--bb-ink-30)]">
            Valida ate {new Date(card.membership_expires).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-sm gap-3 print:hidden">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 gap-2"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* ── Student ID footer ────────────────────────────────────── */}
      <p className="text-center text-[10px] text-[var(--bb-ink-30)] print:hidden">
        ID: {card.student_id}
      </p>
    </div>
  );
}
