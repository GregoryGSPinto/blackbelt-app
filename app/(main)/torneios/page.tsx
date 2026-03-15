'use client';

import { useEffect, useState } from 'react';
import { listTournaments, enrollTournament, type TournamentDTO } from '@/lib/api/tournaments.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

export default function TorneiosPage() {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<TournamentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTournaments('academy-1').then(setTournaments).finally(() => setLoading(false));
  }, []);

  async function handleEnroll(id: string) {
    try {
      await enrollTournament(id, 'student-1');
      setTournaments((prev) => prev.map((t) => t.id === id ? { ...t, enrolledCount: t.enrolledCount + 1 } : t));
      toast('Inscrito com sucesso!', 'success');
    } catch {
      toast('Erro na inscrição', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-bb-black">Torneios</h1>
      {tournaments.map((t) => (
        <Card key={t.id} className="p-4">
          <h3 className="font-bold text-bb-black">{t.name}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-bb-gray-500">
            <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
            <span>{t.modality}</span>
            <span>{t.enrolledCount} inscritos</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {t.categories.map((c) => <span key={c} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-500">{c}</span>)}
          </div>
          {t.status === 'upcoming' && <Button className="mt-3" onClick={() => handleEnroll(t.id)}>Inscrever-se</Button>}
        </Card>
      ))}
    </div>
  );
}
