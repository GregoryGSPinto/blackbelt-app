'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getHallOfFame, type RecordDTO, type HallOfFameDTO } from '@/lib/api/hall-fama.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  streak: { icon: '🔥', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  frequency: { icon: '📅', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  promotion: { icon: '🥋', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  xp: { icon: '⭐', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  competitions: { icon: '🏅', color: 'text-red-700', bgColor: 'bg-red-50' },
  versatility: { icon: '🎯', color: 'text-green-700', bgColor: 'bg-green-50' },
  veteran: { icon: '🏛️', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function RecordCard({ record, rank }: { record: RecordDTO; rank: number }) {
  const config = CATEGORY_CONFIG[record.category] ?? { icon: '🏆', color: 'text-bb-gray-700', bgColor: 'bg-bb-gray-50' };
  const isTop3 = rank <= 3;
  const trophyColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600',
  };

  return (
    <Card className={`overflow-hidden ${isTop3 ? 'ring-1 ring-yellow-200' : ''}`}>
      <div className={`${config.bgColor} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <span className="text-sm font-bold text-bb-black">{record.title}</span>
          </div>
          {isTop3 && (
            <span className={`text-lg ${trophyColors[rank]}`}>
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          {record.holderAvatar ? (
            <Image
              src={record.holderAvatar}
              alt={record.holderName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-red text-sm font-bold text-bb-white">
              {getInitials(record.holderName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-bb-black">{record.holderName}</p>
            <p className="text-xs text-bb-gray-500">{record.modality}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${config.color}`}>{record.value}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-bb-gray-500">{record.description}</p>
        <p className="mt-2 text-xs text-bb-gray-400">
          Alcançado em {new Date(record.achievedAt + 'T12:00:00').toLocaleDateString('pt-BR')}
        </p>
      </div>
    </Card>
  );
}

export default function HallDaFamaPage() {
  const [hallData, setHallData] = useState<HallOfFameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    getHallOfFame('academy-1')
      .then(setHallData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!hallData) return null;

  const categories = ['all', ...new Set(hallData.records.map((r) => r.category))];
  const filtered = filter === 'all'
    ? hallData.records
    : hallData.records.filter((r) => r.category === filter);

  const CATEGORY_NAMES: Record<string, string> = {
    all: 'Todos',
    streak: 'Sequência',
    frequency: 'Frequência',
    promotion: 'Promoção',
    xp: 'XP',
    competitions: 'Competições',
    versatility: 'Versatilidade',
    veteran: 'Veterano',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-4xl">🏆</span>
        <h1 className="mt-2 text-xl font-bold text-bb-black">Hall da Fama</h1>
        <p className="mt-1 text-sm text-bb-gray-500">
          Os recordes e conquistas da academia
        </p>
      </div>

      {/* Top 3 highlight */}
      {hallData.records.length >= 3 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {hallData.records.slice(0, 3).map((record, idx) => {
            const config = CATEGORY_CONFIG[record.category] ?? { icon: '🏆', color: 'text-bb-gray-700', bgColor: 'bg-bb-gray-50' };
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div
                key={record.id}
                className={`rounded-xl border border-bb-gray-200 p-4 text-center ${
                  idx === 0 ? 'bg-gradient-to-b from-yellow-50 to-white ring-2 ring-yellow-200' : 'bg-white'
                }`}
              >
                <span className="text-3xl">{medals[idx]}</span>
                <p className="mt-2 text-sm font-bold text-bb-black">{record.title}</p>
                <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-bb-red text-sm font-bold text-bb-white">
                  {getInitials(record.holderName)}
                </div>
                <p className="mt-2 font-medium text-bb-black">{record.holderName}</p>
                <p className={`mt-1 text-lg font-bold ${config.color}`}>{record.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-bb-red text-bb-white'
                : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
            }`}
          >
            {CATEGORY_NAMES[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* All records */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((record, idx) => (
          <RecordCard key={record.id} record={record} rank={idx + 1} />
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-bb-gray-400">
        Atualizado em {new Date(hallData.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
