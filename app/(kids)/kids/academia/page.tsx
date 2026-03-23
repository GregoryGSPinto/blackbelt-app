'use client';

import { useState, useEffect } from 'react';
import { getModulos, getProgressoGeral } from '@/lib/api/academia-teorica.service';
import type { ModuloTeorico, ProgressoGeral } from '@/lib/api/academia-teorica.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';

// ────────────────────────────────────────────────────────────
// Star Constants
// ────────────────────────────────────────────────────────────
const STARS_PER_LICAO = 5;
const STARS_PER_QUIZ = 10;

// ────────────────────────────────────────────────────────────
// Kids-friendly titles and emojis for categories
// ────────────────────────────────────────────────────────────
const KIDS_EMOJI: Record<string, string> = {
  requisitos: '🌟',
  terminologia: '🗣️',
  regras: '🎯',
  historia: '📚',
  filosofia: '🧠',
  saude: '🏃',
};

const KIDS_CARD_COLORS = [
  'from-pink-400/30 to-rose-500/20 ring-pink-400/40',
  'from-sky-400/30 to-blue-500/20 ring-sky-400/40',
  'from-amber-400/30 to-yellow-500/20 ring-amber-400/40',
  'from-green-400/30 to-emerald-500/20 ring-green-400/40',
  'from-purple-400/30 to-violet-500/20 ring-purple-400/40',
  'from-orange-400/30 to-red-500/20 ring-orange-400/40',
];

// Replace words that are not kid-appropriate
function kidsFriendlyTitle(titulo: string): string {
  return titulo
    .replace(/submiss[aã]o/gi, 'tecnica especial')
    .replace(/competi[cç][aã]o/gi, 'desafio');
}

function kidsFriendlyDesc(descricao: string): string {
  return descricao
    .replace(/submiss[aã]o/gi, 'tecnica especial')
    .replace(/submiss[oõ]es/gi, 'tecnicas especiais')
    .replace(/competi[cç][aã]o/gi, 'desafio')
    .replace(/competi[cç][oõ]es/gi, 'desafios');
}

function calcModuloStars(modulo: ModuloTeorico): number {
  return modulo.totalLicoes * STARS_PER_LICAO + STARS_PER_QUIZ;
}

function calcModuloStarsEarned(modulo: ModuloTeorico): number {
  let stars = modulo.licoesCompletadas * STARS_PER_LICAO;
  if (modulo.quizScore !== undefined && modulo.quizScore >= 70) stars += STARS_PER_QUIZ;
  return stars;
}

// ────────────────────────────────────────────────────────────
// Star display component
// ────────────────────────────────────────────────────────────
function StarDisplay({ count, max }: { count: number; max: number }) {
  const filled = Math.min(count, max);
  const display = Math.min(max, 5); // show max 5 star icons visually
  const filledIcons = Math.min(filled, display);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: display }).map((_, i) => (
        <span
          key={i}
          className={`text-lg transition-all ${
            i < filledIcons ? 'scale-110' : 'opacity-30 grayscale'
          }`}
        >
          {i < filledIcons ? '⭐' : '☆'}
        </span>
      ))}
      {max > 5 && (
        <span className="ml-1 text-xs font-bold text-amber-600">
          {count}/{max}
        </span>
      )}
    </div>
  );
}

export default function KidsAcademiaPage() {
  const [modulos, setModulos] = useState<ModuloTeorico[]>([]);
  const [progresso, setProgresso] = useState<ProgressoGeral | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mods, prog] = await Promise.all([
          getModulos(),
          getProgressoGeral(),
        ]);
        setModulos(mods);
        setProgresso(prog);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton variant="card" className="h-32 rounded-[20px] bg-sky-100" />
          <Skeleton variant="card" className="h-24 rounded-[20px] bg-pink-100" />
          <Skeleton variant="card" className="h-36 rounded-[20px] bg-amber-100" />
          <Skeleton variant="card" className="h-36 rounded-[20px] bg-green-100" />
        </div>
      </div>
    );
  }

  const totalStarsEarned = modulos.reduce((sum, m) => sum + calcModuloStarsEarned(m), 0);
  const totalStarsPossible = modulos.reduce((sum, m) => sum + calcModuloStars(m), 0);

  return (
    <PlanGate module="kids_module">
      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* ─── HEADER ─── */}
      <section className="px-4 pb-4 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-5xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
            📖
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--bb-ink-100)]">
            Aprender!
          </h1>
          <p className="mt-1 text-base text-[var(--bb-ink-60)]">
            Vamos descobrir coisas legais!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* ─── STAR REWARDS ─── */}
        <section className="rounded-[20px] bg-gradient-to-r from-amber-100 to-yellow-100 p-5 text-center shadow-lg ring-1 ring-amber-200/50">
          <div className="flex items-center justify-center gap-3">
            <span className="animate-pulse text-3xl">⭐</span>
            <div>
              <p className="text-2xl font-extrabold text-amber-700">
                {totalStarsEarned} estrelas!
              </p>
              <p className="text-sm text-amber-600/70">
                Consiga mais {totalStarsPossible - totalStarsEarned} estrelas!
              </p>
            </div>
          </div>

          {/* Star reward info */}
          <div className="mt-4 flex justify-center gap-4">
            <div className="rounded-2xl bg-white/60 px-4 py-2 shadow-sm">
              <p className="text-lg font-extrabold text-amber-600">+{STARS_PER_LICAO}</p>
              <p className="text-[10px] font-medium text-amber-700/60">por licao</p>
            </div>
            <div className="rounded-2xl bg-white/60 px-4 py-2 shadow-sm">
              <p className="text-lg font-extrabold text-amber-600">+{STARS_PER_QUIZ}</p>
              <p className="text-[10px] font-medium text-amber-700/60">por desafio</p>
            </div>
          </div>
        </section>

        {/* ─── PROGRESS WITH STARS ─── */}
        {progresso && (
          <section className="rounded-[20px] bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                  Sua Aventura
                </p>
                <p className="text-sm text-[var(--bb-ink-60)]">
                  {progresso.completados} de {progresso.totalModulos} aventuras completas!
                </p>
              </div>
            </div>
            <StarDisplay count={progresso.completados} max={progresso.totalModulos} />
          </section>
        )}

        {/* ─── MODULE CARDS ─── */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span className="text-2xl">🗺️</span> Suas Aventuras
          </h2>
          <div className="space-y-4">
            {modulos.map((modulo, index) => {
              const colorClass = KIDS_CARD_COLORS[index % KIDS_CARD_COLORS.length];
              const emoji = KIDS_EMOJI[modulo.categoria] ?? '🌟';
              const starTotal = calcModuloStars(modulo);
              const starEarned = calcModuloStarsEarned(modulo);
              const isComplete = modulo.certificadoEmitido;
              const isLocked = modulo.bloqueado;
              const friendlyTitle = kidsFriendlyTitle(modulo.titulo);
              const friendlyDesc = kidsFriendlyDesc(modulo.descricao);

              return (
                <div
                  key={modulo.id}
                  className={`overflow-hidden rounded-[20px] ring-1 transition-all ${
                    isLocked
                      ? 'bg-[var(--bb-depth-3)]/50 opacity-60 ring-[var(--bb-glass-border)]'
                      : isComplete
                        ? 'bg-gradient-to-r from-green-200/50 to-emerald-200/40 ring-green-400/40'
                        : `bg-gradient-to-br ${colorClass}`
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Big emoji icon */}
                      <div
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/30 shadow-sm"
                        style={{ minWidth: '4rem' }}
                      >
                        <span className="text-3xl">
                          {isLocked ? '🔮' : isComplete ? '🎉' : emoji}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                          {isLocked ? 'Em breve!' : friendlyTitle}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
                          {isLocked
                            ? 'Essa aventura vai ser liberada em breve!'
                            : friendlyDesc}
                        </p>

                        {/* Stars for this module */}
                        {!isLocked && (
                          <div className="mt-3">
                            <StarDisplay count={starEarned} max={starTotal} />
                            <p className="mt-1 text-xs font-bold text-amber-600">
                              {starEarned} de {starTotal} estrelas
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    {!isLocked && (
                      <div className="mt-4">
                        <div className="h-3 overflow-hidden rounded-full bg-white/30">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-700"
                            style={{
                              width: `${modulo.totalLicoes > 0 ? Math.round((modulo.licoesCompletadas / modulo.totalLicoes) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-[var(--bb-ink-60)]">
                          {modulo.licoesCompletadas} de {modulo.totalLicoes} licoes feitas!
                        </p>
                      </div>
                    )}

                    {/* Action button */}
                    <div className="mt-4 text-center">
                      {isLocked && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2">
                          <span>🔮</span>
                          <span className="text-sm font-bold text-[var(--bb-ink-60)]">
                            Em breve!
                          </span>
                        </div>
                      )}
                      {!isLocked && !isComplete && (
                        <button className="w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 text-base font-extrabold text-white shadow-lg transition-all hover:shadow-xl active:scale-95">
                          Vamos la! ⭐
                        </button>
                      )}
                      {isComplete && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-200/50 px-5 py-2">
                          <span>🎉</span>
                          <span className="text-sm font-bold text-green-700">
                            Aventura completa!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── MOTIVATIONAL FOOTER ─── */}
        <section className="rounded-[20px] bg-gradient-to-r from-pink-100 to-yellow-100 p-5 text-center shadow-lg">
          <span className="text-3xl">🌈</span>
          <p className="mt-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            Voce esta indo super bem!
          </p>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            Continue aprendendo e ganhando estrelas!
          </p>
        </section>
      </div>
      </div>
    </PlanGate>
  );
}
