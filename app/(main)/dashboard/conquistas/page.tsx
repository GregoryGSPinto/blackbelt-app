'use client';

import { useState, useEffect } from 'react';
import { listByAluno } from '@/lib/api/conquistas.service';
import { getLeaderboard } from '@/lib/api/xp.service';
import type { ConquistaDTO } from '@/lib/api/conquistas.service';
import type { RankedStudent } from '@/lib/api/xp.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ConquistasPage() {
  const [conquistas, setConquistas] = useState<ConquistaDTO[]>([]);
  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'conquistas' | 'ranking'>('conquistas');
  const [selected, setSelected] = useState<ConquistaDTO | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, r] = await Promise.all([listByAluno('stu-1'), getLeaderboard('academy-1')]);
        setConquistas(c); setRanking(r);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="space-y-4 p-4"><div className="grid grid-cols-3 gap-3">{[1,2,3,4,5,6].map((i)=><Skeleton key={i} variant="card" className="h-24" />)}</div></div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex rounded-lg bg-bb-gray-100 p-1">
        {(['conquistas', 'ranking'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-white text-bb-red shadow-sm' : 'text-bb-gray-500'}`}>{t === 'conquistas' ? 'Minhas Conquistas' : 'Ranking'}</button>
        ))}
      </div>
      {tab === 'conquistas' ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {conquistas.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className={`flex flex-col items-center rounded-lg p-3 text-center ${c.is_earned ? 'bg-white shadow-sm' : 'bg-bb-gray-100 opacity-40'}`}>
              <span className="text-3xl">{c.icon}</span>
              <p className="mt-1 text-xs font-medium text-bb-black">{c.name}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((s) => (
            <Card key={s.student_id} className="flex items-center gap-3 p-3">
              <span className={`w-8 text-center text-lg font-bold ${s.rank <= 3 ? 'text-bb-warning' : 'text-bb-gray-500'}`}>{s.rank}</span>
              <Avatar name={s.display_name} size="md" />
              <div className="flex-1"><p className="font-medium text-bb-black">{s.display_name}</p><p className="text-xs text-bb-gray-500">Nível {s.level}</p></div>
              <span className="font-bold text-bb-red">{s.xp.toLocaleString()} XP</span>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && <div className="text-center"><span className="text-5xl">{selected.icon}</span><p className="mt-3 text-bb-gray-500">{selected.description}</p></div>}
      </Modal>
    </div>
  );
}
