'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { getByAcademia } from '@/lib/api/ranking.service';
import { getXP } from '@/lib/api/xp.service';
import type { RankedStudent, XPDTO } from '@/lib/api/xp.service';

// ── Medal emojis ────────────────────────────────────────────────
const MEDAL_EMOJIS: Record<number, string> = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' };

const BELT_COLORS: Record<string, string> = {
  white: 'var(--bb-ink-20)',
  gray: 'var(--bb-ink-40)',
  yellow: 'var(--bb-warning)',
  orange: 'var(--bb-warning)',
  green: 'var(--bb-success)',
  blue: 'var(--bb-brand)',
  purple: 'var(--bb-brand)',
  brown: 'var(--bb-ink-60)',
  black: 'var(--bb-ink-100)',
};

const BELT_LABELS: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

// ── Tabs ────────────────────────────────────────────────────────
type RankingTab = 'geral' | 'mensal' | 'semanal';

interface RankingData {
  ranking: RankedStudent[];
  myXP: XPDTO;
}

export default function DashboardRankingPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [tab, setTab] = useState<RankingTab>('geral');

  const academyId = getActiveAcademyId();

  const { data, loading } = useSWRFetch<RankingData>(
    !studentLoading && studentId && academyId ? `dashboard-ranking-${academyId}-${studentId}` : null,
    async () => {
      const [ranking, myXP] = await Promise.all([
        getByAcademia(academyId),
        getXP(studentId!),
      ]);
      return { ranking, myXP };
    },
  );

  if (loading || studentLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-24" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    );
  }

  const ranking = data?.ranking ?? [];
  const myXP = data?.myXP;

  if (ranking.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon="\u{1F3C6}"
          title="Nenhum ranking disponivel"
          description="O ranking sera exibido quando houver dados suficientes."
          variant="default"
        />
      </div>
    );
  }

  // Sort by XP descending and assign rank
  const sorted = [...ranking].sort((a, b) => b.xp - a.xp).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    is_current_user: entry.student_id === studentId,
  }));

  // Find current user position
  const myEntry = sorted.find((e) => e.is_current_user);

  const tabs: { key: RankingTab; label: string }[] = [
    { key: 'geral', label: 'Geral' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'semanal', label: 'Semanal' },
  ];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Ranking da Academia
      </h1>

      {/* My position card */}
      {myEntry && myXP && (
        <Card variant="elevated" className="p-4" style={{ border: '2px solid var(--bb-brand)', background: 'var(--bb-brand-surface)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                Sua posicao
              </p>
              <p className="mt-1 text-3xl font-bold" style={{ color: 'var(--bb-brand)' }}>
                #{myEntry.rank}
              </p>
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                de {sorted.length} alunos
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {myXP.xp.toLocaleString('pt-BR')} XP
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Nivel {myXP.level}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab selector */}
      <div
        className="flex gap-1 p-1"
        style={{ background: 'var(--bb-depth-3)', borderRadius: 'var(--bb-radius-lg)' }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-sm font-semibold transition-colors"
            style={{
              borderRadius: 'var(--bb-radius-md)',
              ...(tab === t.key
                ? { background: 'var(--bb-brand)', color: '#fff' }
                : { color: 'var(--bb-ink-60)' }),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div className="space-y-2">
        {sorted.map((entry) => (
          <Card
            key={entry.student_id}
            style={{
              ...(entry.is_current_user
                ? { border: '2px solid var(--bb-brand)', background: 'var(--bb-brand-surface)' }
                : {}),
            }}
          >
            <div className="flex items-center gap-3 p-3">
              {/* Rank */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold"
                style={{ borderRadius: 'var(--bb-radius-md)', color: 'var(--bb-ink-80)' }}
              >
                {MEDAL_EMOJIS[entry.rank] ?? `#${entry.rank}`}
              </div>

              {/* Avatar */}
              <Avatar name={entry.display_name} size="sm" />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: entry.is_current_user ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}
                >
                  {entry.display_name}
                  {entry.is_current_user && ' (voce)'}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: BELT_COLORS[entry.belt] ?? 'var(--bb-ink-40)' }}
                  />
                  <span>{BELT_LABELS[entry.belt] ?? entry.belt}</span>
                  <span>{entry.xp.toLocaleString('pt-BR')} XP</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
