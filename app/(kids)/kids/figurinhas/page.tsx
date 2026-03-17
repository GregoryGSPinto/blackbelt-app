'use client';

import { useState, useEffect } from 'react';
import { getAlbum } from '@/lib/api/kids-figurinhas.service';
import type { AlbumFigurinhas, Figurinha } from '@/lib/api/kids-figurinhas.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

// ── Rarity config ────────────────────────────────────────────────────
const RARITY_BORDER: Record<string, string> = {
  comum: '#9ca3af',
  rara: '#3b82f6',
  super_rara: '#a855f7',
  lendaria: '#facc15',
};

const RARITY_LABEL: Record<string, string> = {
  comum: 'Comum',
  rara: 'Rara',
  super_rara: 'Super Rara',
  lendaria: 'Lendária',
};

const RARITY_LABEL_COLOR: Record<string, string> = {
  comum: 'text-gray-500 bg-gray-100',
  rara: 'text-blue-600 bg-blue-100',
  super_rara: 'text-purple-600 bg-purple-100',
  lendaria: 'text-amber-600 bg-amber-100',
};

export default function KidsFigurinhasPage() {
  const [album, setAlbum] = useState<AlbumFigurinhas | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFigurinha, setSelectedFigurinha] = useState<Figurinha | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlbum('stu-kids-helena');
        setAlbum(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleStickerTap(fig: Figurinha) {
    setSelectedFigurinha(fig);
    if (fig.coletada) {
      toast(`${fig.emoji} ${fig.nome}! Que legal!`, 'success');
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="text" className="mx-auto h-10 w-56" />
          <Skeleton variant="text" className="mx-auto h-5 w-40" />
          <Skeleton variant="card" className="h-8" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" className="h-28 rounded-3xl" />
            ))}
          </div>
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-3">
            {[7, 8, 9, 10, 11, 12].map((i) => (
              <Skeleton key={i} variant="card" className="h-28 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!album) return null;

  // Find the Diamante figurinha
  const diamante = album.temas
    .flatMap((t) => t.figurinhas)
    .find((f) => f.nome === 'Diamante');

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
        {/* ── Header ─── */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[var(--bb-ink-100)]">
            Meu Álbum! 🎯
          </h1>
          <p className="mt-1 text-sm font-bold text-[var(--bb-ink-40)]">
            {album.coletadas} de {album.totalFigurinhas} coletadas!
          </p>
        </div>

        {/* ── Progress bar ─── */}
        <div className="rounded-3xl bg-[var(--bb-depth-3)] p-4 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-[var(--bb-ink-60)]">Progresso</span>
            <span className="font-bold text-purple-600">
              {album.coletadas}/{album.totalFigurinhas}
            </span>
          </div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700"
              style={{
                width: `${(album.coletadas / album.totalFigurinhas) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* ── Theme Sections ─── */}
        {album.temas.map((tema) => (
          <section key={tema.nome}>
            {/* Theme header */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{tema.emoji}</span>
              <h2 className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {tema.nome}
              </h2>
              <span className="ml-auto rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-600">
                {tema.coletadas}/{tema.total}
              </span>
            </div>

            {/* Sticker grid */}
            <div className="grid grid-cols-3 gap-3">
              {tema.figurinhas
                .filter((f) => f.nome !== 'Diamante')
                .map((fig) => (
                  <button
                    key={fig.id}
                    onClick={() => handleStickerTap(fig)}
                    className="min-h-[7rem] rounded-3xl p-3 transition-all active:scale-95"
                    style={
                      fig.coletada
                        ? {
                            background: `var(--bb-depth-3)`,
                            border: `2.5px solid ${RARITY_BORDER[fig.raridade]}`,
                            boxShadow: 'var(--bb-shadow-md)',
                          }
                        : {
                            background: 'var(--bb-depth-3)',
                            border: '2px dashed var(--bb-glass-border)',
                            opacity: 0.45,
                          }
                    }
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <span
                          className={`text-5xl ${!fig.coletada ? 'grayscale' : ''}`}
                          style={
                            fig.brilho && fig.coletada
                              ? {
                                  filter: 'drop-shadow(0 0 8px gold)',
                                  animation: 'pulse 2s ease-in-out infinite',
                                }
                              : undefined
                          }
                        >
                          {fig.emoji}
                        </span>
                        {!fig.coletada && (
                          <span className="absolute -bottom-1 -right-1 text-lg">
                            🔒
                          </span>
                        )}
                      </div>
                      <p className="text-center text-[10px] font-bold leading-tight text-[var(--bb-ink-60)]">
                        {fig.nome}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </section>
        ))}

        {/* ── Diamante special card ─── */}
        {diamante && (
          <section>
            <button
              onClick={() => handleStickerTap(diamante)}
              className="w-full rounded-3xl p-6 text-center transition-all active:scale-95"
              style={
                diamante.coletada
                  ? {
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24)',
                      border: '3px solid #f59e0b',
                      boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                      animation: 'pulse 3s ease-in-out infinite',
                    }
                  : {
                      background: 'var(--bb-depth-3)',
                      border: '3px dashed #d4d4d8',
                      opacity: 0.6,
                    }
              }
            >
              <span
                className={`text-7xl ${!diamante.coletada ? 'grayscale' : ''}`}
                style={
                  diamante.coletada
                    ? {
                        filter: 'drop-shadow(0 0 12px gold)',
                        animation: 'float 3s ease-in-out infinite',
                      }
                    : undefined
                }
              >
                💎
              </span>
              <p className="mt-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
                {diamante.coletada ? 'Diamante! Incrível!' : 'Diamante'}
              </p>
              <p className="mt-1 text-xs font-bold text-[var(--bb-ink-40)]">
                {diamante.coletada
                  ? 'A figurinha mais rara de todas!'
                  : 'Colete todas para desbloquear!'}
              </p>
            </button>
          </section>
        )}

        {/* ── Next figurinha hint ─── */}
        <section className="rounded-3xl bg-gradient-to-r from-pink-100 to-yellow-100 p-5 text-center shadow-lg">
          <span className="text-3xl">{album.proximaFigurinha.emoji}</span>
          <p className="mt-2 text-sm font-extrabold text-[var(--bb-ink-100)]">
            Próxima: {album.proximaFigurinha.nome}!
          </p>
          <p className="mt-1 text-xs text-[var(--bb-ink-60)]">
            {album.proximaFigurinha.falta}
          </p>
        </section>
      </div>

      {/* ── Detail Modal ─── */}
      {selectedFigurinha && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedFigurinha(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--bb-depth-3)] p-6 shadow-2xl ring-1 ring-[var(--bb-glass-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <span
                className={`inline-block text-7xl ${
                  !selectedFigurinha.coletada ? 'grayscale opacity-40' : ''
                }`}
                style={
                  selectedFigurinha.brilho && selectedFigurinha.coletada
                    ? {
                        filter: 'drop-shadow(0 0 12px gold)',
                        animation: 'float 3s ease-in-out infinite',
                      }
                    : undefined
                }
              >
                {selectedFigurinha.emoji}
              </span>

              <h3 className="mt-3 text-xl font-extrabold text-[var(--bb-ink-100)]">
                {selectedFigurinha.nome}
              </h3>

              <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
                {selectedFigurinha.descricao}
              </p>

              {/* Rarity badge */}
              <div className="mt-3 flex justify-center">
                <span
                  className={`rounded-full px-4 py-1 text-xs font-bold ${
                    RARITY_LABEL_COLOR[selectedFigurinha.raridade]
                  }`}
                >
                  {RARITY_LABEL[selectedFigurinha.raridade]}
                </span>
              </div>

              {selectedFigurinha.coletada && selectedFigurinha.coletadaEm && (
                <p className="mt-3 rounded-2xl bg-green-500/10 px-4 py-2 text-xs font-bold text-green-600">
                  Coletada em{' '}
                  {new Date(selectedFigurinha.coletadaEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}

              {!selectedFigurinha.coletada && (
                <p className="mt-3 rounded-2xl bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-600">
                  Continue treinando! 💪
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedFigurinha(null)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
