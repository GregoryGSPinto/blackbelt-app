'use client';

import type { ReactNode } from 'react';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface ExtraFeature {
  icon: ReactNode;
  label: string;
}

interface BenefitSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  features: Feature[];
  extraFeatures: ExtraFeature[];
  accentColor?: string;
  className?: string;
}

function FeatureCard({
  feature,
  accentColor,
}: {
  feature: Feature;
  accentColor: string;
}) {
  const ref = useScrollReveal();

  return (
    <div
      ref={ref}
      className="scroll-reveal rounded-2xl p-6 transition-transform duration-200 md:hover:-translate-y-1"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <div
        className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{ background: accentColor, opacity: 0.15 }}
        />
        <span className="relative" style={{ color: accentColor }}>{feature.icon}</span>
      </div>
      <h4
        className="text-base font-semibold"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        {feature.title}
      </h4>
      <p
        className="mt-1 text-sm leading-relaxed"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        {feature.description}
      </p>
    </div>
  );
}

function ExtraFeaturePill({
  feature,
  accentColor,
}: {
  feature: ExtraFeature;
  accentColor: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-transform duration-200 md:hover:scale-105"
      style={{
        background: 'var(--bb-depth-3)',
        border: '1px solid var(--bb-glass-border)',
        color: accentColor,
      }}
    >
      {feature.icon}
      <span style={{ color: 'var(--bb-ink-80)' }}>{feature.label}</span>
    </span>
  );
}

export function BenefitSection({
  id,
  icon,
  title,
  subtitle,
  features,
  extraFeatures,
  accentColor = 'var(--bb-brand)',
  className = '',
}: BenefitSectionProps) {
  const headerRef = useScrollReveal();
  const extrasRef = useScrollReveal();

  return (
    <section
      id={id}
      className={`px-6 py-20 md:py-28 ${className}`}
      style={{ background: 'var(--bb-depth-1)' }}
    >
      {/* Section header */}
      <div ref={headerRef} className="scroll-reveal mx-auto max-w-4xl text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: 'var(--bb-brand-surface)',
            border: '1px solid var(--bb-glass-border)',
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <h3
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          {title}
        </h3>
        <p
          className="mt-2 text-base md:text-lg"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Feature cards */}
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} accentColor={accentColor} />
        ))}
      </div>

      {/* Extra features row */}
      {extraFeatures.length > 0 && (
        <div
          ref={extrasRef}
          className="scroll-reveal mx-auto mt-10 max-w-5xl"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
            {extraFeatures.map((feature, index) => (
              <ExtraFeaturePill
                key={index}
                feature={feature}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
