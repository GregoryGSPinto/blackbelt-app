'use client';

import { useEffect, useState } from 'react';
import { listChallenges, type ChallengeDTO } from '@/lib/api/challenges.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const TYPE_ICON: Record<string, string> = { presenca: '📍', streak: '🔥', social: '👥', conteudo: '🎬', avaliacao: '📝' };

export default function DesafiosPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    listChallenges(getActiveAcademyId()).then(setChallenges).finally(() => setLoading(false));
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-bb-black">Desafios</h1>
      <div className="space-y-3">
        {challenges.filter((c) => c.active).length === 0 && (
          <EmptyState
            icon="🎯"
            title="Nenhum desafio ativo"
            description="Quando novos desafios forem lançados, eles aparecerão aqui para você participar."
            variant="first-time"
          />
        )}
        {challenges.filter((c) => c.active).map((ch) => {
          const pct = ch.type === 'avaliacao' ? 0 : (ch.progress / ch.target) * 100;
          const daysLeft = Math.max(0, Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          return (
            <Card key={ch.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{TYPE_ICON[ch.type]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-bb-black">{ch.title}</h3>
                    {ch.badge && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">{ch.badge}</span>}
                  </div>
                  <p className="mt-1 text-sm text-bb-gray-500">{ch.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-bb-gray-500">
                      <span>{ch.progress}/{ch.target}</span>
                      <span>{daysLeft} dias restantes</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-bb-gray-200">
                      <div className="h-full rounded-full bg-bb-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-bb-gray-500">
                    <span>{ch.participantCount} participantes</span>
                    <span className="font-medium text-bb-primary">{ch.reward}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
