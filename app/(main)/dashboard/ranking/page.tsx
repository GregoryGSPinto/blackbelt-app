'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { EmptyState } from '@/components/ui/EmptyState';

// ── Mock ranking data ──────────────────────────────────────────────
interface RankingEntry {
  student_id: string;
  display_name: string;
  avatar: string | null;
  xp: number;
  rank: number;
  is_current_user: boolean;
  belt: string;
  streak_days: number;
}

const MOCK_RANKING: RankingEntry[] = [
  { student_id: 'stu-1', display_name: 'Sophia Martins', avatar: null, xp: 4200, rank: 1, is_current_user: false, belt: 'purple', streak_days: 21 },
  { student_id: 'stu-2', display_name: 'Pedro Oliveira', avatar: null, xp: 3800, rank: 2, is_current_user: false, belt: 'blue', streak_days: 14 },
  { student_id: 'stu-3', display_name: 'Ana Silva', avatar: null, xp: 3500, rank: 3, is_current_user: false, belt: 'blue', streak_days: 10 },
  { student_id: 'stu-current', display_name: 'Voce', avatar: null, xp: 3100, rank: 4, is_current_user: true, belt: 'green', streak_days: 5 },
  { student_id: 'stu-5', display_name: 'Gabriel Costa', avatar: null, xp: 2800, rank: 5, is_current_user: false, belt: 'green', streak_days: 7 },
  { student_id: 'stu-6', display_name: 'Julia Santos', avatar: null, xp: 2500, rank: 6, is_current_user: false, belt: 'orange', streak_days: 3 },
  { student_id: 'stu-7', display_name: 'Matheus Lima', avatar: null, xp: 2200, rank: 7, is_current_user: false, belt: 'orange', streak_days: 0 },
  { student_id: 'stu-8', display_name: 'Isabella Souza', avatar: null, xp: 1900, rank: 8, is_current_user: false, belt: 'yellow', streak_days: 2 },
];

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

async function fetchRanking(): Promise<RankingEntry[]> {
  // Simulates API delay
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_RANKING;
}

// ── Tabs ───────────────────────────────────────────────────────────
type RankingTab = 'geral' | 'mensal' | 'semanal';

export default function DashboardRankingPage() {
  const { data: ranking, loading } = useSWRFetch<RankingEntry[]>(
    'dashboard-ranking',
    fetchRanking,
  );
  const [tab, setTab] = useState<RankingTab>('geral');

  if (loading || !ranking) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    );
  }

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
        {ranking.map((entry) => (
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
                  <span>{entry.xp.toLocaleString('pt-BR')} XP</span>
                  {entry.streak_days > 0 && (
                    <span>{entry.streak_days}d streak</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
