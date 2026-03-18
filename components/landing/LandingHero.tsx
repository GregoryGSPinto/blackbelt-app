'use client';

import { User, GraduationCap, Users, Star } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const profiles = [
  { icon: User, label: 'Aluno' },
  { icon: GraduationCap, label: 'Professor' },
  { icon: Users, label: 'Pais' },
  { icon: Star, label: 'Kids' },
];

export function LandingHero() {
  const sectionRef = useScrollReveal();
  const quoteRef = useScrollReveal();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bb-profile-icon {
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .scroll-reveal.revealed .bb-profile-icon {
              opacity: 1;
              transform: translateY(0);
            }
            .scroll-reveal.revealed .bb-profile-icon:nth-child(1) { transition-delay: 0.1s; }
            .scroll-reveal.revealed .bb-profile-icon:nth-child(2) { transition-delay: 0.2s; }
            .scroll-reveal.revealed .bb-profile-icon:nth-child(3) { transition-delay: 0.3s; }
            .scroll-reveal.revealed .bb-profile-icon:nth-child(4) { transition-delay: 0.4s; }
          `,
        }}
      />

      <section
        id="landing"
        className="scroll-reveal flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-20"
        ref={sectionRef}
        style={{
          background: 'linear-gradient(180deg, var(--bb-depth-1) 0%, var(--bb-depth-2) 100%)',
        }}
      >
        <h2
          className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl md:text-5xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Feito para quem vive o tatame.
        </h2>

        <p
          className="mt-4 max-w-xl text-center text-base md:text-lg"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Alunos, professores, pais e academias. Cada um com sua experiencia. Todos conectados.
        </p>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-6 sm:gap-8 md:gap-14">
          {profiles.map((profile) => (
            <div
              key={profile.label}
              className="bb-profile-icon flex flex-col items-center gap-2"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14 md:h-16 md:w-16"
                style={{
                  background: 'var(--bb-brand-surface)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <profile.icon
                  size={28}
                  strokeWidth={1.8}
                  style={{ color: 'var(--bb-brand)' }}
                />
              </div>
              <span
                className="text-xs font-medium md:text-sm"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {profile.label}
              </span>
            </div>
          ))}
        </div>

        <p
          ref={quoteRef}
          className="scroll-reveal mt-14 text-center text-sm italic md:text-base"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          &ldquo;Cada perfil, uma experiencia unica.&rdquo;
        </p>
      </section>
    </>
  );
}
