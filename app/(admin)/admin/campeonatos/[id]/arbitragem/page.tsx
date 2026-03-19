'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  getTournaments,
  getCategories,
  getBracket,
  recordResult,
  type Tournament,
  type TournamentCategory,
  type TournamentBracket,
  type TournamentMatch,
  type MatchResult,
  type MatchMethod,
} from '@/lib/api/compete.service';
import { BracketView } from '@/components/compete/BracketView';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

const METHOD_LABELS: Record<MatchMethod, string> = {
  pontos: 'Pontos',
  submissao: 'Finalizacao',
  desistencia: 'Desistencia',
  desqualificacao: 'Desclassificacao',
  wo: 'W.O.',
  decisao_arbitro: 'Decisao do Arbitro',
};

export default function ArbitragemPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [resultModal, setResultModal] = useState<TournamentMatch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes default

  // Result form
  const [winnerId, setWinnerId] = useState('');
  const [method, setMethod] = useState<MatchMethod>('pontos');
  const [scoreA, setScoreA] = useState('0');
  const [scoreB, setScoreB] = useState('0');
  const [penaltiesA, setPenaltiesA] = useState('0');
  const [penaltiesB, setPenaltiesB] = useState('0');
  const [advantagesA, setAdvantagesA] = useState('0');
  const [advantagesB, setAdvantagesB] = useState('0');
  const [duration, setDuration] = useState('300');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      getTournaments(),
      getCategories(tournamentId),
    ])
      .then(([tournaments, cats]) => {
        const t = tournaments.find((x) => x.id === tournamentId) ?? null;
        setTournament(t);
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const loadBracket = useCallback(async () => {
    if (!selectedCategoryId) return;
    try {
      const result = await getBracket(selectedCategoryId);
      setBracket(result.bracket);
      setMatches(result.matches);
    } catch {
      setBracket(null);
      setMatches([]);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) loadBracket();
  }, [selectedCategoryId, loadBracket]);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function handleMatchClick(match: TournamentMatch) {
    if (match.winner_id) return; // already finished
    setResultModal(match);
    setWinnerId('');
    setMethod('pontos');
    setScoreA('0');
    setScoreB('0');
    setPenaltiesA('0');
    setPenaltiesB('0');
    setAdvantagesA('0');
    setAdvantagesB('0');
    setDuration(String(300 - timerSeconds));
    setNotes('');
  }

  async function handleSubmitResult() {
    if (!resultModal || !winnerId) return;
    setSubmitting(true);
    try {
      const result: MatchResult = {
        winner_id: winnerId,
        method,
        score_athlete1: Number(scoreA),
        score_athlete2: Number(scoreB),
        penalties_athlete1: Number(penaltiesA),
        penalties_athlete2: Number(penaltiesB),
        advantages_athlete1: Number(advantagesA),
        advantages_athlete2: Number(advantagesB),
        duration_seconds: Number(duration),
        notes: notes || undefined,
      };
      await recordResult(resultModal.id, result);
      await loadBracket();
      setResultModal(null);
    } finally {
      setSubmitting(false);
    }
  }

  // Separate matches by area
  const areaMatches: Record<number, TournamentMatch[]> = {};
  matches.forEach((m) => {
    if (m.area) {
      if (!areaMatches[m.area]) areaMatches[m.area] = [];
      areaMatches[m.area].push(m);
    }
  });

  // Next matches queue (not yet played)
  const nextMatches = matches
    .filter((m) => !m.winner_id && m.athlete1_id && m.athlete2_id)
    .sort((a, b) => {
      if (!a.scheduled_time || !b.scheduled_time) return 0;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    })
    .slice(0, 6);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!tournament) return null;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Arbitragem" subtitle={tournament.name} />

      {/* Category selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="rounded-lg border border-bb-gray-200 px-4 py-2 text-sm font-medium"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} - {cat.modality} - {cat.gender}
            </option>
          ))}
        </select>

        {/* Timer */}
        <div className="ml-auto flex items-center gap-3 rounded-xl border border-bb-gray-200 bg-white px-4 py-2">
          <span className={`font-mono text-2xl font-bold ${timerSeconds <= 30 ? 'text-red-600' : 'text-bb-black'}`}>
            {formatTime(timerSeconds)}
          </span>
          <div className="flex gap-1">
            <Button
              variant={timerRunning ? 'danger' : 'primary'}
              className="text-xs"
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => { setTimerRunning(false); setTimerSeconds(300); }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Area panels */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(areaMatches).map(([areaNum, areaMatchList]) => {
          const currentMatch = areaMatchList.find((m) => !m.winner_id && m.athlete1_id && m.athlete2_id);
          return (
            <Card key={areaNum} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-bb-black">Area {areaNum}</h3>
                {currentMatch && (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[10px] font-medium text-red-600">Ao vivo</span>
                  </div>
                )}
              </div>

              {currentMatch ? (
                <div className="space-y-2">
                  <div className="rounded-lg bg-bb-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-bb-black">{currentMatch.athlete1_name}</span>
                      <span className="text-lg font-bold text-bb-black">{currentMatch.score_athlete1 ?? 0}</span>
                    </div>
                    <div className="my-1 text-center text-[10px] text-bb-gray-400">vs</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-bb-black">{currentMatch.athlete2_name}</span>
                      <span className="text-lg font-bold text-bb-black">{currentMatch.score_athlete2 ?? 0}</span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => handleMatchClick(currentMatch)}
                  >
                    Registrar resultado
                  </Button>
                </div>
              ) : (
                <p className="text-center text-xs text-bb-gray-400">Sem luta em andamento</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Next matches queue */}
      {nextMatches.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold text-bb-black">Proximas lutas</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {nextMatches.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg border border-bb-gray-200 p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-bb-gray-100 text-[10px] font-bold text-bb-gray-500">
                  A{m.area}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-medium text-bb-black">{m.athlete1_name} vs {m.athlete2_name}</p>
                  {m.scheduled_time && (
                    <p className="text-bb-gray-400">
                      {new Date(m.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bracket view */}
      {bracket && matches.length > 0 && (
        <Card className="overflow-x-auto p-4">
          <h3 className="mb-4 text-sm font-bold text-bb-black">Chaveamento</h3>
          <BracketView
            matches={matches}
            categoryLabel={categories.find((c) => c.id === selectedCategoryId)?.name ?? ''}
          />
        </Card>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-bb-black">Registrar Resultado</h3>
            <p className="mt-1 text-sm text-bb-gray-500">
              {resultModal.athlete1_name} vs {resultModal.athlete2_name}
            </p>

            <div className="mt-4 space-y-4">
              {/* Winner */}
              <div>
                <label className="mb-2 block text-xs font-medium text-bb-gray-500">Vencedor</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWinnerId(resultModal.athlete1_id ?? '')}
                    className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                      winnerId === resultModal.athlete1_id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-bb-gray-200 text-bb-black hover:bg-bb-gray-50'
                    }`}
                  >
                    {resultModal.athlete1_name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinnerId(resultModal.athlete2_id ?? '')}
                    className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                      winnerId === resultModal.athlete2_id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-bb-gray-200 text-bb-black hover:bg-bb-gray-50'
                    }`}
                  >
                    {resultModal.athlete2_name}
                  </button>
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="mb-2 block text-xs font-medium text-bb-gray-500">Metodo</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(Object.entries(METHOD_LABELS) as [MatchMethod, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        method === key
                          ? 'border-bb-primary bg-bb-primary/5 text-bb-primary'
                          : 'border-bb-gray-200 text-bb-gray-500 hover:bg-bb-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-bb-gray-500">
                    Pontos {resultModal.athlete1_name?.split(' ')[0]}
                  </label>
                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-bb-gray-500">
                    Pontos {resultModal.athlete2_name?.split(' ')[0]}
                  </label>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1 block text-xs font-medium text-bb-gray-500">Duracao (segundos)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                  min="0"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-medium text-bb-gray-500">Observacoes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Triangulo, Armlock, Estrangulamento..."
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setResultModal(null)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSubmitResult} disabled={submitting || !winnerId}>
                {submitting ? 'Salvando...' : 'Confirmar resultado'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
