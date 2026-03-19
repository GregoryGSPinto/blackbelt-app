'use client';

import { useEffect, useState, useRef, useCallback, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import {
  getLandingPage,
  agendarExperimental,
  type LandingPageData,
  type LeadFormData,
} from '@/lib/api/landing-page.service';

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const DAYS_ORDER = [
  'Segunda',
  'Terca',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sabado',
  'Sábado',
  'Domingo',
];

function sortByDay(a: string, b: string): number {
  const ia = DAYS_ORDER.findIndex((d) => a.toLowerCase().startsWith(d.toLowerCase()));
  const ib = DAYS_ORDER.findIndex((d) => b.toLowerCase().startsWith(d.toLowerCase()));
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
}

/* ─── Animated Counter ─────────────────────────────────────────────── */

function CountUpValue({
  target,
  duration = 1600,
  decimals = 0,
  suffix = '',
}: {
  target: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || started.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={wrapperRef}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ─── Star Rating ──────────────────────────────────────────────────── */

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className="text-yellow-400">
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
      {hasHalf && (
        <svg width={size} height={size} viewBox="0 0 20 20" className="text-yellow-400">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" fill="url(#halfStar)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width={size} height={size} viewBox="0 0 20 20" fill="#D1D5DB">
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
    </span>
  );
}

/* ─── Skeleton Loader ──────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Hero skeleton */}
      <div className="h-[70vh] w-full" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-4 px-4">
          <div className="h-10 w-64 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="h-6 w-48 rounded-lg" style={{ backgroundColor: '#222' }} />
          <div className="mt-4 h-14 w-80 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-8 w-48 rounded-lg mx-auto mb-8" style={{ backgroundColor: '#1a1a1a' }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl" style={{ backgroundColor: '#1a1a1a' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Not Found ────────────────────────────────────────────────────── */

function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#0f0f0f', color: '#fff' }}
    >
      <div className="text-6xl mb-4">🥋</div>
      <h1 className="text-3xl font-bold">Academia nao encontrada</h1>
      <p className="mt-3 text-lg" style={{ color: '#999' }}>
        O link que voce acessou nao corresponde a nenhuma academia cadastrada.
      </p>
      <a
        href="/landing"
        className="mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        Voltar para o inicio
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function AcademyLandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    telefone: '',
    modalidade: '',
    turma: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; mensagem: string } | null>(null);

  // Testimonial carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  /* ── Load data ── */
  useEffect(() => {
    async function load() {
      try {
        const result = await getLandingPage(slug);
        if (!result) {
          setNotFound(true);
        } else {
          setData(result);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  /* ── Smooth scroll ── */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Handle form submit ── */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!formData.nome || !formData.telefone || !formData.modalidade || !formData.turma) return;
      setSubmitting(true);
      setSubmitResult(null);
      try {
        const result = await agendarExperimental(slug, formData);
        setSubmitResult(result);
        if (result.success) {
          setFormData({ nome: '', telefone: '', modalidade: '', turma: '' });
        }
      } catch {
        setSubmitResult({ success: false, mensagem: 'Erro ao agendar. Tente novamente.' });
      } finally {
        setSubmitting(false);
      }
    },
    [slug, formData],
  );

  /* ── Loading / Not found ── */
  if (loading) return <Skeleton />;
  if (notFound || !data) return <NotFound />;

  /* ── Derived values ── */
  const isDark = data.visual.tema === 'escuro';
  const primary = data.visual.corPrimaria;
  const secondary = data.visual.corSecundaria;

  const bg = isDark ? '#0c0c0c' : '#ffffff';
  const bgAlt = isDark ? '#141414' : '#f5f5f5';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const bgCardAlt = isDark ? '#222222' : '#f9fafb';
  const ink100 = isDark ? '#ffffff' : '#111111';
  const ink80 = isDark ? '#cccccc' : '#333333';
  const ink60 = isDark ? '#999999' : '#666666';
  const ink40 = isDark ? '#666666' : '#999999';
  const ink20 = isDark ? '#333333' : '#e5e5e5';
  const border = isDark ? '#2a2a2a' : '#e5e7eb';
  const gradient = `linear-gradient(135deg, ${primary}, ${secondary})`;

  // Group grade by day
  const gradeByDay: Record<string, typeof data.grade> = {};
  for (const item of data.grade) {
    if (!gradeByDay[item.diaSemana]) gradeByDay[item.diaSemana] = [];
    gradeByDay[item.diaSemana].push(item);
  }
  const sortedDays = Object.keys(gradeByDay).sort(sortByDay);

  /* ── WhatsApp link ── */
  const waLink = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(
    'Ola! Vi o site da ' + data.nome + ' e gostaria de mais informacoes.',
  )}`;

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: ink100 }}>
      {/* ─────────── SECTION 1: HERO ─────────── */}
      <section
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20 sm:min-h-[80vh] sm:py-28"
        style={{
          background: data.visual.heroBanner
            ? `url(${data.visual.heroBanner}) center/cover no-repeat`
            : gradient,
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: data.visual.heroBanner
              ? `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)`
              : `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Logo */}
          {data.logo && (
            <img
              src={data.logo}
              alt={`Logo ${data.nome}`}
              className="mx-auto mb-6 h-20 w-20 rounded-2xl object-contain shadow-lg sm:h-24 sm:w-24"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
            />
          )}

          {/* Academy name */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            {data.nome}
          </h1>

          {/* City / tagline */}
          <p className="mt-3 text-lg font-medium text-white/80 sm:text-xl">
            {data.cidade}
          </p>

          {/* Rating + stats */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90 sm:gap-4 sm:text-base">
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={data.stats.notaGoogle} size={18} />
              <span className="font-semibold">{data.stats.notaGoogle}</span>
              <span className="text-white/60">Google</span>
            </span>
            <span className="text-white/40">|</span>
            <span>{data.stats.alunosAtivos}+ alunos</span>
            <span className="text-white/40">|</span>
            <span>{data.stats.anosExistencia}+ anos</span>
          </div>

          {/* Description */}
          {data.descricao && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {data.descricao}
            </p>
          )}

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => scrollTo('agendar')}
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold shadow-2xl transition-all hover:-translate-y-0.5 hover:shadow-3xl sm:text-lg"
              style={{
                backgroundColor: '#ffffff',
                color: primary,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              AGENDAR AULA EXPERIMENTAL GRATIS
            </button>
            {data.whatsapp && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:text-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── SECTION 2: MODALIDADES ─────────── */}
      {data.modalidades.length > 0 && (
        <section className="px-4 py-16 sm:py-24" style={{ backgroundColor: bg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                Modalidades
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Nossas modalidades
              </h2>
              <p className="mt-3 text-base" style={{ color: ink60 }}>
                Encontre a arte marcial ideal para voce
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.modalidades.map((mod) => (
                <div
                  key={mod.nome}
                  className="group overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${border}`,
                    boxShadow: isDark
                      ? '0 4px 24px rgba(0,0,0,0.3)'
                      : '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${primary}15` }}
                  >
                    {mod.icone}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold">{mod.nome}</h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: ink60 }}>
                    {mod.descricao}
                  </p>

                  {/* Professors */}
                  {mod.professores.length > 0 && (
                    <div className="mt-4 border-t pt-4" style={{ borderColor: border }}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: ink40 }}>
                        Professores
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {mod.professores.map((prof) => (
                          <div key={prof.nome} className="flex items-center gap-2">
                            {prof.foto ? (
                              <img
                                src={prof.foto}
                                alt={prof.nome}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ background: gradient }}
                              >
                                {prof.nome.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-medium">{prof.nome}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                              style={{
                                backgroundColor: `${primary}15`,
                                color: primary,
                              }}
                            >
                              {prof.faixa}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── SECTION 3: GRADE HORARIA ─────────── */}
      {data.grade.length > 0 && (
        <section className="px-4 py-16 sm:py-24" style={{ backgroundColor: bgAlt }}>
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                Horarios
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Grade horaria
              </h2>
              <p className="mt-3 text-base" style={{ color: ink60 }}>
                Confira os horarios disponiveis e encontre a turma ideal
              </p>
            </div>

            {/* Desktop table */}
            <div className="mt-12 overflow-x-auto rounded-2xl" style={{ border: `1px solid ${border}` }}>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${primary}10` }}>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: ink80 }}>Dia</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: ink80 }}>Horario</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: ink80 }}>Turma</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: ink80 }}>Modalidade</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: ink80 }}>Professor</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: ink80 }}>Vagas</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDays.map((day) =>
                    gradeByDay[day].map((item, idx) => (
                      <tr
                        key={`${day}-${idx}`}
                        className="transition-colors"
                        style={{
                          backgroundColor: idx % 2 === 0 ? bgCard : bgCardAlt,
                          borderTop: `1px solid ${border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${primary}08`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = idx % 2 === 0 ? bgCard : bgCardAlt;
                        }}
                      >
                        <td className="px-4 py-3 font-medium">{idx === 0 ? day : ''}</td>
                        <td className="px-4 py-3 font-mono text-sm" style={{ color: primary }}>
                          {item.horario}
                        </td>
                        <td className="px-4 py-3">{item.turma}</td>
                        <td className="px-4 py-3">{item.modalidade}</td>
                        <td className="px-4 py-3" style={{ color: ink60 }}>{item.professor}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor:
                                item.vagasDisponiveis > 5
                                  ? '#10b98120'
                                  : item.vagasDisponiveis > 0
                                    ? '#f59e0b20'
                                    : '#ef444420',
                              color:
                                item.vagasDisponiveis > 5
                                  ? '#10b981'
                                  : item.vagasDisponiveis > 0
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          >
                            {item.vagasDisponiveis > 0 ? `${item.vagasDisponiveis} vagas` : 'Lotada'}
                          </span>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ─────────── SECTION 4: PLANOS E PRECOS ─────────── */}
      {data.planos.length > 0 && (
        <section className="px-4 py-16 sm:py-24" style={{ backgroundColor: bg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                Planos
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Planos e precos
              </h2>
              <p className="mt-3 text-base" style={{ color: ink60 }}>
                Escolha o plano ideal para sua jornada
              </p>
            </div>

            <div
              className="mt-12 grid gap-6"
              style={{
                gridTemplateColumns:
                  data.planos.length === 1
                    ? '1fr'
                    : data.planos.length === 2
                      ? 'repeat(auto-fit, minmax(280px, 1fr))'
                      : 'repeat(auto-fit, minmax(280px, 1fr))',
              }}
            >
              {data.planos.map((plano) => (
                <div
                  key={plano.nome}
                  className="relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 sm:p-8"
                  style={{
                    backgroundColor: bgCard,
                    border: plano.destaque ? `2px solid ${primary}` : `1px solid ${border}`,
                    boxShadow: plano.destaque
                      ? `0 8px 40px ${primary}25`
                      : isDark
                        ? '0 4px 24px rgba(0,0,0,0.3)'
                        : '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Destaque badge */}
                  {plano.destaque && (
                    <div
                      className="absolute right-0 top-0 rounded-bl-xl px-4 py-1.5 text-xs font-bold text-white"
                      style={{ background: gradient }}
                    >
                      MAIS POPULAR
                    </div>
                  )}

                  {/* Plan name */}
                  <h3 className="text-lg font-bold">{plano.nome}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: ink40 }}>
                    {plano.periodo}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: plano.destaque ? primary : ink100 }}
                    >
                      {formatCurrency(plano.preco)}
                    </span>
                    <span className="text-sm" style={{ color: ink40 }}>
                      /{plano.periodo === 'mensal' ? 'mes' : plano.periodo}
                    </span>
                  </div>

                  {/* Benefits */}
                  <ul className="mt-6 flex-1 space-y-3">
                    {plano.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={primary}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-sm leading-relaxed" style={{ color: ink80 }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => scrollTo('agendar')}
                    className="mt-8 w-full rounded-xl py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5"
                    style={
                      plano.destaque
                        ? {
                            background: gradient,
                            color: '#ffffff',
                            boxShadow: `0 4px 20px ${primary}30`,
                          }
                        : {
                            backgroundColor: `${primary}12`,
                            color: primary,
                            border: `1px solid ${primary}30`,
                          }
                    }
                  >
                    Quero este plano
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── SECTION 5: DEPOIMENTOS ─────────── */}
      {data.depoimentos.length > 0 && (
        <section className="py-16 sm:py-24" style={{ backgroundColor: bgAlt }}>
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                Depoimentos
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                O que nossos alunos dizem
              </h2>
            </div>
          </div>

          {/* Horizontal scroll carousel */}
          <div
            ref={carouselRef}
            className="mt-12 flex gap-6 overflow-x-auto px-4 pb-4 scrollbar-hide sm:px-8"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Left spacer for centering on large screens */}
            <div className="hidden shrink-0 lg:block" style={{ width: 'calc((100vw - 72rem) / 2)' }} />

            {data.depoimentos.map((dep, idx) => (
              <div
                key={idx}
                className="w-[300px] shrink-0 rounded-2xl p-6 sm:w-[360px]"
                style={{
                  scrollSnapAlign: 'start',
                  backgroundColor: bgCard,
                  border: `1px solid ${border}`,
                  boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.3)'
                    : '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                {/* Stars */}
                <div className="mb-4">
                  <StarRating rating={dep.nota} size={16} />
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed" style={{ color: ink80 }}>
                  &ldquo;{dep.texto}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: border }}>
                  {dep.foto ? (
                    <img
                      src={dep.foto}
                      alt={dep.nome}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: gradient }}
                    >
                      {dep.nome.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{dep.nome}</p>
                    <p className="text-xs" style={{ color: ink40 }}>
                      Faixa {dep.faixa}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Right spacer */}
            <div className="hidden shrink-0 lg:block" style={{ width: 'calc((100vw - 72rem) / 2)' }} />
          </div>
        </section>
      )}

      {/* ─────────── SECTION 6: ESTATISTICAS ─────────── */}
      <section className="px-4 py-16 sm:py-24" style={{ backgroundColor: bg }}>
        <div className="mx-auto max-w-4xl">
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
          >
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <p className="text-3xl font-extrabold sm:text-4xl" style={{ color: primary }}>
                <CountUpValue target={data.stats.alunosAtivos} />
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: ink60 }}>
                Alunos ativos
              </p>
            </div>
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <p className="text-3xl font-extrabold sm:text-4xl" style={{ color: primary }}>
                <CountUpValue target={data.stats.anosExistencia} />
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: ink60 }}>
                Anos de historia
              </p>
            </div>
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <p className="text-3xl font-extrabold sm:text-4xl" style={{ color: primary }}>
                <CountUpValue target={data.stats.modalidades} />
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: ink60 }}>
                Modalidades
              </p>
            </div>
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <p className="text-3xl font-extrabold sm:text-4xl" style={{ color: primary }}>
                <CountUpValue target={data.stats.notaGoogle} decimals={1} />
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: ink60 }}>
                Nota Google
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── SECTION 7: FORMULARIO AULA EXPERIMENTAL ─────────── */}
      {data.experimentalAtiva && (
        <section
          id="agendar"
          className="scroll-mt-8 px-4 py-16 sm:py-24"
          style={{ backgroundColor: bgAlt }}
        >
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                Aula experimental
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Agende sua aula gratis
              </h2>
              <p className="mt-3 text-base" style={{ color: ink60 }}>
                Preencha o formulario e entraremos em contato para confirmar sua aula
              </p>
            </div>

            {/* Form card */}
            <div
              className="mt-10 rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: bgCard,
                border: `1px solid ${border}`,
                boxShadow: isDark
                  ? '0 8px 40px rgba(0,0,0,0.4)'
                  : '0 8px 40px rgba(0,0,0,0.08)',
              }}
            >
              {submitResult?.success ? (
                <div className="py-8 text-center">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#10b98120' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#10b981' }}>
                    Agendamento realizado!
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: ink60 }}>
                    {submitResult.mensagem}
                  </p>
                  <button
                    onClick={() => setSubmitResult(null)}
                    className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: `${primary}12`, color: primary }}
                  >
                    Agendar outra aula
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nome */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: ink80 }}>
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                      placeholder="Seu nome"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-40"
                      style={{
                        backgroundColor: isDark ? '#111111' : '#f5f5f5',
                        border: `1px solid ${border}`,
                        color: ink100,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: ink80 }}>
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-40"
                      style={{
                        backgroundColor: isDark ? '#111111' : '#f5f5f5',
                        border: `1px solid ${border}`,
                        color: ink100,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Modalidade */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: ink80 }}>
                      Modalidade de interesse *
                    </label>
                    <select
                      required
                      value={formData.modalidade}
                      onChange={(e) => setFormData((prev) => ({ ...prev, modalidade: e.target.value }))}
                      className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: isDark ? '#111111' : '#f5f5f5',
                        border: `1px solid ${border}`,
                        color: formData.modalidade ? ink100 : ink40,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Selecione uma modalidade</option>
                      {data.modalidades.map((mod) => (
                        <option key={mod.nome} value={mod.nome}>
                          {mod.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Turma */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: ink80 }}>
                      Turma / Horario preferido *
                    </label>
                    <select
                      required
                      value={formData.turma}
                      onChange={(e) => setFormData((prev) => ({ ...prev, turma: e.target.value }))}
                      className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: isDark ? '#111111' : '#f5f5f5',
                        border: `1px solid ${border}`,
                        color: formData.turma ? ink100 : ink40,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Selecione uma turma</option>
                      {data.turmasExperimental.map((turma) => (
                        <option key={turma} value={turma}>
                          {turma}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Error message */}
                  {submitResult && !submitResult.success && (
                    <div
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}
                    >
                      {submitResult.mensagem}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{
                      background: gradient,
                      boxShadow: `0 4px 20px ${primary}30`,
                    }}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Agendando...
                      </span>
                    ) : (
                      'AGENDAR MINHA AULA GRATIS'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── SECTION 8: MAPA + CONTATO ─────────── */}
      <section className="px-4 py-16 sm:py-24" style={{ backgroundColor: bg }}>
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
              Contato
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Onde estamos
            </h2>
          </div>

          <div
            className="mt-10 grid gap-6 sm:grid-cols-2"
          >
            {/* Contact info */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: bgCard,
                border: `1px solid ${border}`,
                boxShadow: isDark
                  ? '0 4px 24px rgba(0,0,0,0.3)'
                  : '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              <h3 className="text-lg font-bold mb-6">Informacoes de contato</h3>

              <div className="space-y-5">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${primary}12` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ink40 }}>
                      Endereco
                    </p>
                    <p className="mt-0.5 text-sm" style={{ color: ink80 }}>{data.endereco}</p>
                    <p className="text-sm" style={{ color: ink60 }}>{data.cidade}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${primary}12` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ink40 }}>
                      Telefone
                    </p>
                    <a href={`tel:${data.telefone}`} className="mt-0.5 block text-sm font-medium" style={{ color: primary }}>
                      {data.telefone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${primary}12` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ink40 }}>
                      Email
                    </p>
                    <a href={`mailto:${data.email}`} className="mt-0.5 block text-sm font-medium" style={{ color: primary }}>
                      {data.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                {data.whatsapp && (
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: '#25D36612' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ink40 }}>
                        WhatsApp
                      </p>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block text-sm font-medium"
                        style={{ color: '#25D366' }}
                      >
                        Enviar mensagem
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social media + map placeholder */}
            <div className="flex flex-col gap-6">
              {/* Social links */}
              {(data.instagram || data.facebook || data.youtube) && (
                <div
                  className="rounded-2xl p-6 sm:p-8"
                  style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${border}`,
                    boxShadow: isDark
                      ? '0 4px 24px rgba(0,0,0,0.3)'
                      : '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-4">Redes sociais</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.instagram && (
                      <a
                        href={data.instagram.startsWith('http') ? data.instagram : `https://instagram.com/${data.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: `${primary}10`,
                          color: primary,
                          border: `1px solid ${primary}20`,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        Instagram
                      </a>
                    )}

                    {data.facebook && (
                      <a
                        href={data.facebook.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: '#1877F210',
                          color: '#1877F2',
                          border: '1px solid #1877F220',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </a>
                    )}

                    {data.youtube && (
                      <a
                        href={data.youtube.startsWith('http') ? data.youtube : `https://youtube.com/${data.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: '#FF000010',
                          color: '#FF0000',
                          border: '1px solid #FF000020',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Map embed placeholder using address */}
              <div
                className="flex-1 overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: bgCard,
                  border: `1px solid ${border}`,
                  minHeight: '220px',
                  boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.3)'
                    : '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                <iframe
                  title={`Mapa ${data.nome}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '220px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(data.endereco + ', ' + data.cidade)}&output=embed`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer
        className="border-t px-4 py-8 text-center"
        style={{
          borderColor: border,
          backgroundColor: bgAlt,
        }}
      >
        <p className="text-sm" style={{ color: ink40 }}>
          &copy; {new Date().getFullYear()} {data.nome}. Todos os direitos reservados.
        </p>
        <p className="mt-2 text-xs" style={{ color: ink20 }}>
          Powered by{' '}
          <a
            href="/landing"
            className="font-medium transition-colors"
            style={{ color: ink40 }}
          >
            BlackBelt
          </a>
        </p>
      </footer>

      {/* ─────────── Scrollbar hide utility ─────────── */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
