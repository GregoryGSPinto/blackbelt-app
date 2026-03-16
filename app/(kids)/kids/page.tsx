'use client';

import { useState, useEffect } from 'react';
import { getKidsDashboard } from '@/lib/api/kids.service';
import type { KidsDashboardDTO, KidsExchangeOptionDTO } from '@/lib/api/kids.service';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt ribbon component for kids (visual colored ribbon)
// ────────────────────────────────────────────────────────────
function BeltRibbon({ color, label, faded }: { color: string; label: string; faded?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${faded ? 'opacity-30' : ''}`}>
      <div
        className="h-5 w-24 rounded-md shadow-md"
        style={{ backgroundColor: color }}
      />
      <p className="mt-1 text-xs font-bold text-[var(--bb-ink-60)]">{label}</p>
    </div>
  );
}

export default function KidsDashboardPage() {
  const [data, setData] = useState<KidsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllStickers, setShowAllStickers] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-44 bg-sky-100" />
          <Skeleton variant="card" className="h-28 bg-sky-100" />
          <Skeleton variant="card" className="h-36 bg-sky-100" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const visibleStickers = showAllStickers
    ? data.sticker_album.stickers
    : data.sticker_album.stickers.slice(0, 12);

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* ─── HERO: Mascot + Name + Belt Ribbon ─── */}
      <section className="px-4 pb-2 pt-8 text-center">
        <div className="mx-auto max-w-lg">
          {/* Mascot circle */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 shadow-lg shadow-orange-200/50">
            <span className="text-5xl">🥋</span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-[var(--bb-ink-100)]">
            {data.display_name}
          </h1>

          {/* Belt ribbon (visual, not text) */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div
              className="h-4 w-20 rounded shadow-sm"
              style={{ backgroundColor: data.belt.current_color }}
            />
            <span className="text-sm font-bold text-[var(--bb-ink-60)]">
              {data.belt.current_label}
            </span>
          </div>

          {/* Stars count */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--bb-depth-3)] px-5 py-2 shadow-md">
            <span className="animate-pulse text-2xl">⭐</span>
            <span className="text-2xl font-extrabold text-amber-600">
              {data.stars.total}
            </span>
            <span className="text-sm text-[var(--bb-ink-40)]">estrelas</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4 pt-4">
        {/* ─── STARS THIS WEEK ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200">
              <span className="text-3xl">🌟</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--bb-ink-100)]">
                {data.stars.new_this_week} novas essa semana!
              </p>
              <p className="text-sm text-[var(--bb-ink-40)]">
                Total: {data.stars.total} estrelas
              </p>
            </div>
          </div>
        </section>

        {/* ─── NEXT CLASS ─── */}
        {data.next_class && (
          <section className="overflow-hidden rounded-3xl bg-[var(--bb-depth-3)] shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                Tatame te esperando!
              </p>
            </div>
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                <span className="text-3xl">🤸</span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                  {data.next_class.class_name}
                </p>
                <p className="text-sm text-[var(--bb-ink-60)]">
                  {data.next_class.day_label} {data.next_class.time}
                </p>
                <p className="mt-0.5 text-xs font-bold text-green-600">
                  Daqui {data.next_class.days_until} {data.next_class.days_until === 1 ? 'dia' : 'dias'}!
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── STICKER ALBUM ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📒</span>
              <h2 className="text-lg font-extrabold text-[var(--bb-ink-100)]">Figurinhas</h2>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-600">
              {data.sticker_album.collected}/{data.sticker_album.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700"
              style={{
                width: `${(data.sticker_album.collected / data.sticker_album.total) * 100}%`,
              }}
            />
          </div>

          {/* Sticker grid */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {visibleStickers.map((st) => (
              <div
                key={st.id}
                className={`flex flex-col items-center rounded-xl p-2 transition-all ${
                  st.collected
                    ? 'bg-gradient-to-br from-amber-50 to-pink-50 shadow-sm'
                    : 'bg-[var(--bb-depth-1)] opacity-40'
                }`}
              >
                <span className={`text-2xl ${st.collected ? '' : 'grayscale'}`}>
                  {st.image_emoji}
                </span>
                <p className="mt-0.5 text-center text-[9px] font-medium leading-tight text-[var(--bb-ink-60)]">
                  {st.name}
                </p>
              </div>
            ))}
          </div>

          {data.sticker_album.stickers.length > 12 && (
            <button
              onClick={() => setShowAllStickers(!showAllStickers)}
              className="mt-3 w-full rounded-xl bg-purple-50 py-2 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100"
            >
              {showAllStickers ? 'Ver menos' : `Ver todas (${data.sticker_album.total})`}
            </button>
          )}
        </section>

        {/* ─── BELT VISUAL: Current + Next ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span>🎯</span> Sua Faixa
          </h2>
          <div className="flex items-center justify-center gap-8">
            <BeltRibbon color={data.belt.current_color} label={data.belt.current_label} />
            <div className="flex flex-col items-center">
              <span className="text-xl text-[var(--bb-ink-40)]">→</span>
              <p className="text-[10px] text-[var(--bb-ink-40)]">
                {data.belt.stars_to_next} estrelas
              </p>
            </div>
            <BeltRibbon color={data.belt.next_color} label={data.belt.next_label} faded />
          </div>
        </section>

        {/* ─── EXCHANGE STORE ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span>🎁</span> Trocar Estrelas
          </h2>
          <div className="space-y-2">
            {data.exchange_options.map((opt: KidsExchangeOptionDTO) => (
              <div
                key={opt.id}
                className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
                  opt.available
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 ring-1 ring-amber-200/50'
                    : 'bg-[var(--bb-depth-1)] opacity-60'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--bb-ink-100)]">{opt.label}</p>
                  <p className="text-xs text-[var(--bb-ink-40)]">{opt.stars_cost} estrelas</p>
                </div>
                {opt.available ? (
                  <button className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-500">
                    Trocar!
                  </button>
                ) : (
                  <span className="text-xs text-[var(--bb-ink-40)]">
                    Faltam {opt.stars_cost - data.stars.total}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── MOTIVATIONAL MESSAGE ─── */}
        <section className="rounded-3xl bg-gradient-to-r from-pink-100 to-yellow-100 p-5 text-center shadow-lg">
          <span className="text-3xl">🌈</span>
          <p className="mt-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            {data.motivational_message}
          </p>
        </section>
      </div>
    </div>
  );
}
