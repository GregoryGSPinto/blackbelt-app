'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Custom CSS for playful animations (injected inline via style tag)
// ────────────────────────────────────────────────────────────
const KIDS_STYLES = `
  @keyframes kids-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes kids-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  @keyframes kids-star-pulse {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.2); filter: brightness(1.3); }
  }
  @keyframes kids-wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-6deg); }
    75% { transform: rotate(6deg); }
  }
  @keyframes kids-path-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(234,179,8,0.3); }
    50% { box-shadow: 0 0 20px rgba(234,179,8,0.6); }
  }
  .kids-float { animation: kids-float 3s ease-in-out infinite; }
  .kids-bounce { animation: kids-bounce 2s ease-in-out infinite; }
  .kids-star-pulse { animation: kids-star-pulse 1.5s ease-in-out infinite; }
  .kids-wiggle { animation: kids-wiggle 2s ease-in-out infinite; }
  .kids-path-glow { animation: kids-path-glow 2s ease-in-out infinite; }
`;

// ────────────────────────────────────────────────────────────
// Inline mock data
// ────────────────────────────────────────────────────────────

interface PathStage {
  id: string;
  emoji: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface VideoEpisode {
  id: string;
  title: string;
  emoji: string;
  stars_reward: number;
  watched: boolean;
}

const MOCK = {
  stars_total: 127,
  mascot: '🐉',
  mascot_message: 'Voce e incrivel!',
  next_class: {
    name: 'Judozinho Aventureiro',
    day_label: 'Amanha',
    time: '14:00',
    emoji: '🤸',
    mission_name: 'Missao Rolar e Pular!',
  },
};

const MOCK_EPISODES: VideoEpisode[] = [
  { id: 'v1', title: 'O Rolo do Jacare', emoji: '🐊', stars_reward: 3, watched: false },
  { id: 'v2', title: 'O Salto do Canguru', emoji: '🦘', stars_reward: 2, watched: true },
  { id: 'v3', title: 'A Guarda da Tartaruga', emoji: '🐢', stars_reward: 3, watched: false },
];

const MOCK_PATH: PathStage[] = [
  { id: 's1', emoji: '🌱', label: 'Comeco', completed: true, current: false },
  { id: 's2', emoji: '🌿', label: 'Crescendo', completed: true, current: false },
  { id: 's3', emoji: '🌳', label: 'Forte', completed: true, current: false },
  { id: 's4', emoji: '🏔️', label: 'Montanha', completed: false, current: true },
  { id: 's5', emoji: '⭐', label: 'Estrela', completed: false, current: false },
];

const MOCK_BADGES = [
  { id: 'b1', emoji: '🦁', name: 'Bravo', unlocked: true },
  { id: 'b2', emoji: '🐆', name: 'Rapido', unlocked: true },
  { id: 'b3', emoji: '🦊', name: 'Esperto', unlocked: true },
  { id: 'b4', emoji: '🐻', name: 'Forte', unlocked: false },
  { id: 'b5', emoji: '🦅', name: 'Agil', unlocked: false },
  { id: 'b6', emoji: '🐲', name: 'Dragao', unlocked: false },
];

export default function KidsDashboardPage() {
  const { profile } = useAuthContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const displayName = profile?.display_name ?? 'Campeao';

  // ─── Skeleton loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-48 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-24 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-32 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-28 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject kids-specific animations */}
      <style dangerouslySetInnerHTML={{ __html: KIDS_STYLES }} />

      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
        {/* ─── HERO: Giant Stars Counter + Mascot ─── */}
        <section className="animate-reveal relative overflow-hidden px-4 pb-4 pt-8">
          {/* Fun background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,146,60,0.1) 30%, rgba(236,72,153,0.08) 70%, rgba(139,92,246,0.1) 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bb-depth-1)]" />

          <div className="relative mx-auto max-w-lg text-center">
            {/* Mascot floating */}
            <div className="kids-float mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg">
              <span className="text-5xl">{MOCK.mascot}</span>
            </div>

            {/* Greeting */}
            <p
              className="text-lg font-bold text-[var(--bb-ink-60)]"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              Ola, {displayName}!
            </p>

            {/* GIANT animated stars counter */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="kids-star-pulse text-5xl">⭐</span>
              <span
                className="kids-bounce text-6xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}
              >
                {MOCK.stars_total}
              </span>
            </div>
            <p
              className="mt-1 text-xl font-extrabold text-[var(--bb-ink-80)]"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              estrelas!
            </p>

            {/* Mascot message bubble */}
            <div className="mx-auto mt-4 max-w-xs rounded-3xl bg-[var(--bb-depth-3)] px-5 py-3 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
              <div className="kids-wiggle inline-block text-2xl">{MOCK.mascot}</div>
              <p className="mt-1 text-sm font-bold text-[var(--bb-ink-100)]">
                &ldquo;{MOCK.mascot_message}&rdquo;
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-lg space-y-5 px-4 pt-2" data-stagger>
          {/* ─── SUAS AVENTURAS: Next class as "missao" ─── */}
          <section
            className="overflow-hidden rounded-3xl shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.06))',
            }}
          >
            <div
              className="px-5 py-3"
              style={{ background: 'linear-gradient(90deg, #22c55e, #10b981)' }}
            >
              <p className="text-sm font-extrabold uppercase tracking-wider text-white">
                🗺️ Suas Aventuras
              </p>
            </div>
            <div className="flex items-center gap-4 p-5">
              <div className="kids-float flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100 text-3xl shadow-sm">
                {MOCK.next_class.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Proxima Missao
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-[var(--bb-ink-100)]">
                  {MOCK.next_class.mission_name}
                </p>
                <p className="text-sm text-[var(--bb-ink-60)]">
                  {MOCK.next_class.name} &middot; {MOCK.next_class.day_label} {MOCK.next_class.time}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-bold text-green-700">+5 estrelas se voce for!</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── EPISODIOS (Videos as episodes) ─── */}
          <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
              <span className="kids-float text-2xl">🎬</span> Episodios
            </h2>
            <div className="space-y-3">
              {MOCK_EPISODES.map((ep) => (
                <Link key={ep.id} href="/kids/conteudo">
                  <div
                    className={`flex items-center gap-4 rounded-2xl p-4 ring-1 transition-all ${
                      ep.watched
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 ring-green-400/30'
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/5 ring-[var(--bb-glass-border)] hover:ring-blue-400/40'
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm ${
                        ep.watched ? '' : 'kids-float'
                      }`}
                      style={{
                        background: ep.watched
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))'
                          : 'linear-gradient(135deg, #1a1a2e, #302b63)',
                      }}
                    >
                      {ep.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                        {ep.title}
                      </p>
                      {ep.watched ? (
                        <p className="mt-0.5 text-xs font-bold text-green-600">
                          Assistido! ✅
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                          Nova aventura!
                        </p>
                      )}
                    </div>
                    {/* Star rewards */}
                    <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 shadow-sm">
                      <span className="kids-star-pulse text-sm">⭐</span>
                      <span className="text-xs font-extrabold text-amber-700">
                        +{ep.stars_reward}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ─── PROGRESS PATH: Visual 5 stages ─── */}
          <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
              <span>🗺️</span> Sua Jornada
            </h2>
            <div className="flex items-center justify-between">
              {MOCK_PATH.map((stage, idx) => (
                <div key={stage.id} className="flex flex-1 flex-col items-center">
                  {/* Stage circle */}
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all ${
                      stage.completed
                        ? 'bg-gradient-to-br from-amber-300 to-orange-400 shadow-md'
                        : stage.current
                          ? 'kids-path-glow bg-gradient-to-br from-yellow-300 to-amber-400 shadow-lg'
                          : 'bg-[var(--bb-depth-4)] opacity-40'
                    }`}
                  >
                    {stage.completed ? (
                      <span>✅</span>
                    ) : (
                      <span className={stage.current ? 'kids-bounce' : ''}>
                        {stage.emoji}
                      </span>
                    )}
                  </div>
                  {/* Label */}
                  <p
                    className={`mt-2 text-center text-[11px] font-bold ${
                      stage.completed || stage.current
                        ? 'text-[var(--bb-ink-100)]'
                        : 'text-[var(--bb-ink-40)]'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {/* Connector line (except last) */}
                  {idx < MOCK_PATH.length - 1 && (
                    <div
                      className={`absolute h-1 w-8 rounded-full ${
                        stage.completed ? 'bg-amber-400' : 'bg-[var(--bb-depth-4)]'
                      }`}
                      style={{
                        position: 'relative',
                        top: '-28px',
                        left: '32px',
                        display: 'none', // hidden, path is visual via spacing
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Connection dots between stages */}
            <div className="mx-auto mt-3 flex max-w-[280px] items-center justify-between px-7">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < 3 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-[var(--bb-depth-4)]'
                  }`}
                  style={{ margin: '0 2px' }}
                />
              ))}
            </div>
            {/* Encouragement */}
            <p className="mt-4 text-center text-sm font-bold text-amber-600">
              3 de 5 completos! Voce esta quase la! 🎉
            </p>
          </section>

          {/* ─── CONQUISTAS: Badges ─── */}
          <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
              <span className="kids-wiggle text-2xl">🏅</span> Suas Medalhas
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {MOCK_BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center rounded-2xl p-4 transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 shadow-md ring-1 ring-amber-200/50'
                      : 'bg-[var(--bb-depth-4)] opacity-40'
                  }`}
                  style={
                    badge.unlocked
                      ? { boxShadow: '0 0 15px rgba(251,191,36,0.3)' }
                      : undefined
                  }
                >
                  <span className={`text-3xl ${badge.unlocked ? 'kids-bounce' : 'grayscale'}`}>
                    {badge.emoji}
                  </span>
                  <p className="mt-2 text-center text-xs font-bold text-[var(--bb-ink-80)]">
                    {badge.name}
                  </p>
                  {badge.unlocked ? (
                    <span className="mt-1 text-[10px] font-bold text-amber-500">Ganhou!</span>
                  ) : (
                    <span className="mt-1 text-[10px] text-[var(--bb-ink-40)]">Em breve!</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── MOTIVATIONAL FOOTER ─── */}
          <section
            className="rounded-3xl p-6 text-center shadow-[var(--bb-shadow-md)]"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.1), rgba(236,72,153,0.1))',
              border: '1px solid rgba(251,191,36,0.2)',
            }}
          >
            <span className="kids-float inline-block text-4xl">🌈</span>
            <p className="mt-2 text-xl font-extrabold text-[var(--bb-ink-100)]">
              Continue assim, {displayName}!
            </p>
            <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
              Cada treino te deixa mais forte! 💪
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
