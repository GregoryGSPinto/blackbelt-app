'use client';

import { useEffect, useState } from 'react';
import {
  getAvailableTitles,
  equipTitle,
  unequipTitle,
  type TitleDTO,
  type TitleRarity,
} from '@/lib/api/titles.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const RARITY_CONFIG: Record<TitleRarity, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common: { label: 'Comum', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300', glow: '' },
  rare: { label: 'Raro', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-400', glow: '' },
  epic: { label: 'Épico', color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-400', glow: 'shadow-purple-200' },
  legendary: { label: 'Lendário', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-400', glow: 'shadow-yellow-200' },
};

export default function TitulosPage() {
  const [titles, setTitles] = useState<TitleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    getAvailableTitles('student-1').then(setTitles).finally(() => setLoading(false));
  }, []);

  async function handleEquip(titleId: string) {
    setActionId(titleId);
    try {
      await equipTitle('student-1', titleId);
      setTitles((prev) =>
        prev.map((t) => ({ ...t, is_equipped: t.id === titleId }))
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleUnequip() {
    setActionId('unequip');
    try {
      await unequipTitle('student-1');
      setTitles((prev) => prev.map((t) => ({ ...t, is_equipped: false })));
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const equipped = titles.find((t) => t.is_equipped);
  const unlocked = titles.filter((t) => t.is_unlocked);
  const locked = titles.filter((t) => !t.is_unlocked);

  const filteredTitles =
    filter === 'unlocked' ? unlocked :
    filter === 'locked' ? locked :
    titles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Coleção</p>
        <h1 className="mt-1 text-2xl font-bold">Títulos e Emblemas</h1>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1">{unlocked.length} / {titles.length} desbloqueados</span>
        </div>
      </div>

      {/* Equipped Title */}
      {equipped && (
        <Card className="border-2 p-5" style={{ borderColor: equipped.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: equipped.color + '20' }}
              >
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <p className="text-xs font-medium text-bb-gray-500">Título Equipado</p>
                <p className="text-lg font-bold" style={{ color: equipped.color }}>{equipped.name}</p>
                <p className="text-sm text-bb-gray-500">{equipped.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleUnequip}
              disabled={actionId === 'unequip'}
            >
              {actionId === 'unequip' ? '...' : 'Remover'}
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'unlocked' ? 'Desbloqueados' : 'Bloqueados'}
          </button>
        ))}
      </div>

      {/* Title Collection */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredTitles.map((title) => {
          const cfg = RARITY_CONFIG[title.rarity];
          return (
            <Card
              key={title.id}
              className={`relative overflow-hidden border-2 p-4 transition-all ${
                title.is_unlocked
                  ? `${cfg.border} ${cfg.glow ? `shadow-lg ${cfg.glow}` : ''}`
                  : 'border-bb-gray-200 opacity-60'
              }`}
            >
              {/* Rarity Badge */}
              <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    title.is_unlocked ? cfg.bg : 'bg-bb-gray-100'
                  }`}
                >
                  <span className="text-xl">{title.is_unlocked ? '🏅' : '🔒'}</span>
                </div>
                <div className="flex-1 pr-16">
                  <h3 className={`font-bold ${title.is_unlocked ? 'text-bb-black' : 'text-bb-gray-400'}`}>
                    {title.name}
                    {title.is_equipped && (
                      <span className="ml-2 text-xs text-bb-primary">Equipado</span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-sm text-bb-gray-500">{title.description}</p>

                  {title.is_unlocked ? (
                    <div className="mt-2 flex items-center gap-2">
                      {title.unlocked_at && (
                        <span className="text-xs text-bb-gray-400">
                          Desde {new Date(title.unlocked_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {!title.is_equipped && (
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 !text-xs"
                          onClick={() => handleEquip(title.id)}
                          disabled={actionId === title.id}
                        >
                          {actionId === title.id ? '...' : 'Equipar'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg bg-bb-gray-50 p-2">
                      <p className="text-xs text-bb-gray-400">
                        <span className="font-medium">Como desbloquear:</span> {title.requirement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Rarity Legend */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-bold text-bb-black">Raridades</h3>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(RARITY_CONFIG) as [TitleRarity, typeof RARITY_CONFIG[TitleRarity]][]).map(([key, cfg]) => (
            <span key={key} className={`rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
