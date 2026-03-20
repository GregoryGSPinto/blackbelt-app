'use client';

import { useState, useEffect } from 'react';
import { getRecompensasKids, getHistoricoResgates, resgatarRecompensa } from '@/lib/api/kids-recompensas.service';
import type { RecompensaKids, HistoricoResgate } from '@/lib/api/kids-recompensas.service';
import { getKidsProfile } from '@/lib/api/kids-estrelas.service';
import type { KidsProfile } from '@/lib/api/kids-estrelas.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';

export default function KidsRecompensasPage() {
  const [recompensas, setRecompensas] = useState<RecompensaKids[]>([]);
  const [historico, setHistorico] = useState<HistoricoResgate[]>([]);
  const [profile, setProfile] = useState<KidsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmItem, setConfirmItem] = useState<RecompensaKids | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [celebratingEmoji, setCelebratingEmoji] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [recs, hist, prof] = await Promise.all([
          getRecompensasKids('stu-kids-helena'),
          getHistoricoResgates('stu-kids-helena'),
          getKidsProfile('stu-kids-helena'),
        ]);
        setRecompensas(recs);
        setHistorico(hist);
        setProfile(prof);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleTrocar() {
    if (!confirmItem || !profile) return;
    try {
      const result = await resgatarRecompensa('stu-kids-helena', confirmItem.id);
      setProfile((prev) =>
        prev ? { ...prev, estrelasTotal: prev.estrelasTotal - confirmItem.custoEstrelas } : prev,
      );
      setRecompensas((prev) =>
        prev.map((r) =>
          r.id === confirmItem.id ? { ...r, jaResgatada: true, entregue: true } : r,
        ),
      );
      setHistorico((prev) => [result, ...prev]);
      setConfirmItem(null);
      setCelebratingEmoji(confirmItem.emoji);
      setCelebrating(true);
      toast(`${confirmItem.emoji} Você conseguiu! Incrível!`, 'success');
      setTimeout(() => setCelebrating(false), 3000);
    } catch {
      toast('Tente de novo mais tarde! 🌟', 'error');
    }
  }

  const canAfford = (item: RecompensaKids) =>
    profile ? item.custoEstrelas <= profile.estrelasTotal : false;

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="text" className="mx-auto h-10 w-64" />
          <Skeleton variant="text" className="mx-auto h-6 w-44" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" className="h-44 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const redeemedNames = new Set(historico.map((h) => h.recompensa));

  return (
    <PlanGate module="kids_module">
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
        {/* ── Header ─── */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[var(--bb-ink-100)]">
            Loja de Recompensas! ⭐
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--bb-depth-3)] px-5 py-2 shadow-md ring-1 ring-[var(--bb-glass-border)]">
            <span className="animate-pulse text-2xl">⭐</span>
            <span className="text-2xl font-extrabold text-amber-600">
              {profile.estrelasTotal}
            </span>
            <span className="text-sm text-[var(--bb-ink-40)]">estrelas</span>
          </div>
        </div>

        {/* ── Rewards Grid ─── */}
        <div className="grid grid-cols-2 gap-3">
          {recompensas.map((item) => {
            const redeemed = item.jaResgatada || redeemedNames.has(item.nome);
            const affordable = canAfford(item);
            const missing = item.custoEstrelas - profile.estrelasTotal;

            return (
              <div
                key={item.id}
                className="flex flex-col items-center rounded-3xl p-4 transition-all"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: redeemed
                    ? '2.5px solid #22c55e'
                    : '1px solid var(--bb-glass-border)',
                  boxShadow: redeemed
                    ? '0 4px 16px rgba(34, 197, 94, 0.15)'
                    : 'var(--bb-shadow-md)',
                }}
              >
                <span
                  className="text-5xl"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  {item.emoji}
                </span>
                <p className="mt-2 text-center text-sm font-extrabold leading-tight text-[var(--bb-ink-100)]">
                  {item.nome}
                </p>
                <p className="mt-1 text-center text-[10px] text-[var(--bb-ink-40)]">
                  {item.descricao}
                </p>
                <p className="mt-2 text-sm font-bold text-amber-600">
                  ⭐ {item.custoEstrelas} estrelas
                </p>

                {redeemed ? (
                  <div className="mt-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-green-600">
                    ✅ Você tem!
                  </div>
                ) : affordable && !redeemed ? (
                  <button
                    onClick={() => setConfirmItem(item)}
                    className="mt-2 min-h-[2.75rem] w-full rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
                  >
                    Trocar! ✨
                  </button>
                ) : (
                  <div className="mt-2 rounded-full bg-[var(--bb-depth-1)] px-4 py-1.5 text-xs font-bold text-[var(--bb-ink-40)]">
                    Faltam {missing} ⭐
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Minhas Recompensas ─── */}
        {historico.length > 0 && (
          <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
              <span className="text-2xl">🎁</span> Minhas Recompensas
            </h2>
            <div className="space-y-2">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-green-50 p-3 ring-1 ring-green-200/50"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                      {item.recompensa}
                    </p>
                    <p className="text-xs text-[var(--bb-ink-40)]">
                      {new Date(item.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <span className="text-lg">✅</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Motivational ─── */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-100 to-yellow-100 p-5 text-center shadow-lg">
          <span className="text-3xl">🌟</span>
          <p className="mt-2 text-sm font-extrabold text-[var(--bb-ink-100)]">
            Continue treinando para ganhar estrelas!
          </p>
        </section>
      </div>

      {/* ── Confirmation Modal ─── */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--bb-depth-3)] p-6 shadow-2xl ring-1 ring-[var(--bb-glass-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <span
                className="inline-block text-7xl"
                style={{ animation: 'float 1.5s ease-in-out infinite' }}
              >
                {confirmItem.emoji}
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-[var(--bb-ink-100)]">
                Trocar ⭐ {confirmItem.custoEstrelas} por {confirmItem.nome}?
              </h3>
              <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
                Você fica com ⭐{' '}
                {profile.estrelasTotal - confirmItem.custoEstrelas} estrelas
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmItem(null)}
                className="min-h-[2.75rem] flex-1 rounded-2xl bg-[var(--bb-depth-1)] py-3 text-sm font-bold text-[var(--bb-ink-60)] transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleTrocar}
                className="min-h-[2.75rem] flex-1 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                Trocar! ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Celebration Overlay ─── */}
      {celebrating && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            {/* Confetti emojis */}
            <div className="relative">
              <span
                className="absolute -left-16 -top-8 text-4xl"
                style={{ animation: 'float 1s ease-in-out infinite' }}
              >
                🎉
              </span>
              <span
                className="absolute -right-16 -top-4 text-4xl"
                style={{ animation: 'float 1.2s ease-in-out infinite 0.3s' }}
              >
                🎊
              </span>
              <span
                className="absolute -left-12 top-16 text-3xl"
                style={{ animation: 'float 0.8s ease-in-out infinite 0.5s' }}
              >
                ✨
              </span>
              <span
                className="absolute -right-10 top-20 text-3xl"
                style={{ animation: 'float 1s ease-in-out infinite 0.2s' }}
              >
                🌟
              </span>
              <span
                className="inline-block text-8xl"
                style={{ animation: 'float 1.5s ease-in-out infinite' }}
              >
                {celebratingEmoji}
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold text-white">
              Parabéns! 🎉
            </h2>
            <p className="mt-2 text-lg font-bold text-white/80">
              Recompensa conquistada!
            </p>
          </div>
        </div>
      )}
    </div>
    </PlanGate>
  );
}
