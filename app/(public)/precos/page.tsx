'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  StarIcon,
  QuoteIcon,
  CheckCircleIcon,
  MinusIcon,
} from '@/components/shell/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { getFaixas, getModulos, getPacotes, calcularPlano } from '@/lib/api/pricing.service';
import type { FaixaBase, Modulo, PacoteSugerido, PlanoMontado } from '@/lib/api/pricing.service';

/* ─── Constants ─── */

const CATEGORIA_LABELS: Record<string, string> = {
  operacao: 'OPERACAO',
  ensino: 'ENSINO',
  engajamento: 'ENGAJAMENTO',
  comercial: 'COMERCIAL',
  avancado: 'AVANCADO',
};

const CATEGORIA_ORDER = ['operacao', 'ensino', 'engajamento', 'comercial', 'avancado'];

const FAQ_DATA = [
  { q: 'O que acontece nos primeiros 7 dias?', a: 'Tudo gratis. Sem cartao. Explore a vontade. Todos os 16 modulos ficam liberados para voce testar a plataforma completa.' },
  { q: 'E depois dos 7 dias?', a: 'Seu plano escolhido ativa e cobra normalmente. Mas TODOS os modulos continuam liberados por mais 83 dias para voce descobrir o que sua academia precisa.' },
  { q: 'O que acontece no dia 91?', a: 'Os modulos extras desativam. So ficam os que voce paga. Seus dados ficam salvos por 90 dias — se reativar, volta tudo.' },
  { q: 'Posso mudar de plano?', a: 'Sim, a qualquer momento. Adicione ou remova modulos com 1 clique. Faca upgrade ou downgrade quando quiser.' },
  { q: 'Posso cancelar?', a: 'Sim, sem fidelidade. Cancele quando quiser e seus dados sao exportaveis a qualquer momento.' },
  { q: 'Aceita PIX?', a: 'Sim. PIX, cartao de credito, cartao de debito e boleto bancario. Planos anuais podem ser parcelados em ate 12x.' },
  { q: 'Tem desconto para escolas/ONGs?', a: 'Sim, entre em contato para condicoes especiais. Temos programas de desconto para instituicoes sociais.' },
  { q: 'O que vem na base?', a: 'Dashboard admin, gestao de turmas e alunos, presenca manual, comunicados basicos e suporte por email. Tudo que voce precisa para comecar.' },
];

const TESTIMONIALS_DATA = [
  { quote: 'O BlackBelt mudou a gestao da minha academia. Nao volto mais pro papel. A automacao economiza horas por semana.', name: 'Roberto Silva', academy: 'Guerreiros BJJ', role: 'Proprietario' },
  { quote: 'Desde que adotamos o BlackBelt, a inadimplencia caiu 40%. O modulo financeiro se paga no primeiro mes.', name: 'Prof. Ricardo Almeida', academy: 'Alliance Centro', role: 'Proprietario' },
  { quote: 'Meus alunos adoram o sistema de XP e conquistas. A gamificacao mudou o engajamento dos treinos completamente.', name: 'Mestre Ana Luiza', academy: 'Arte Suave Academy', role: 'Professora' },
];

const COMPARISON_FEATURES = [
  { label: 'Turmas e alunos', base: true, financeiro: true, pedagogico: true, streaming: true, gamificacao: true },
  { label: 'Presenca manual', base: true, financeiro: true, pedagogico: true, streaming: true, gamificacao: true },
  { label: 'Comunicados', base: true, financeiro: true, pedagogico: true, streaming: true, gamificacao: true },
  { label: 'Mensalidades e cobranças', base: false, financeiro: true, pedagogico: false, streaming: false, gamificacao: false },
  { label: 'Boleto e PIX', base: false, financeiro: true, pedagogico: false, streaming: false, gamificacao: false },
  { label: 'Avaliacao radar', base: false, financeiro: false, pedagogico: true, streaming: false, gamificacao: false },
  { label: 'Promocao de faixa', base: false, financeiro: false, pedagogico: true, streaming: false, gamificacao: false },
  { label: 'Biblioteca Netflix-style', base: false, financeiro: false, pedagogico: false, streaming: true, gamificacao: false },
  { label: 'Trilhas de aprendizado', base: false, financeiro: false, pedagogico: false, streaming: true, gamificacao: false },
  { label: 'Sistema de XP', base: false, financeiro: false, pedagogico: false, streaming: false, gamificacao: true },
  { label: 'Ranking e conquistas', base: false, financeiro: false, pedagogico: false, streaming: false, gamificacao: true },
];

/* ─── Helpers ─── */

function fmtPrice(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function fmtPriceShort(value: number): string {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2).replace('.', ',');
}

/* ─── Sub-Components ─── */

function FAQAccordion({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        borderRadius: 'var(--bb-radius-lg)',
        border: '1px solid var(--bb-glass-border)',
        backgroundColor: 'var(--bb-depth-2)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium sm:text-base"
        style={{ color: 'var(--bb-ink-100)' }}
        aria-expanded={open}
      >
        <span className="pr-4">{item.q}</span>
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{ color: 'var(--bb-ink-40)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '300px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

function FeatureCell({ value }: { value: boolean }) {
  return value ? (
    <CheckIcon className="h-4 w-4" style={{ color: 'var(--bb-success)' }} />
  ) : (
    <MinusIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-20)' }} />
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors"
        style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }}
        disabled={value <= min}
      >
        -
      </button>
      <span className="w-8 text-center text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors"
        style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

/* ─── Loading Skeleton ─── */

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <Skeleton variant="text" className="mx-auto h-10 w-80" />
        <Skeleton variant="text" className="mx-auto mt-4 h-6 w-64" />
        <Skeleton variant="text" className="mx-auto mt-6 h-10 w-56" />
      </div>
      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-40" />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-48" />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-36" />
        ))}
      </div>
    </div>
  );
}

/* ─── Mobile Summary Bar ─── */

function MobileSummaryBar({
  plano,
  expanded,
  onToggle,
}: {
  plano: PlanoMontado | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!plano) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{
        backgroundColor: 'var(--bb-depth-1)',
        borderTop: '1px solid var(--bb-glass-border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
      }}
    >
      {expanded && (
        <div className="max-h-[60vh] overflow-y-auto px-4 pb-2 pt-4">
          <SummaryContent plano={plano} compact />
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          <ChevronDownIcon
            className="h-4 w-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
          <span>R$ {fmtPrice(plano.total)}/mes</span>
        </button>
        <Link
          href="/cadastrar-academia"
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--bb-brand-gradient)', boxShadow: 'var(--bb-brand-glow)' }}
        >
          COMECAR GRATIS
        </Link>
      </div>
    </div>
  );
}

/* ─── Summary Content ─── */

function SummaryContent({ plano, compact = false }: { plano: PlanoMontado; compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <p
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: 'var(--bb-ink-40)' }}
      >
        SEU PLANO
      </p>

      {/* Line items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--bb-ink-60)' }}>Base: {plano.faixaBase.nome}</span>
          <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            R$ {fmtPrice(plano.precoBase)}
          </span>
        </div>

        {plano.modulosSelecionados.map((mod) => (
          <div key={mod.slug} className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--bb-ink-60)' }}>
              {mod.icone} {mod.nome}
            </span>
            <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              R$ {fmtPrice(plano.ciclo === 'anual' ? mod.precoAnual : mod.precoMensal)}
            </span>
          </div>
        ))}

        {plano.professoresAdicionais > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--bb-ink-60)' }}>
              +{plano.professoresAdicionais} professor{plano.professoresAdicionais > 1 ? 'es' : ''}
            </span>
            <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              R$ {fmtPrice(plano.precoProfessoresExtra)}
            </span>
          </div>
        )}

        {plano.unidadesAdicionais > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--bb-ink-60)' }}>
              +{plano.unidadesAdicionais} unidade{plano.unidadesAdicionais > 1 ? 's' : ''}
            </span>
            <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              R$ {fmtPrice(plano.precoUnidadesExtra)}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr style={{ borderColor: 'var(--bb-glass-border)' }} />

      {/* Package discount */}
      {plano.descontoPacote > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium" style={{ color: 'var(--bb-success)' }}>
            Desconto pacote {plano.pacoteAplicado?.nome}
          </span>
          <span className="font-medium" style={{ color: 'var(--bb-success)' }}>
            -R$ {fmtPrice(plano.descontoPacote)}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          TOTAL
        </span>
        <span className="text-xl font-extrabold" style={{ color: 'var(--bb-brand)' }}>
          R$ {fmtPrice(plano.total)}
          <span className="text-sm font-normal" style={{ color: 'var(--bb-ink-40)' }}>
            /mes
          </span>
        </span>
      </div>

      {/* Annual savings */}
      {plano.ciclo === 'mensal' && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: 'var(--bb-brand-surface)' }}
        >
          <p className="font-medium" style={{ color: 'var(--bb-brand)' }}>
            No anual: R$ {fmtPrice(plano.total * 0.8)}/mes
          </p>
          <p style={{ color: 'var(--bb-ink-60)' }}>
            Economia: R$ {fmtPrice(plano.total * 0.2 * 12)}/ano
          </p>
        </div>
      )}

      {plano.ciclo === 'anual' && plano.economiaAnual > 0 && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: 'var(--bb-success-surface)' }}
        >
          <p className="font-medium" style={{ color: 'var(--bb-success)' }}>
            Voce economiza R$ {fmtPrice(plano.economiaAnual)}/ano com o plano anual!
          </p>
        </div>
      )}

      {/* Discovery bonus */}
      <div
        className="rounded-lg p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)',
          border: '1px solid rgba(251,191,36,0.2)',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
          BONUS: 90 dias com TODOS os 16 modulos!
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          Teste tudo sem custo extra nos primeiros 90 dias.
        </p>
      </div>

      {/* CTA */}
      {!compact && (
        <>
          <Link
            href="/cadastrar-academia"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--bb-brand-gradient)', boxShadow: 'var(--bb-brand-glow)' }}
          >
            COMECAR GRATIS — 7 DIAS
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Sem cartao de credito.
          </p>
          <Link
            href="/contato"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all"
            style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-60)' }}
          >
            Falar com consultor
          </Link>
        </>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function PrecosCalculadoraPage() {
  /* State */
  const [faixas, setFaixas] = useState<FaixaBase[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [pacotes, setPacotes] = useState<PacoteSugerido[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFaixa, setSelectedFaixa] = useState<FaixaBase | null>(null);
  const [selectedModulos, setSelectedModulos] = useState<Set<string>>(new Set());
  const [selectedPacote, setSelectedPacote] = useState<PacoteSugerido | null>(null);
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal');
  const [professoresExtra, setProfessoresExtra] = useState(0);
  const [unidadesExtra, setUnidadesExtra] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  /* Load data */
  useEffect(() => {
    async function load() {
      try {
        const [f, m, p] = await Promise.all([getFaixas(), getModulos(), getPacotes()]);
        setFaixas(f);
        setModulos(m);
        setPacotes(p);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* Toggle module */
  const toggleModulo = useCallback(
    (slug: string) => {
      setSelectedModulos((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) {
          next.delete(slug);
        } else {
          next.add(slug);
        }
        return next;
      });
      setSelectedPacote(null);
    },
    [],
  );

  /* Select package */
  const selectPacote = useCallback(
    (pacote: PacoteSugerido) => {
      if (selectedPacote?.slug === pacote.slug) {
        setSelectedPacote(null);
        return;
      }
      setSelectedPacote(pacote);
      setSelectedModulos(new Set(pacote.modulosSlugs));
    },
    [selectedPacote],
  );

  /* Compute plan */
  const plano: PlanoMontado | null = useMemo(() => {
    if (!selectedFaixa) return null;
    const selectedMods = modulos.filter((m) => selectedModulos.has(m.slug));
    return calcularPlano({
      faixa: selectedFaixa,
      modulos: selectedMods,
      professoresAdicionais: professoresExtra,
      unidadesAdicionais: unidadesExtra,
      ciclo,
      pacote: selectedPacote ?? undefined,
    });
  }, [selectedFaixa, selectedModulos, selectedPacote, ciclo, professoresExtra, unidadesExtra, modulos]);

  /* Grouped modules */
  const modulosPorCategoria = useMemo(() => {
    const grouped: Record<string, Modulo[]> = {};
    for (const cat of CATEGORIA_ORDER) {
      grouped[cat] = modulos.filter((m) => m.categoria === cat).sort((a, b) => a.ordem - b.ordem);
    }
    return grouped;
  }, [modulos]);

  if (loading) return <LoadingSkeleton />;

  return (
    <>
      {/* ──────────── HERO ──────────── */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, var(--bb-brand-surface) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1
            className="animate-reveal text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            style={{ animationDelay: '0s' }}
          >
            Monte seu plano{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--bb-brand-gradient)' }}
            >
              BlackBelt
            </span>
          </h1>

          <p
            className="animate-reveal mx-auto mt-4 max-w-xl text-base sm:text-lg"
            style={{ color: 'var(--bb-ink-60)', animationDelay: '0.1s' }}
          >
            Pague apenas pelo que usa. Comece gratis.
          </p>

          {/* Discovery badge */}
          <div
            className="animate-reveal mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(251,191,36,0.3)',
              animationDelay: '0.15s',
            }}
          >
            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              7 dias gratis + 90 dias com TUDO liberado
            </span>
          </div>

          {/* Billing toggle */}
          <div
            className="animate-reveal mt-8 inline-flex items-center gap-3 rounded-full p-1"
            style={{
              backgroundColor: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              animationDelay: '0.2s',
            }}
          >
            <button
              onClick={() => setCiclo('mensal')}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: ciclo === 'mensal' ? 'var(--bb-brand-surface)' : 'transparent',
                color: ciclo === 'mensal' ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setCiclo('anual')}
              className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: ciclo === 'anual' ? 'var(--bb-brand-surface)' : 'transparent',
                color: ciclo === 'anual' ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              Anual
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: '7 DIAS GRATIS',
                desc: 'Tudo liberado. Sem cartao de credito. Explore todos os 16 modulos a vontade.',
                accent: 'var(--bb-brand)',
              },
              {
                step: '2',
                title: '90 DIAS DESCOBERTA',
                desc: 'Paga seu plano, mas USA TUDO. Descubra o que sua academia realmente precisa.',
                accent: '#f59e0b',
              },
              {
                step: '3',
                title: 'SEU PLANO',
                desc: 'So os modulos que escolheu ficam ativos. Adicione mais a qualquer momento.',
                accent: 'var(--bb-success)',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative overflow-hidden p-5 text-center transition-all hover:-translate-y-1 sm:p-6"
                style={{
                  borderRadius: 'var(--bb-radius-xl)',
                  border: '1px solid var(--bb-glass-border)',
                  backgroundColor: 'var(--bb-depth-2)',
                }}
              >
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: item.accent }}
                >
                  {item.step}
                </div>
                <h3 className="text-sm font-bold sm:text-base" style={{ color: item.accent }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  {item.desc}
                </p>
                {i < 2 && (
                  <ChevronRightIcon
                    className="absolute right-0 top-1/2 hidden h-5 w-5 -translate-y-1/2 translate-x-1/2 sm:block"
                    style={{ color: 'var(--bb-ink-20)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── MAIN 2-COLUMN LAYOUT ──────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* LEFT COLUMN — content */}
          <div className="min-w-0 flex-1 pb-32 lg:pb-16">
            {/* ──────── STEP 1: FAIXA ──────── */}
            <section className="mb-12">
              <div className="mb-6">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  Passo 1
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Quantos alunos tem sua academia?</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {faixas.map((faixa) => {
                  const isSelected = selectedFaixa?.id === faixa.id;
                  const price = ciclo === 'anual' ? faixa.precoAnual : faixa.precoMensal;
                  return (
                    <button
                      key={faixa.id}
                      onClick={() => setSelectedFaixa(faixa)}
                      className="relative flex flex-col items-start p-4 text-left transition-all hover:-translate-y-0.5"
                      style={{
                        borderRadius: 'var(--bb-radius-xl)',
                        border: isSelected ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                        backgroundColor: isSelected ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                        boxShadow: isSelected ? 'var(--bb-brand-glow)' : 'var(--bb-shadow-sm)',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'var(--bb-brand)' }}
                        >
                          <CheckIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-semibold" style={{ color: isSelected ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}>
                        {faixa.nome}
                      </span>
                      <span className="mt-2 text-xl font-extrabold" style={{ color: isSelected ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}>
                        R$ {fmtPriceShort(price)}
                        <span className="text-xs font-normal" style={{ color: 'var(--bb-ink-40)' }}>/mes</span>
                      </span>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {faixa.professoresInclusos} professor{faixa.professoresInclusos > 1 ? 'es' : ''}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {faixa.turmasInclusas} turmas
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Extras */}
              {selectedFaixa && (
                <div className="mt-6 space-y-4">
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
                    style={{ backgroundColor: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        Preciso de mais professores
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        +R$ 29/mes cada (alem dos {selectedFaixa.professoresInclusos} inclusos)
                      </p>
                    </div>
                    <NumberInput value={professoresExtra} onChange={setProfessoresExtra} />
                  </div>

                  <div
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
                    style={{ backgroundColor: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        Preciso de mais unidades
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        +R$ 49/mes cada (alem da {selectedFaixa.unidadesInclusas} inclusa)
                      </p>
                    </div>
                    <NumberInput value={unidadesExtra} onChange={setUnidadesExtra} />
                  </div>
                </div>
              )}
            </section>

            {/* ──────── PACKAGES ──────── */}
            {selectedFaixa && (
              <section className="mb-12">
                <div className="mb-6">
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--bb-brand)' }}
                  >
                    Atalho
                  </p>
                  <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                    Pacotes sugeridos
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Selecione um pacote ou monte seu plano abaixo.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {pacotes.map((pacote) => {
                    const isSelected = selectedPacote?.slug === pacote.slug;
                    const modCount = pacote.modulosSlugs.length;
                    return (
                      <button
                        key={pacote.id}
                        onClick={() => selectPacote(pacote)}
                        className="relative flex flex-col p-5 text-left transition-all hover:-translate-y-0.5"
                        style={{
                          borderRadius: 'var(--bb-radius-xl)',
                          border: isSelected
                            ? '2px solid var(--bb-brand)'
                            : pacote.popular
                              ? '2px solid var(--bb-brand-light)'
                              : '1px solid var(--bb-glass-border)',
                          backgroundColor: isSelected ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                          boxShadow: isSelected || pacote.popular ? 'var(--bb-brand-glow)' : 'var(--bb-shadow-sm)',
                        }}
                      >
                        {pacote.popular && (
                          <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold text-white"
                            style={{ background: 'var(--bb-brand-gradient)' }}
                          >
                            MAIS POPULAR
                          </div>
                        )}

                        {isSelected && (
                          <div
                            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'var(--bb-brand)' }}
                          >
                            <CheckIcon className="h-3 w-3 text-white" />
                          </div>
                        )}

                        <span className="text-2xl">{pacote.icone}</span>
                        <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          {pacote.nome}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {pacote.descricao}
                        </p>

                        <div className="mt-3">
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            R$ {fmtPriceShort(pacote.precoOriginal)}
                          </span>
                          <span className="ml-2 text-lg font-extrabold" style={{ color: 'var(--bb-brand)' }}>
                            R$ {fmtPriceShort(pacote.precoComDesconto)}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>/mes modulos</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}
                          >
                            -{pacote.descontoPercent}%
                          </span>
                          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            {modCount} modulos
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ──────── STEP 2: MODULOS ──────── */}
            <section className="mb-16">
              <div className="mb-6">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  Passo 2
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Escolha seus modulos</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Ative apenas o que precisa. Todos sao gratis nos primeiros 90 dias.
                </p>
              </div>

              {CATEGORIA_ORDER.map((cat) => {
                const mods = modulosPorCategoria[cat];
                if (!mods || mods.length === 0) return null;
                return (
                  <div key={cat} className="mb-8">
                    <h3
                      className="mb-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {CATEGORIA_LABELS[cat]}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {mods.map((mod) => {
                        const isActive = selectedModulos.has(mod.slug);
                        const price = ciclo === 'anual' ? mod.precoAnual : mod.precoMensal;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => toggleModulo(mod.slug)}
                            className="relative flex flex-col p-4 text-left transition-all hover:-translate-y-0.5"
                            style={{
                              borderRadius: 'var(--bb-radius-lg)',
                              border: isActive ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                              backgroundColor: isActive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                            }}
                          >
                            {/* Checkbox indicator */}
                            <div
                              className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded"
                              style={{
                                border: isActive ? 'none' : '2px solid var(--bb-ink-20)',
                                backgroundColor: isActive ? 'var(--bb-brand)' : 'transparent',
                                borderRadius: '6px',
                              }}
                            >
                              {isActive && <CheckIcon className="h-3 w-3 text-white" />}
                            </div>

                            {/* Popular badge */}
                            {mod.destaque && (
                              <span
                                className="mb-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{ backgroundColor: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                              >
                                <StarIcon className="h-2.5 w-2.5" /> Popular
                              </span>
                            )}

                            <span className="text-xl">{mod.icone}</span>
                            <h4 className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                              {mod.nome}
                            </h4>
                            <span className="mt-1 text-sm font-bold" style={{ color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-80)' }}>
                              R$ {fmtPriceShort(price)}
                              <span className="text-xs font-normal" style={{ color: 'var(--bb-ink-40)' }}>/mes</span>
                            </span>
                            <p
                              className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed"
                              style={{ color: 'var(--bb-ink-40)' }}
                            >
                              {mod.descricao}
                            </p>

                            {/* 90-day free badge */}
                            <div
                              className="mt-auto pt-3 text-[10px] font-semibold"
                              style={{ color: '#f59e0b' }}
                            >
                              Gratis nos primeiros 90 dias
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ──────────── TIMELINE ──────────── */}
            <section className="mb-16">
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
                  Como funciona
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Sua jornada no BlackBelt</h2>
              </div>

              {/* Desktop: horizontal timeline */}
              <div className="hidden sm:block">
                <div className="relative mx-auto max-w-4xl">
                  {/* Line */}
                  <div
                    className="absolute left-0 right-0 top-6 h-0.5"
                    style={{ backgroundColor: 'var(--bb-glass-border)' }}
                  />

                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Hoje', title: 'Trial gratis', desc: 'Tudo liberado. Sem cartao. Explore a vontade.', color: 'var(--bb-brand)' },
                      { label: 'Dia 7', title: 'Fim do trial', desc: 'Escolha seu plano e informe o pagamento.', color: 'var(--bb-brand)' },
                      { label: 'Dia 8', title: 'Plano ativo', desc: 'Cobra seu plano. MAS: tudo ainda liberado por +82 dias!', color: '#f59e0b' },
                      { label: 'Dia 90', title: 'Fim da descoberta', desc: 'Modulos extras desativam. Dados salvos por 90 dias.', color: '#f59e0b' },
                      { label: 'Dia 91+', title: 'Seu plano', desc: 'So os modulos pagos. Adicione mais a qualquer momento.', color: 'var(--bb-success)' },
                    ].map((item) => (
                      <div key={item.label} className="relative pt-10 text-center">
                        <div
                          className="absolute left-1/2 top-3 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-xs font-bold" style={{ color: item.color }}>
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--bb-ink-40)' }}>
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: vertical timeline */}
              <div className="sm:hidden">
                <div className="relative ml-4 space-y-6 border-l-2" style={{ borderColor: 'var(--bb-glass-border)' }}>
                  {[
                    { label: 'Hoje', title: 'Trial gratis', desc: 'Tudo liberado. Sem cartao de credito.', color: 'var(--bb-brand)' },
                    { label: 'Dia 7', title: 'Fim do trial', desc: 'Escolha seu plano e informe o pagamento.', color: 'var(--bb-brand)' },
                    { label: 'Dia 8', title: 'Plano ativo', desc: 'Cobra seu plano. Tudo liberado por +82 dias!', color: '#f59e0b' },
                    { label: 'Dia 90', title: 'Descoberta encerra', desc: 'Modulos extras desativam. Dados salvos.', color: '#f59e0b' },
                    { label: 'Dia 91+', title: 'Seu plano definitivo', desc: 'So modulos pagos. Adicione mais quando quiser.', color: 'var(--bb-success)' },
                  ].map((item) => (
                    <div key={item.label} className="relative pl-6">
                      <div
                        className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2"
                        style={{ backgroundColor: item.color, borderColor: 'var(--bb-depth-1)' }}
                      />
                      <p className="text-xs font-bold" style={{ color: item.color }}>{item.label}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{item.title}</p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ──────────── FAQ ──────────── */}
            <section className="mb-16">
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
                  FAQ
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Perguntas frequentes</h2>
              </div>

              <div className="space-y-3">
                {FAQ_DATA.map((item) => (
                  <FAQAccordion key={item.q} item={item} />
                ))}
              </div>
            </section>

            {/* ──────────── TESTIMONIALS ──────────── */}
            <section className="mb-16">
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
                  Depoimentos
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  Quem usa, recomenda
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {TESTIMONIALS_DATA.map((t) => (
                  <div
                    key={t.name}
                    className="relative p-5"
                    style={{
                      borderRadius: 'var(--bb-radius-xl)',
                      border: '1px solid var(--bb-glass-border)',
                      backgroundColor: 'var(--bb-depth-2)',
                    }}
                  >
                    <QuoteIcon className="mb-3 h-5 w-5" style={{ color: 'var(--bb-brand-light)' }} />
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: 'var(--bb-brand-gradient)' }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {t.role} &middot; {t.academy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ──────────── COMPARISON TABLE ──────────── */}
            <section className="mb-16">
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
                  Comparativo
                </p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Base vs Modulos</h2>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="py-3 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>
                        Funcionalidade
                      </th>
                      {['Base', '+Financeiro', '+Pedagogico', '+Videos', '+Gamificacao'].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-3 text-center text-xs font-semibold"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b"
                        style={{ borderColor: 'var(--bb-glass-border)' }}
                      >
                        <td className="py-3 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          {row.label}
                        </td>
                        {(['base', 'financeiro', 'pedagogico', 'streaming', 'gamificacao'] as const).map(
                          (key) => (
                            <td key={key} className="px-3 py-3 text-center">
                              <div className="flex justify-center">
                                <FeatureCell value={row[key]} />
                              </div>
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: simplified cards */}
              <div className="space-y-4 sm:hidden">
                {[
                  { title: 'Base (inclusa)', items: ['Turmas e alunos', 'Presenca manual', 'Comunicados'] },
                  { title: '+Financeiro (R$ 49/mes)', items: ['Mensalidades e cobranças', 'Boleto e PIX', 'Relatorios de inadimplencia'] },
                  { title: '+Pedagogico (R$ 39/mes)', items: ['Avaliacao radar', 'Promocao de faixa', 'Banco de tecnicas'] },
                  { title: '+Videos (R$ 49/mes)', items: ['Biblioteca Netflix-style', 'Trilhas de aprendizado', 'Quiz e certificados'] },
                  { title: '+Gamificacao (R$ 39/mes)', items: ['Sistema de XP', 'Ranking e conquistas', 'Desafios semanais'] },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-xl p-4"
                    style={{ border: '1px solid var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-2)' }}
                  >
                    <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {card.title}
                    </h4>
                    <ul className="space-y-1.5">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--bb-success)' }} />
                          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ──────────── FINAL CTA ──────────── */}
            <section className="mb-8">
              <div
                className="relative overflow-hidden p-8 text-center sm:p-12"
                style={{
                  borderRadius: 'var(--bb-radius-2xl)',
                  background: 'var(--bb-brand-gradient)',
                  boxShadow: 'var(--bb-brand-glow-strong)',
                }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
                  style={{ backgroundColor: 'white' }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full opacity-10"
                  style={{ backgroundColor: 'white' }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Pronto para transformar sua academia?
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
                    7 dias gratis. 90 dias de descoberta. Sem cartao de credito.
                  </p>
                  <Link
                    href="/cadastrar-academia"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ color: 'var(--bb-brand-deep)' }}
                  >
                    Comecar Trial Gratis
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — sticky summary (desktop only) */}
          <div className="hidden w-80 shrink-0 lg:block xl:w-96">
            <div
              className="sticky top-20"
              style={{
                borderRadius: 'var(--bb-radius-xl)',
                border: '1px solid var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
                boxShadow: 'var(--bb-shadow-lg)',
              }}
            >
              <div className="p-5 xl:p-6">
                {plano ? (
                  <SummaryContent plano={plano} />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                      Selecione uma faixa de alunos para montar seu plano.
                    </p>
                    <div className="mx-auto mt-4 h-0.5 w-16" style={{ backgroundColor: 'var(--bb-glass-border)' }} />
                    <p className="mt-4 text-xs" style={{ color: 'var(--bb-ink-20)' }}>
                      O resumo do seu plano aparecera aqui.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────── MOBILE STICKY BAR ──────────── */}
      <MobileSummaryBar
        plano={plano}
        expanded={mobileExpanded}
        onToggle={() => setMobileExpanded((prev) => !prev)}
      />
    </>
  );
}
