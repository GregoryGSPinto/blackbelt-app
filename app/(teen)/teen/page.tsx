'use client';

import { useState, useEffect } from 'react';
import { getXP, getLeaderboard } from '@/lib/api/xp.service';
import type { XPDTO, RankedStudent } from '@/lib/api/xp.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeenDashboardPage() {
  const [xp, setXp] = useState<XPDTO | null>(null);
  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [x, r] = await Promise.all([getXP('stu-teen'), getLeaderboard('academy-1')]);
        setXp(x);
        setRanking(r);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Hero: Sua Jornada */}
      <Card className="bg-gradient-to-br from-bb-gray-900 to-bb-gray-700 p-6 text-center text-white">
        <Avatar name="Bruna Alves" size="lg" />
        <h2 className="mt-2 text-xl font-bold">Bruna Alves</h2>
        <Badge variant="belt" size="sm" className="mt-1">orange</Badge>
        {xp && (
          <div className="mt-3">
            <p className="text-sm opacity-80">Nível {xp.level} · #{xp.rank} no ranking</p>
            <p className="text-3xl font-bold text-bb-warning">{xp.xp.toLocaleString()} XP</p>
          </div>
        )}
      </Card>

      {/* Conquistas recentes */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-white">Conquistas Recentes</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { name: 'Streak 7 dias', icon: '🔥' },
            { name: 'Faixa Laranja', icon: '🥋' },
            { name: '30 aulas', icon: '💪' },
          ].map((a) => (
            <Card key={a.name} className="flex-shrink-0 bg-bb-gray-700 p-3 text-center shadow-lg shadow-bb-warning/10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bb-warning/20">
                <span className="text-2xl">{a.icon}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-bb-white">{a.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Ranking */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-white">Ranking da Academia</h2>
        <Card className="bg-bb-gray-700 p-3">
          <div className="space-y-2">
            {ranking.map((student) => (
              <div
                key={student.student_id}
                className={`flex items-center gap-3 rounded-lg p-2 ${
                  student.student_id === 'stu-teen' ? 'bg-bb-red/20 ring-1 ring-bb-red/40' : ''
                }`}
              >
                <span className={`w-6 text-center text-sm font-bold ${student.rank <= 3 ? 'text-bb-warning' : 'text-bb-gray-500'}`}>
                  {student.rank}
                </span>
                <Avatar name={student.display_name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-white">{student.display_name}</p>
                  <p className="text-xs text-bb-gray-500">Nível {student.level}</p>
                </div>
                <span className="text-sm font-bold text-bb-warning">{student.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Desafios ativos */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-white">Desafios Ativos</h2>
        <div className="space-y-2">
          {[
            { name: '3 aulas esta semana', progress: 2, target: 3, reward: '50 XP' },
            { name: 'Nota 80+ na avaliação', progress: 0, target: 1, reward: '100 XP' },
          ].map((d) => (
            <Card key={d.name} className="bg-bb-gray-700 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-bb-white">{d.name}</p>
                <span className="text-xs font-bold text-bb-warning">{d.reward}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bb-gray-500">
                <div
                  className="h-full rounded-full bg-bb-warning"
                  style={{ width: `${(d.progress / d.target) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-bb-gray-500">{d.progress}/{d.target}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
