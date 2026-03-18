'use client';

import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const testimonials = [
  {
    quote:
      'Agora eu acompanho minha evolucao todo dia. Nao perco mais nenhuma aula.',
    name: 'Joao Carlos',
    detail: 'Faixa Azul, Guerreiros do Tatame',
  },
  {
    quote:
      'O modo aula mudou minha rotina de professor. Chamada em 10 segundos.',
    name: 'Andre Nakamura',
    detail: 'Faixa Preta, Professor',
  },
  {
    quote:
      'Recebo o relatorio da Sophia todo mes. Sei exatamente como ela esta evoluindo.',
    name: 'Patricia Oliveira',
    detail: 'Mae da Sophia',
  },
];

export function TestimonialCarousel() {
  const sectionRef = useScrollReveal();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.scrollWidth / testimonials.length;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, testimonials.length - 1));
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-reveal px-6 py-20 md:py-28"
      style={{ background: 'var(--bb-depth-2)' }}
    >
      <h3
        className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        O que dizem nossos usuarios
      </h3>

      {/* Mobile: horizontal scroll carousel */}
      <div
        ref={scrollContainerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="min-w-[85vw] shrink-0 snap-center rounded-2xl p-6"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <span
              className="block text-4xl font-serif leading-none"
              style={{ color: 'var(--bb-brand)', opacity: 0.4 }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p
              className="mt-2 text-base italic leading-relaxed"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              {testimonial.quote}
            </p>
            <div className="mt-6">
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {testimonial.name}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {testimonial.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile dot indicators */}
      <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
        {testimonials.map((_, index) => (
          <span
            key={index}
            className="block h-2 w-2 rounded-full transition-all duration-300"
            style={{
              background:
                index === activeIndex
                  ? 'var(--bb-brand)'
                  : 'var(--bb-ink-20)',
              transform: index === activeIndex ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="mx-auto hidden max-w-5xl gap-6 md:grid md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <span
              className="block text-4xl font-serif leading-none"
              style={{ color: 'var(--bb-brand)', opacity: 0.4 }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p
              className="mt-2 text-base italic leading-relaxed"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              {testimonial.quote}
            </p>
            <div className="mt-6">
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {testimonial.name}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {testimonial.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
