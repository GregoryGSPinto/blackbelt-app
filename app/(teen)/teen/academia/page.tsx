'use client';

import { useState, useEffect } from 'react';
import { getModulos, getProgressoGeral } from '@/lib/api/academia-teorica.service';
import type { ModuloTeorico, ProgressoGeral } from '@/lib/api/academia-teorica.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';

// ────────────────────────────────────────────────────────────
// XP Constants
// ────────────────────────────────────────────────────────────
const XP_PER_LICAO = 20;
const XP_PER_QUIZ = 50;
const XP_PER_CERTIFICADO = 100;

// ────────────────────────────────────────────────────────────
// Category icon map
// ────────────────────────────────────────────────────────────
const CATEGORIA_ICON: Record<string, string> = {
  requisitos: '📋',
  terminologia: '🗣️',
  regras: '📏',
  historia: '📜',
  filosofia: '🧘',
  saude: '💪',
};

function calcModuloXpTotal(modulo: ModuloTeorico): number {
  return modulo.totalLicoes * XP_PER_LICAO + XP_PER_QUIZ + XP_PER_CERTIFICADO;
}

function calcModuloXpEarned(modulo: ModuloTeorico): number {
  let xp = modulo.licoesCompletadas * XP_PER_LICAO;
  if (modulo.quizScore !== undefined && modulo.quizScore >= 70) xp += XP_PER_QUIZ;
  if (modulo.certificadoEmitido) xp += XP_PER_CERTIFICADO;
  return xp;
}

export default function TeenAcademiaPage() {
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
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-16 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-32 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-28 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-28 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-28 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  const totalXpEarned = modulos.reduce((sum, m) => sum + calcModuloXpEarned(m), 0);
  const totalXpPossible = modulos.reduce((sum, m) => sum + calcModuloXpTotal(m), 0);

  return (
    <PlanGate module="teen_module">
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* ─── HEADER ─── */}
      <section className="relative overflow-hidden px-4 pb-6 pt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bb-brand-primary)]/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">
            Academia Teorica
          </h1>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            Conhecimento e poder. E XP.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4">
        {/* ─── XP REWARDS INFO ─── */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/40 p-4 ring-1 ring-indigo-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            Recompensas XP
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center rounded-xl bg-[var(--bb-depth-3)]/40 p-3">
              <span className="text-lg font-extrabold text-cyan-400">+{XP_PER_LICAO}</span>
              <span className="mt-0.5 text-[10px] text-[var(--bb-ink-40)]">por licao</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-[var(--bb-depth-3)]/40 p-3">
              <span className="text-lg font-extrabold text-purple-400">+{XP_PER_QUIZ}</span>
              <span className="mt-0.5 text-[10px] text-[var(--bb-ink-40)]">quiz aprovado</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-[var(--bb-depth-3)]/40 p-3">
              <span className="text-lg font-extrabold text-yellow-400">+{XP_PER_CERTIFICADO}</span>
              <span className="mt-0.5 text-[10px] text-[var(--bb-ink-40)]">certificado</span>
            </div>
          </div>
        </section>

        {/* ─── PROGRESS CARD WITH XP ─── */}
        {progresso && (
          <section className="rounded-2xl bg-[var(--bb-depth-3)] p-5 ring-1 ring-[var(--bb-glass-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--bb-ink-40)]">
                  Seu Progresso
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[var(--bb-ink-100)]">
                  {totalXpEarned.toLocaleString('pt-BR')} XP
                </p>
                <p className="text-xs text-[var(--bb-ink-40)]">
                  de {totalXpPossible.toLocaleString('pt-BR')} XP possiveis
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-[var(--bb-brand-primary)]">
                  {progresso.percentual}%
                </p>
                <p className="text-xs text-[var(--bb-ink-40)]">
                  {progresso.completados}/{progresso.totalModulos} modulos
                </p>
              </div>
            </div>
            {/* XP progress bar */}
            <div className="mt-4">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--bb-depth-1)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-700"
                  style={{ width: `${totalXpPossible > 0 ? Math.round((totalXpEarned / totalXpPossible) * 100) : 0}%` }}
                />
              </div>
            </div>
            {/* Stats row */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[var(--bb-depth-1)] p-2 text-center">
                <p className="text-sm font-bold text-green-400">{progresso.completados}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">completos</p>
              </div>
              <div className="rounded-lg bg-[var(--bb-depth-1)] p-2 text-center">
                <p className="text-sm font-bold text-yellow-400">{progresso.emProgresso}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">em andamento</p>
              </div>
              <div className="rounded-lg bg-[var(--bb-depth-1)] p-2 text-center">
                <p className="text-sm font-bold text-purple-400">{progresso.certificados}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">certificados</p>
              </div>
            </div>
          </section>
        )}

        {/* ─── MODULE LIST ─── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            Modulos
          </h2>
          <div className="space-y-3">
            {modulos.map((modulo) => {
              const xpTotal = calcModuloXpTotal(modulo);
              const xpEarned = calcModuloXpEarned(modulo);
              const progressPercent = modulo.totalLicoes > 0
                ? Math.round((modulo.licoesCompletadas / modulo.totalLicoes) * 100)
                : 0;
              const isComplete = modulo.certificadoEmitido;
              const icon = CATEGORIA_ICON[modulo.categoria] ?? '📖';

              return (
                <div
                  key={modulo.id}
                  className={`rounded-2xl p-4 ring-1 transition-all ${
                    modulo.bloqueado
                      ? 'bg-[var(--bb-depth-3)]/50 opacity-50 ring-[var(--bb-glass-border)]'
                      : isComplete
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/20 ring-green-500/30'
                        : 'bg-[var(--bb-depth-3)] ring-[var(--bb-glass-border)] hover:ring-[var(--bb-brand-primary)]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bb-depth-1)] text-2xl">
                      {modulo.bloqueado ? '🔒' : icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-bold text-[var(--bb-ink-100)]">
                          {modulo.titulo}
                        </h3>
                        {isComplete && (
                          <span className="flex-shrink-0 text-green-400">&#10003;</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                        {modulo.descricao}
                      </p>

                      {/* Progress bar */}
                      {!modulo.bloqueado && (
                        <div className="mt-2">
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--bb-depth-1)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--bb-ink-40)]">
                            <span>{modulo.licoesCompletadas}/{modulo.totalLicoes} licoes</span>
                            <span className="font-bold text-purple-400">
                              {xpEarned}/{xpTotal} XP
                            </span>
                          </div>
                        </div>
                      )}

                      {/* XP breakdown */}
                      {!modulo.bloqueado && !isComplete && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                            +{XP_PER_LICAO} XP/licao
                          </span>
                          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                            +{XP_PER_QUIZ} XP quiz
                          </span>
                          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                            +{XP_PER_CERTIFICADO} XP cert
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* XP total badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                      +{xpTotal} XP total
                    </span>
                    {!modulo.bloqueado && !isComplete && (
                      <button className="rounded-full bg-gradient-to-r from-[var(--bb-brand-primary)] to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:shadow-xl">
                        Comecar e ganhar XP
                      </button>
                    )}
                    {modulo.bloqueado && (
                      <span className="text-xs text-[var(--bb-ink-40)]">Bloqueado</span>
                    )}
                    {isComplete && (
                      <span className="text-xs font-bold text-green-400">Completo!</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
    </PlanGate>
  );
}
