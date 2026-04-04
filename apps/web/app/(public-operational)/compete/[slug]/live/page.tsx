'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getLiveMatches,
  getNextMatches,
  getFeed,
  type Tournament,
  type TournamentMatch,
  type TournamentFeedItem,
} from '@/lib/api/compete.service';
import {
  AwardIcon,
  ClockIcon,
} from '@/components/shell/icons';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function MatchCard({ match, isLive }: { match: TournamentMatch; isLive: boolean }) {
  const isFinished = match.status === 'completed';

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: 'var(--bb-depth-2)',
        border: isLive ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-lg)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: isLive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
          Rodada {match.round}
        </span>
        <div className="flex items-center gap-2">
          {match.area != null && (
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              Area {match.area}
            </span>
          )}
          {isLive && (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-red-600" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              AO VIVO
            </span>
          )}
        </div>
      </div>

      {/* Fighters */}
      <div className="p-4">
        {/* Fighter A */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{
              backgroundColor: match.winner_id === match.athlete1_id ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
              color: match.winner_id === match.athlete1_id ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            {match.athlete1_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: match.winner_id === match.athlete1_id ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}
            >
              {match.athlete1_name ?? 'A definir'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-center">
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--bb-ink-100)' }}>{match.score_athlete1}</p>
            </div>
            <div className="flex gap-2">
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>V</p>
                <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-80)' }}>{match.advantages_athlete1}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>P</p>
                <p className="text-sm font-bold" style={{ color: match.penalties_athlete1 > 0 ? '#dc2626' : 'var(--bb-ink-80)' }}>{match.penalties_athlete1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-2">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--bb-glass-border)' }} />
          <span className="text-[10px] font-bold" style={{ color: 'var(--bb-ink-40)' }}>VS</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--bb-glass-border)' }} />
        </div>

        {/* Fighter B */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{
              backgroundColor: match.winner_id === match.athlete2_id ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
              color: match.winner_id === match.athlete2_id ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            {match.athlete2_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: match.winner_id === match.athlete2_id ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}
            >
              {match.athlete2_name ?? 'A definir'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-center">
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--bb-ink-100)' }}>{match.score_athlete2}</p>
            </div>
            <div className="flex gap-2">
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>V</p>
                <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-80)' }}>{match.advantages_athlete2}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>P</p>
                <p className="text-sm font-bold" style={{ color: match.penalties_athlete2 > 0 ? '#dc2626' : 'var(--bb-ink-80)' }}>{match.penalties_athlete2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timer / Result */}
        <div className="mt-3 text-center">
          {isLive && match.duration_seconds != null && (
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--bb-brand)' }}>
              {formatTime(match.duration_seconds)}
            </p>
          )}
          {isFinished && match.method && (
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              {match.athlete1_name && match.winner_id === match.athlete1_id ? match.athlete1_name : match.athlete2_name} venceu por {match.method}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [liveMatches, setLiveMatches] = useState<TournamentMatch[]>([]);
  const [nextMatches, setNextMatches] = useState<TournamentMatch[]>([]);
  const [feed, setFeed] = useState<TournamentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      const t = await getTournament(slug);
      setTournament(t);
      const [live, next, f] = await Promise.all([
        getLiveMatches(t.id),
        getNextMatches(t.id),
        getFeed(t.id),
      ]);
      setLiveMatches(live);
      setNextMatches(next);
      setFeed(f);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando placar ao vivo...</p>
      </div>
    );
  }

  // Group live matches by area
  const areas = Array.from(new Set(liveMatches.map((m) => m.area ?? 0))).sort();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div
        className="border-b px-4 py-4 sm:px-6"
        style={{ borderColor: 'var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <Link href={`/compete/${slug}`} className="text-xs hover:underline" style={{ color: 'var(--bb-ink-40)' }}>
              {tournament?.name}
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
              Placar Ao Vivo
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            <ClockIcon className="h-3.5 w-3.5" />
            Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main: Live matches */}
          <div>
            {liveMatches.length === 0 ? (
              <div className="py-16 text-center">
                <AwardIcon className="mx-auto h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
                <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                  Nenhuma luta em andamento
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Aguarde o inicio das proximas lutas
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {areas.map((area) => {
                  const areaMatches = liveMatches.filter((m) => (m.area ?? 0) === area);
                  return areaMatches.map((match) => (
                    <MatchCard key={match.id} match={match} isLive />
                  ));
                })}
              </div>
            )}

            {/* Next matches */}
            {nextMatches.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  Proximas lutas
                </h2>
                <div className="space-y-2">
                  {nextMatches.slice(0, 8).map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-lg p-3"
                      style={{
                        backgroundColor: 'var(--bb-depth-2)',
                        border: '1px solid var(--bb-glass-border)',
                        borderRadius: 'var(--bb-radius-sm)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {match.area != null && (
                          <span className="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-40)' }}>
                            A{match.area}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                            {match.athlete1_name ?? 'A definir'} <span style={{ color: 'var(--bb-ink-40)' }}>vs</span> {match.athlete2_name ?? 'A definir'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Rodada {match.round}</p>
                        </div>
                      </div>
                      {match.scheduled_time && (
                        <span className="flex-shrink-0 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                          {new Date(match.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Live feed */}
          <div
            className="hidden h-fit rounded-xl lg:block"
            style={{
              backgroundColor: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--bb-glass-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Feed ao vivo</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-4">
              {feed.length === 0 ? (
                <p className="py-8 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhum evento ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {feed.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              item.type === 'result' || item.type === 'medal'
                                ? 'var(--bb-brand)'
                                : item.type === 'announcement'
                                ? '#16a34a'
                                : 'var(--bb-ink-40)',
                          }}
                        />
                        <div className="w-px flex-1" style={{ backgroundColor: 'var(--bb-glass-border)' }} />
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-80)' }}>{item.title}</p>
                        {item.content && (
                          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{item.content}</p>
                        )}
                        <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                          {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
