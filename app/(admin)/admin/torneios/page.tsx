'use client';

import { useEffect, useState } from 'react';
import { listTournaments, getBracket, type TournamentDTO, type BracketMatch } from '@/lib/api/tournaments.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

export default function TorneiosAdminPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentDTO[]>([]);
  const [bracket, setBracket] = useState<BracketMatch[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    listTournaments(getActiveAcademyId()).then(setTournaments).finally(() => setLoading(false));
  }, []);

  async function handleViewBracket(id: string) {
    setSelectedTournament(id);
    const b = await getBracket(id, 'all');
    setBracket(b);
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const rounds = bracket.length > 0 ? Math.max(...bracket.map((m) => m.round)) : 0;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Torneios</h1>

      {tournaments.length === 0 && (
        <EmptyState
          icon="🏆"
          title="Nenhum torneio cadastrado"
          description="Crie torneios internos ou externos para organizar competições e chaveamentos."
          variant="first-time"
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.map((t) => (
          <Card key={t.id} className="p-4">
            <h3 className="font-bold text-bb-black">{t.name}</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-bb-gray-500">
              <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
              <span>{t.modality}</span>
              <span>{t.enrolledCount} inscritos</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.categories.map((c) => (
                <span key={c} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-500">{c}</span>
              ))}
            </div>
            <Button variant="ghost" className="mt-3" onClick={() => handleViewBracket(t.id)}>Ver Chaveamento</Button>
          </Card>
        ))}
      </div>

      {/* Bracket View */}
      {selectedTournament && bracket.length > 0 && (
        <Card className="overflow-x-auto p-4">
          <h2 className="mb-4 font-semibold text-bb-black">Chaveamento</h2>
          <div className="flex gap-8">
            {Array.from({ length: rounds }, (_, r) => r + 1).map((round) => (
              <div key={round} className="flex flex-col justify-around gap-4">
                <p className="text-xs font-bold text-bb-gray-500">Round {round}</p>
                {bracket.filter((m) => m.round === round).map((match) => (
                  <div key={match.id} className="rounded-lg border border-bb-gray-200 p-2 text-xs">
                    <div className={`py-1 ${match.winner === match.player1 ? 'font-bold text-green-700' : 'text-bb-gray-500'}`}>
                      {match.player1 ?? 'TBD'}
                    </div>
                    <hr className="border-bb-gray-200" />
                    <div className={`py-1 ${match.winner === match.player2 ? 'font-bold text-green-700' : 'text-bb-gray-500'}`}>
                      {match.player2 ?? 'TBD'}
                    </div>
                    {match.method && <p className="mt-1 text-[10px] text-bb-gray-400">{match.method}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
