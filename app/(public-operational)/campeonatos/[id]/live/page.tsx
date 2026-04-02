'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getLiveMatches,
  subscribeToUpdates,
  type LiveMatchDTO,
} from '@/lib/api/championship-live.service';
import { getChampionshipById, type ChampionshipDTO } from '@/lib/api/championships.service';
import { getBracketByCategory, type BracketDTO } from '@/lib/api/brackets.service';
import { BracketView } from '@/components/championship/BracketView';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LivePage() {
  const params = useParams();
  const championshipId = params.id as string;

  const [championship, setChampionship] = useState<ChampionshipDTO | null>(null);
  const [liveMatches, setLiveMatches] = useState<LiveMatchDTO[]>([]);
  const [bracket, setBracket] = useState<BracketDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    Promise.all([
      getChampionshipById(championshipId),
      getLiveMatches(championshipId),
    ])
      .then(([champ, matches]) => {
        setChampionship(champ);
        setLiveMatches(matches);
        if (champ.categories.length > 0) {
          setSelectedCategoryId(champ.categories[0].id);
        }
      })
      .finally(() => setLoading(false));

    // Subscribe to real-time updates
    const unsub = subscribeToUpdates(championshipId, (event) => {
      setLiveMatches((prev) => {
        const idx = prev.findIndex((m) => m.match_id === event.payload.match_id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = event.payload;
          return next;
        }
        return [...prev, event.payload];
      });
    });
    unsubRef.current = unsub;

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [championshipId]);

  useEffect(() => {
    if (selectedCategoryId) {
      getBracketByCategory(selectedCategoryId).then(setBracket);
    }
  }, [selectedCategoryId]);

  // Group live matches by mat
  const matchesByMat: Record<number, LiveMatchDTO[]> = {};
  liveMatches.forEach((m) => {
    if (!matchesByMat[m.mat_number]) matchesByMat[m.mat_number] = [];
    matchesByMat[m.mat_number].push(m);
  });

  // Next matches (from bracket, not yet played)
  const nextMatches = bracket?.matches
    .filter((m) => !m.winner_id && m.fighter_a_id && m.fighter_b_id)
    .sort((a, b) => {
      if (!a.scheduled_time || !b.scheduled_time) return 0;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    })
    .slice(0, 8) ?? [];

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!championship) return null;

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href={`/campeonatos/${championshipId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
              <span className="text-sm font-medium uppercase tracking-wider">Ao vivo</span>
            </div>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{championship.name}</h1>
          <p className="mt-1 text-sm text-white/70">{championship.location}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Live scoreboard per mat */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(matchesByMat).map(([matNum, matches]) => {
            const activeMatch = matches.find((m) => m.status === 'in_progress');
            const lastFinished = matches.filter((m) => m.status === 'finished').pop();
            const displayMatch = activeMatch ?? lastFinished;

            return (
              <Card key={matNum} className="overflow-hidden">
                <div className={`flex items-center justify-between px-4 py-2 ${activeMatch ? 'bg-red-600 text-white' : 'bg-bb-gray-100 text-bb-gray-600'}`}>
                  <span className="text-xs font-bold uppercase">Mat {matNum}</span>
                  {activeMatch && (
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      <span className="text-xs">{formatElapsed(activeMatch.elapsed_seconds)}</span>
                    </div>
                  )}
                  {!activeMatch && lastFinished && (
                    <span className="text-[10px]">Finalizado</span>
                  )}
                </div>

                {displayMatch ? (
                  <div className="p-4">
                    <p className="mb-2 text-center text-[10px] text-bb-gray-400">{displayMatch.category_label}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-bb-black">{displayMatch.fighter_a_name}</p>
                        <p className="mt-1 text-3xl font-bold text-bb-black">{displayMatch.score_a}</p>
                      </div>
                      <div className="px-3 text-xs text-bb-gray-400">VS</div>
                      <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-bb-black">{displayMatch.fighter_b_name}</p>
                        <p className="mt-1 text-3xl font-bold text-bb-black">{displayMatch.score_b}</p>
                      </div>
                    </div>

                    {displayMatch.winner_name && (
                      <div className="mt-3 rounded-lg bg-green-50 p-2 text-center">
                        <p className="text-xs font-medium text-green-700">
                          Vencedor: {displayMatch.winner_name}
                          {displayMatch.method ? ` (${displayMatch.method})` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-bb-gray-400">Sem luta em andamento</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Notification placeholder */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Notificações em tempo real</p>
              <p className="text-xs text-yellow-600">Você será notificado quando seu atleta estiver prestes a lutar</p>
            </div>
          </div>
        </Card>

        {/* Next matches schedule */}
        {nextMatches.length > 0 && (
          <Card className="mb-6 p-4">
            <h3 className="mb-3 text-sm font-bold text-bb-black">Próximas lutas</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {nextMatches.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-bb-gray-200 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-bb-gray-100 text-xs font-bold text-bb-gray-500">
                    M{m.mat_number}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-bb-black">
                      {m.fighter_a_name} vs {m.fighter_b_name}
                    </p>
                    {m.scheduled_time && (
                      <p className="text-[10px] text-bb-gray-400">
                        {new Date(m.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Auto-updating bracket */}
        <Card className="overflow-x-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-bb-black">Chaveamento</h3>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="rounded-lg border border-bb-gray-200 px-3 py-1.5 text-xs"
            >
              {championship.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.modality} - {cat.belt_range} - {cat.weight_range}
                </option>
              ))}
            </select>
          </div>
          {bracket ? (
            <BracketView matches={bracket.matches} totalRounds={bracket.total_rounds} />
          ) : (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
        </Card>
      </div>
    </div>
  );
}
