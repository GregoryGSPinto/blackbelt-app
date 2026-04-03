'use client';

import { forwardRef } from 'react';
import {
  TrophyIcon,
  AwardIcon,
} from '@/components/shell/icons';

// ── Types ──────────────────────────────────────────────────────────────

interface SocialCardProps {
  tournamentName: string;
  categoryLabel: string;
  winnerName: string;
  winnerAcademy: string;
  method: string;
  medal: 'gold' | 'silver' | 'bronze';
}

// ── Constants ──────────────────────────────────────────────────────────

const MEDAL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  gold: { color: '#FFD700', bg: 'rgba(255,215,0,0.15)', label: 'OURO' },
  silver: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)', label: 'PRATA' },
  bronze: { color: '#CD7F32', bg: 'rgba(205,127,50,0.15)', label: 'BRONZE' },
};

// ── Component ──────────────────────────────────────────────────────────

const SocialCard = forwardRef<HTMLDivElement, SocialCardProps>(
  function SocialCard({ tournamentName, categoryLabel, winnerName, winnerAcademy, method, medal }, ref) {
    const medalConfig = MEDAL_CONFIG[medal];

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bb-depth-2)',
          border: `2px solid ${medalConfig.color}`,
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        {/* Background decorative gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at top right, ${medalConfig.color}, transparent 60%)`,
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          {/* Top: Tournament info */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                {tournamentName}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {categoryLabel}
              </p>
            </div>

            {/* Medal badge */}
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: medalConfig.bg }}
            >
              <AwardIcon className="h-4 w-4" style={{ color: medalConfig.color }} />
              <span className="text-xs font-bold" style={{ color: medalConfig.color }}>
                {medalConfig.label}
              </span>
            </div>
          </div>

          {/* Center: Winner info */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Medal icon */}
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: medalConfig.bg }}
            >
              <TrophyIcon className="h-7 w-7" style={{ color: medalConfig.color }} />
            </div>

            <p
              className="text-xl sm:text-2xl font-extrabold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {winnerName}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {winnerAcademy}
            </p>
            {method && (
              <p
                className="mt-2 rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
              >
                {method}
              </p>
            )}
          </div>

          {/* Bottom: BlackBelt branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ background: 'var(--bb-brand)', opacity: 0.9 }}
              >
                <span className="text-[8px] font-extrabold text-white">BB</span>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--bb-ink-40)' }}>
                Powered by BlackBelt
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--bb-ink-30)' }}>
              blackbeltv2.vercel.app
            </span>
          </div>
        </div>
      </div>
    );
  },
);

SocialCard.displayName = 'SocialCard';

export { SocialCard };
