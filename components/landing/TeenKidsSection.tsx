'use client';

import { Zap, Trophy, Flame, Target, Star, BookOpen, Heart, Gift } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const teenFeatures = [
  { icon: <Zap size={18} />, label: 'XP por treino' },
  { icon: <Trophy size={18} />, label: 'Ranking da academia' },
  { icon: <Flame size={18} />, label: 'Season Pass' },
  { icon: <Target size={18} />, label: 'Desafios semanais' },
];

const kidsFeatures = [
  { icon: <Star size={18} />, label: 'Estrelas por aula' },
  { icon: <BookOpen size={18} />, label: 'Album de figurinhas' },
  { icon: <Heart size={18} />, label: 'Mascote pessoal' },
  { icon: <Gift size={18} />, label: 'Loja de recompensas' },
];

export function TeenKidsSection() {
  const sectionRef = useScrollReveal();
  const teenRef = useScrollReveal();
  const kidsRef = useScrollReveal();

  return (
    <section
      ref={sectionRef}
      className="scroll-reveal px-4 py-16 sm:px-6 md:py-24 lg:py-28"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
        {/* TEEN card */}
        <div
          ref={teenRef}
          className="scroll-reveal overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          }}
        >
          <h3
            className="text-3xl font-black tracking-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            TEEN
          </h3>
          <p className="mt-2 text-sm font-medium text-white/80">
            Experiencia gamificada. XP, levels, ranking, season pass, desafios.
          </p>
          <p className="mt-4 text-sm italic text-white/60">
            &ldquo;Treinar nunca foi tao viciante.&rdquo;
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {teenFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  {feature.icon}
                </span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KIDS card */}
        <div
          ref={kidsRef}
          className="scroll-reveal overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 50%, #22c55e 100%)',
          }}
        >
          <h3
            className="text-3xl font-black tracking-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            KIDS
          </h3>
          <p className="mt-2 text-sm font-medium text-white/80">
            Diversao no tatame! Estrelas, figurinhas, mascotes, aventuras.
          </p>
          <p className="mt-4 text-sm italic text-white/60">
            &ldquo;Seu filho vai querer treinar todo dia.&rdquo;
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {kidsFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  {feature.icon}
                </span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
