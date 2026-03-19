'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import {
  getLandingPageByAcademy,
  updateLandingPage,
  type LandingPageData,
} from '@/lib/api/landing-page.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

// ── Constants ────────────────────────────────────────────────────────

const ACADEMY_ID = 'academy-bb-001';
const BASE_URL = 'blackbeltv2.vercel.app';

const cardStyle: CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const inputStyle: CSSProperties = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-sm)',
  color: 'var(--bb-ink-100)',
};

const labelStyle: CSSProperties = {
  color: 'var(--bb-ink-80)',
};

// ── Inline SVG icons ─────────────────────────────────────────────────

function IconGlobe({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconCopy({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function IconExternalLink({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconPhone({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconPalette({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill={color} />
      <circle cx="17.5" cy="10.5" r="0.5" fill={color} />
      <circle cx="8.5" cy="7.5" r="0.5" fill={color} />
      <circle cx="6.5" cy="12.5" r="0.5" fill={color} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function IconTag({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconCalendarCheck({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex h-7 w-12 flex-shrink-0 items-center transition-colors duration-200"
      style={{
        borderRadius: '9999px',
        background: enabled ? 'var(--bb-brand)' : 'var(--bb-ink-20)',
        minWidth: '48px',
        minHeight: '44px',
      }}
    >
      <span
        className="inline-block h-5 w-5 transform transition-transform duration-200"
        style={{
          borderRadius: '50%',
          background: '#fff',
          transform: enabled ? 'translateX(24px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}

// ── Section header ───────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ size?: number; color: string }>;

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: IconComponent;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={16} color="var(--bb-ink-40)" />
      <h2
        className="font-display text-sm font-semibold uppercase"
        style={{
          color: 'var(--bb-ink-60)',
          letterSpacing: '0.06em',
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────

function SiteSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="text" className="h-4 w-80" />
      <Skeleton variant="card" className="h-20" />
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-40" />
    </div>
  );
}

// ── Main page component ──────────────────────────────────────────────

export default function AdminSitePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [slug, setSlug] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#EF4444');
  const [corSecundaria, setCorSecundaria] = useState('#B91C1C');
  const [tema, setTema] = useState<'claro' | 'escuro'>('claro');
  const [experimentalAtiva, setExperimentalAtiva] = useState(false);
  const [turmasExperimental, setTurmasExperimental] = useState<string[]>([]);
  const [planos, setPlanos] = useState<LandingPageData['planos']>([]);

  // Original data for reference
  const [originalData, setOriginalData] = useState<LandingPageData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLandingPageByAcademy(ACADEMY_ID);
        if (data) {
          setOriginalData(data);
          setNome(data.nome);
          setDescricao(data.descricao);
          setSlug(data.slug);
          setTelefone(data.telefone);
          setWhatsapp(data.whatsapp);
          setEmail(data.email);
          setInstagram(data.instagram ?? '');
          setFacebook(data.facebook ?? '');
          setYoutube(data.youtube ?? '');
          setCorPrimaria(data.visual.corPrimaria);
          setCorSecundaria(data.visual.corSecundaria);
          setTema(data.visual.tema);
          setExperimentalAtiva(data.experimentalAtiva);
          setTurmasExperimental(data.turmasExperimental);
          setPlanos(data.planos);
        }
      } catch {
        toast('Erro ao carregar dados do site', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // ── Handlers ────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      await updateLandingPage(ACADEMY_ID, {
        nome,
        descricao,
        slug,
        telefone,
        whatsapp,
        email,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        youtube: youtube || undefined,
        visual: {
          corPrimaria,
          corSecundaria,
          tema,
        },
        experimentalAtiva,
        turmasExperimental,
      });
      toast('Site atualizado com sucesso!', 'success');
    } catch {
      toast('Erro ao salvar alteracoes', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handlePreview() {
    if (slug) {
      window.open(`/g/${slug}`, '_blank');
    }
  }

  function handleCopyUrl() {
    const url = `${BASE_URL}/g/${slug}`;
    navigator.clipboard.writeText(url);
    toast('URL copiada!', 'success');
  }

  function toggleTurmaExperimental(turma: string) {
    setTurmasExperimental((prev) =>
      prev.includes(turma) ? prev.filter((t) => t !== turma) : [...prev, turma],
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) return <SiteSkeleton />;

  // All turmas from original data for the experimental section
  const allTurmas = originalData?.grade.map((g) => g.turma) ?? [];
  const uniqueTurmas = [...new Set(allTurmas)];

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6 animate-reveal overflow-x-hidden">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <IconGlobe size={24} color="var(--bb-brand)" />
          <h1
            className="font-display text-xl font-bold sm:text-2xl"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Meu Site
          </h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Personalize a pagina publica da sua academia
        </p>
      </div>

      <div data-stagger className="space-y-6 max-w-3xl">
        {/* ── Link preview ─────────────────────────────────────────── */}
        {slug && (
          <div
            className="flex items-center gap-3 p-4"
            style={{
              background: 'var(--bb-brand-surface)',
              border: '1px solid var(--bb-brand)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <IconGlobe size={18} color="var(--bb-brand)" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                URL publica
              </p>
              <p
                className="truncate text-sm font-mono font-medium"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {BASE_URL}/g/{slug}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-sm)',
                color: 'var(--bb-ink-80)',
                minHeight: '44px',
              }}
            >
              <IconCopy size={14} color="var(--bb-ink-60)" />
              Copiar
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
              style={{
                background: 'var(--bb-brand)',
                color: '#fff',
                borderRadius: 'var(--bb-radius-sm)',
                minHeight: '44px',
              }}
            >
              <IconExternalLink size={14} color="#fff" />
              Visitar
            </button>
          </div>
        )}

        {/* ── Informacoes Basicas ───────────────────────────────────── */}
        <section>
          <SectionHeader icon={IconGlobe} title="Informacoes Basicas" />
          <div style={cardStyle} className="p-4 sm:p-6 space-y-4">
            {/* Nome da academia */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Nome da Academia
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Guerreiros BJJ"
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>

            {/* Descricao */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Descricao
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva sua academia em poucas palavras..."
                rows={4}
                className="w-full resize-none px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Esta descricao aparece na pagina publica e nos resultados de busca
              </p>
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Slug (URL)
              </label>
              <div className="flex items-stretch">
                <span
                  className="flex items-center px-3 text-xs font-mono"
                  style={{
                    background: 'var(--bb-depth-1)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRight: 'none',
                    borderRadius: 'var(--bb-radius-sm) 0 0 var(--bb-radius-sm)',
                    color: 'var(--bb-ink-40)',
                  }}
                >
                  {BASE_URL}/g/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="minha-academia"
                  className="flex-1 px-3 py-2.5 text-sm font-mono outline-none transition-colors"
                  style={{
                    ...inputStyle,
                    borderRadius: '0 var(--bb-radius-sm) var(--bb-radius-sm) 0',
                  }}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Apenas letras minusculas, numeros e hifens
              </p>
            </div>
          </div>
        </section>

        {/* ── Contato ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={IconPhone} title="Contato" />
          <div style={cardStyle} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Telefone */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-0000"
                  className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-0000"
                  className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@suaacademia.com.br"
                  className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  Instagram
                </label>
                <div className="flex items-stretch">
                  <span
                    className="flex items-center px-3 text-xs"
                    style={{
                      background: 'var(--bb-depth-1)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRight: 'none',
                      borderRadius: 'var(--bb-radius-sm) 0 0 var(--bb-radius-sm)',
                      color: 'var(--bb-ink-40)',
                    }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="suaacademia"
                    className="flex-1 px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      ...inputStyle,
                      borderRadius: '0 var(--bb-radius-sm) var(--bb-radius-sm) 0',
                    }}
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  Facebook
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/suaacademia"
                  className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>

              {/* YouTube */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                  YouTube
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/@suaacademia"
                  className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Visual ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={IconPalette} title="Visual" />
          <div style={cardStyle} className="p-4 sm:p-6 space-y-5">
            {/* Cor primaria */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Cor Primaria
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border-0"
                  style={{ background: 'transparent' }}
                />
                <input
                  type="text"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="px-3 py-2.5 text-sm font-mono outline-none transition-colors"
                  style={inputStyle}
                />
                <span
                  className="h-8 w-8 rounded"
                  style={{
                    background: corPrimaria,
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                />
              </div>
            </div>

            {/* Cor secundaria */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Cor Secundaria
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={corSecundaria}
                  onChange={(e) => setCorSecundaria(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border-0"
                  style={{ background: 'transparent' }}
                />
                <input
                  type="text"
                  value={corSecundaria}
                  onChange={(e) => setCorSecundaria(e.target.value)}
                  className="px-3 py-2.5 text-sm font-mono outline-none transition-colors"
                  style={inputStyle}
                />
                <span
                  className="h-8 w-8 rounded"
                  style={{
                    background: corSecundaria,
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                />
              </div>
            </div>

            {/* Tema toggle */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>
                Tema
              </label>
              <div
                className="inline-flex overflow-hidden"
                style={{
                  borderRadius: 'var(--bb-radius-sm)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTema('claro')}
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: tema === 'claro' ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                    color: tema === 'claro' ? '#fff' : 'var(--bb-ink-60)',
                    minHeight: '44px',
                  }}
                >
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTema('escuro')}
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: tema === 'escuro' ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                    color: tema === 'escuro' ? '#fff' : 'var(--bb-ink-60)',
                    minHeight: '44px',
                  }}
                >
                  Escuro
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Planos ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={IconTag} title="Planos" />
          <div style={cardStyle} className="p-4 sm:p-6">
            {planos.length > 0 ? (
              <div className="space-y-3">
                {planos.map((plano, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                    style={{
                      background: plano.destaque ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                      border: plano.destaque ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-sm)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {plano.nome}
                        </p>
                        {plano.destaque && (
                          <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              background: 'var(--bb-brand)',
                              color: '#fff',
                              borderRadius: 'var(--bb-radius-sm)',
                            }}
                          >
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        R$ {plano.preco.toFixed(2).replace('.', ',')} / {plano.periodo}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {plano.beneficios.length} beneficio{plano.beneficios.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Para editar planos, acesse Configuracoes &gt; Planos
                </p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhum plano cadastrado
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Cadastre planos em Configuracoes &gt; Planos para exibi-los no site
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Aula Experimental ─────────────────────────────────────── */}
        <section>
          <SectionHeader icon={IconCalendarCheck} title="Aula Experimental" />
          <div style={cardStyle} className="p-4 sm:p-6 space-y-4">
            {/* Toggle on/off */}
            <div
              className="flex items-center justify-between gap-4"
              style={{ borderBottom: '1px solid var(--bb-glass-border)', paddingBottom: '16px' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Aula experimental ativa
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Permite que visitantes agendem uma aula gratuita pelo site
                </p>
              </div>
              <ToggleSwitch
                enabled={experimentalAtiva}
                onToggle={() => setExperimentalAtiva(!experimentalAtiva)}
                label="Ativar aula experimental"
              />
            </div>

            {/* Turmas list */}
            {experimentalAtiva && (
              <div>
                <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Turmas que aceitam aula experimental
                </p>
                {uniqueTurmas.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueTurmas.map((turma) => (
                      <label
                        key={turma}
                        className="flex cursor-pointer items-center gap-3 rounded px-3 py-2.5 transition-colors"
                        style={{
                          background: turmasExperimental.includes(turma)
                            ? 'var(--bb-brand-surface)'
                            : 'var(--bb-depth-2)',
                          border: turmasExperimental.includes(turma)
                            ? '1px solid var(--bb-brand)'
                            : '1px solid var(--bb-glass-border)',
                          borderRadius: 'var(--bb-radius-sm)',
                          minHeight: '44px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={turmasExperimental.includes(turma)}
                          onChange={() => toggleTurmaExperimental(turma)}
                          className="h-4 w-4 accent-[var(--bb-brand)]"
                        />
                        <span
                          className="text-sm"
                          style={{
                            color: turmasExperimental.includes(turma)
                              ? 'var(--bb-ink-100)'
                              : 'var(--bb-ink-60)',
                          }}
                        >
                          {turma}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Nenhuma turma cadastrada. Cadastre turmas para permitir agendamento experimental.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Action buttons ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'var(--bb-brand)',
              color: '#fff',
              borderRadius: 'var(--bb-radius-sm)',
              boxShadow: 'var(--bb-shadow-md)',
              minHeight: '44px',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={!slug}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all disabled:opacity-50"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-sm)',
              color: 'var(--bb-ink-100)',
              minHeight: '44px',
            }}
          >
            <IconExternalLink size={16} color="var(--bb-ink-60)" />
            Visualizar Site
          </button>
        </div>
      </div>
    </div>
  );
}
