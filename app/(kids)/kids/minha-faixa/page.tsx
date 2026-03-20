'use client';

import { useState, useEffect } from 'react';
import { getFaixaKids } from '@/lib/api/kids-faixa.service';
import type { FaixaKids } from '@/lib/api/kids-faixa.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';

export default function KidsFaixaPage() {
  const [faixa, setFaixa] = useState<FaixaKids | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getFaixaKids('stu-kids-helena');
        setFaixa(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="text" className="mx-auto h-10 w-52" />
          <Skeleton variant="card" className="h-16 rounded-3xl" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-20 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!faixa) return null;

  const completedTasks = faixa.coisasBoas.filter((c) => c.feito).length;
  const totalTasks = faixa.coisasBoas.length;

  return (
    <PlanGate module="kids_module">
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
        {/* ── Header ─── */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[var(--bb-ink-100)]">
            Minha Faixa! {faixa.faixaAtual.emoji}
          </h1>
        </div>

        {/* ── Current Belt Card ─── */}
        <section className="overflow-hidden rounded-3xl bg-[var(--bb-depth-3)] shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div
            className="px-5 py-3"
            style={{
              background: `linear-gradient(135deg, ${faixa.faixaAtual.cor}40, ${faixa.faixaAtual.cor}20)`,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
              Sua faixa atual
            </p>
          </div>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${faixa.faixaAtual.cor}30` }}
            >
              <span className="text-4xl">{faixa.faixaAtual.emoji}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--bb-ink-100)]">
                Faixa {faixa.faixaAtual.nome}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-5 w-24 rounded shadow-sm"
                  style={{ backgroundColor: faixa.faixaAtual.cor }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                {faixa.faixaAtual.mensagem}
              </p>
            </div>
          </div>
        </section>

        {/* ── Next Belt ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span className="text-2xl">{faixa.proximaFaixa.emoji}</span> Pr\u00f3xima Faixa
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-32 rounded shadow-sm"
              style={{ backgroundColor: faixa.proximaFaixa.cor }}
            />
            <span className="text-sm font-extrabold text-[var(--bb-ink-100)]">
              {faixa.proximaFaixa.nome}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
            {faixa.proximaFaixa.mensagem}
          </p>
        </section>

        {/* ── Belt History ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span className="text-2xl">{'\u{1F5FA}\uFE0F'}</span> Jornada das Faixas
          </h2>
          <div className="relative space-y-0">
            {faixa.historicoFaixas.map((etapa, index) => {
              const isLast = index === faixa.historicoFaixas.length - 1;

              return (
                <div key={etapa.nome} className="relative flex items-start gap-4">
                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className="absolute left-5 top-12 h-full w-1 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom, ${etapa.cor}, ${faixa.historicoFaixas[index + 1]?.cor || '#d4d4d8'})`,
                      }}
                    />
                  )}

                  {/* Belt station */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full shadow-md"
                      style={{
                        background: etapa.cor,
                        boxShadow: `0 2px 8px ${etapa.cor}40`,
                      }}
                    >
                      <span className="text-lg">{etapa.emoji}</span>
                    </div>
                  </div>

                  {/* Belt info */}
                  <div
                    className="mb-4 flex-1 rounded-2xl p-3"
                    style={{ background: `${etapa.cor}08` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-32 rounded shadow-sm"
                        style={{ backgroundColor: etapa.cor }}
                      />
                      <span className="text-sm font-extrabold text-[var(--bb-ink-100)]">
                        {etapa.nome}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-sm">{'\u2705'}</span>
                      <span className="text-xs font-bold text-green-600">
                        Conquistada!
                      </span>
                      <span className="text-[10px] text-[var(--bb-ink-40)]">
                        {new Date(etapa.data).toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                      {etapa.mensagem}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Coisas Boas ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
              <span className="text-2xl">{'\u{1F31F}'}</span> Coisas Boas
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-600">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-green-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {faixa.coisasBoas.map((coisa, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (coisa.feito) {
                    toast('Muito bem! Voc\u00ea j\u00e1 fez isso! \u{1F31F}', 'success');
                  } else {
                    toast('Continue praticando! Quase l\u00e1! \u{1F4AA}', 'info');
                  }
                }}
                className="flex w-full min-h-[3rem] items-center gap-3 rounded-2xl p-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: coisa.feito
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                    : 'var(--bb-depth-1)',
                  border: coisa.feito
                    ? '1px solid #86efac'
                    : '1px dashed var(--bb-glass-border)',
                }}
              >
                <span className="text-xl">
                  {coisa.feito ? coisa.emoji : '\u23F3'}
                </span>
                <p
                  className={`text-sm font-bold ${
                    coisa.feito
                      ? 'text-green-700'
                      : 'text-[var(--bb-ink-40)]'
                  }`}
                >
                  {coisa.texto}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Motivational ─── */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-100 to-purple-100 p-5 text-center shadow-lg">
          <span className="text-3xl">{faixa.faixaAtual.emoji}</span>
          <p className="mt-2 text-sm font-extrabold text-[var(--bb-ink-100)]">
            Cada treino te deixa mais forte!
          </p>
        </section>
      </div>
    </div>
    </PlanGate>
  );
}
