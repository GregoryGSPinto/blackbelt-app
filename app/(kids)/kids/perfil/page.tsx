'use client';

import { useState, useEffect } from 'react';
import { getKidsDashboard } from '@/lib/api/kids.service';
import type { KidsDashboardDTO } from '@/lib/api/kids.service';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt ribbon component for kids
// ────────────────────────────────────────────────────────────
function BeltRibbon({ color, label, faded }: { color: string; label: string; faded?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${faded ? 'opacity-30' : ''}`}>
      <div
        className="h-5 w-24 rounded-md shadow-md"
        style={{ backgroundColor: color }}
      />
      <p className="mt-1 text-xs font-bold text-gray-600">{label}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Mock extended stats
// ────────────────────────────────────────────────────────────
interface KidsProfileStats {
  total_classes: number;
  classes_this_month: number;
  stickers_collected: number;
  member_since: string;
  favorite_move: string;
}

const MOCK_STATS: KidsProfileStats = {
  total_classes: 34,
  classes_this_month: 5,
  stickers_collected: 15,
  member_since: '2025-08-10',
  favorite_move: 'Rolamento',
};

export default function KidsPerfilPage() {
  const [data, setData] = useState<KidsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getKidsDashboard('stu-kids-helena');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-amber-50 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton variant="circle" className="h-28 w-28 bg-sky-100" />
            <Skeleton variant="text" className="h-8 w-40 bg-sky-100" />
            <Skeleton variant="text" className="h-5 w-32 bg-sky-100" />
          </div>
          <Skeleton variant="card" className="h-24 bg-sky-100" />
          <Skeleton variant="card" className="h-36 bg-sky-100" />
          <Skeleton variant="card" className="h-24 bg-sky-100" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-pink-50 px-4">
        <span className="text-6xl">👤</span>
        <h2 className="mt-4 text-xl font-extrabold text-gray-800">Perfil indisponivel</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Nao foi possivel carregar seus dados. Tente novamente!
        </p>
      </div>
    );
  }

  const memberSinceDate = new Date(MOCK_STATS.member_since).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-yellow-50 to-pink-50 pb-24">
      {/* Hero */}
      <section className="px-4 pb-2 pt-8 text-center">
        <div className="mx-auto max-w-lg">
          {/* Avatar mascot */}
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 shadow-xl shadow-orange-200/50 ring-4 ring-white">
            <span className="text-6xl">🥋</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
            {data.display_name}
          </h1>

          {/* Belt ribbon */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div
              className="h-4 w-20 rounded shadow-sm"
              style={{ backgroundColor: data.belt.current_color }}
            />
            <span className="text-sm font-bold text-gray-600">{data.belt.current_label}</span>
          </div>

          {/* Stars count */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 shadow-lg shadow-amber-100/50">
            <span className="animate-pulse text-3xl">⭐</span>
            <span className="text-3xl font-extrabold text-amber-600">{data.stars.total}</span>
            <span className="text-sm text-gray-500">estrelas</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Stars this week */}
        <section className="rounded-3xl bg-white/90 p-5 shadow-lg shadow-amber-100/50 ring-1 ring-amber-200/30">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800">
                {data.stars.new_this_week} novas essa semana!
              </p>
              <p className="text-sm text-gray-500">
                Total: {data.stars.total} estrelas
              </p>
            </div>
          </div>
        </section>

        {/* Quick stats */}
        <section className="rounded-3xl bg-white/90 p-5 shadow-lg shadow-blue-100/50 ring-1 ring-blue-200/30">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-gray-800">
            <span>📊</span> Meus Numeros
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center ring-1 ring-green-200/50">
              <span className="text-2xl">🤸</span>
              <p className="mt-1 text-2xl font-extrabold text-green-600">{MOCK_STATS.total_classes}</p>
              <p className="text-xs text-gray-500">Treinos totais</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center ring-1 ring-blue-200/50">
              <span className="text-2xl">📅</span>
              <p className="mt-1 text-2xl font-extrabold text-blue-600">{MOCK_STATS.classes_this_month}</p>
              <p className="text-xs text-gray-500">Este mes</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center ring-1 ring-purple-200/50">
              <span className="text-2xl">📒</span>
              <p className="mt-1 text-2xl font-extrabold text-purple-600">{MOCK_STATS.stickers_collected}</p>
              <p className="text-xs text-gray-500">Figurinhas</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center ring-1 ring-orange-200/50">
              <span className="text-2xl">💫</span>
              <p className="mt-1 text-2xl font-extrabold text-orange-600">{data.stars.total}</p>
              <p className="text-xs text-gray-500">Estrelas</p>
            </div>
          </div>
        </section>

        {/* Belt progress */}
        <section className="rounded-3xl bg-white/90 p-5 shadow-lg shadow-sky-100/50 ring-1 ring-sky-200/30">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-gray-800">
            <span>🎯</span> Minha Faixa
          </h2>
          <div className="flex items-center justify-center gap-8">
            <BeltRibbon color={data.belt.current_color} label={data.belt.current_label} />
            <div className="flex flex-col items-center">
              <span className="text-xl text-gray-300">→</span>
              <p className="text-[10px] text-gray-400">
                {data.belt.stars_to_next} estrelas
              </p>
            </div>
            <BeltRibbon color={data.belt.next_color} label={data.belt.next_label} faded />
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
              style={{
                width: `${Math.max(
                  ((data.stars.total) / (data.stars.total + data.belt.stars_to_next)) * 100,
                  5,
                )}%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            Faltam {data.belt.stars_to_next} estrelas para a proxima faixa!
          </p>
        </section>

        {/* Favorite move */}
        <section className="rounded-3xl bg-gradient-to-r from-pink-100 to-purple-100 p-5 text-center shadow-lg">
          <span className="text-3xl">🥷</span>
          <p className="mt-2 text-sm font-bold text-gray-700">Movimento favorito</p>
          <p className="text-xl font-extrabold text-gray-800">{MOCK_STATS.favorite_move}</p>
        </section>

        {/* Member info */}
        <section className="rounded-3xl bg-white/70 p-4 text-center">
          <p className="text-xs text-gray-500">
            Treinando desde {memberSinceDate}
          </p>
        </section>
      </div>
    </div>
  );
}
