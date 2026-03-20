'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getTermos,
  buscarTermo,
  type TermoArtesMarciais,
} from '@/lib/api/academia-teorica.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';

/* ── Constants ───────────────────────────────────────────────────── */

const MODALITY_CHIPS = [
  { key: '', label: 'Todos' },
  { key: 'bjj', label: 'BJJ' },
  { key: 'judo', label: 'Judo' },
  { key: 'muay-thai', label: 'Muay Thai' },
];

const CATEGORY_CHIPS: { key: string; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'posicao', label: 'Posicao' },
  { key: 'tecnica', label: 'Tecnica' },
  { key: 'comando', label: 'Comando' },
  { key: 'graduacao', label: 'Graduacao' },
  { key: 'competicao', label: 'Competicao' },
  { key: 'etiqueta', label: 'Etiqueta' },
  { key: 'anatomia', label: 'Anatomia' },
];

const LANGUAGE_BADGE: Record<string, { bg: string; text: string }> = {
  japones: { bg: 'var(--bb-brand-surface)', text: 'var(--bb-brand)' },
  tailandes: { bg: 'var(--bb-warning-surface)', text: 'var(--bb-warning)' },
  portugues: { bg: 'var(--bb-success-surface)', text: 'var(--bb-success)' },
  ingles: { bg: 'var(--bb-info-surface)', text: 'var(--bb-info)' },
};

function langStyle(idioma: string) {
  return LANGUAGE_BADGE[idioma] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
}

/* ── Loading Skeleton ────────────────────────────────────────────── */

function GlossarioSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton variant="text" className="h-6 w-56" />
      <Skeleton variant="text" className="h-10 w-full rounded-xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="card" className="h-36" />
        ))}
      </div>
    </div>
  );
}

/* ── Glossary page ───────────────────────────────────────────────── */

export default function GlossarioPage() {
  const [termos, setTermos] = useState<TermoArtesMarciais[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [categoria, setCategoria] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  /* Fetch terms when filters change */
  const fetchTermos = useCallback(async (mod: string, cat: string) => {
    setLoading(true);
    try {
      const data = await getTermos(mod || undefined, cat || undefined);
      setTermos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search) return; // Skip filter fetch when searching
    fetchTermos(modalidade, categoria);
  }, [modalidade, categoria, search, fetchTermos]);

  /* Debounced search */
  const handleSearch = (query: string) => {
    setSearch(query);
    if (searchTimeout) clearTimeout(searchTimeout);

    if (!query.trim()) {
      fetchTermos(modalidade, categoria);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await buscarTermo(query);
        setTermos(data);
      } finally {
        setLoading(false);
      }
    }, 350);
    setSearchTimeout(timeout);
  };

  return (
    <PlanGate module="academia_teorica">
    <div className="space-y-5 p-4 md:p-6 pb-24">
      {/* Back link */}
      <Link
        href="/academia"
        className="inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--bb-brand)' }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Academia
      </Link>

      <PageHeader title="Glossario de Artes Marciais" />

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--bb-ink-40)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar termo..."
          className="w-full py-2.5 pl-10 pr-3 text-sm outline-none"
          style={{
            borderRadius: 'var(--bb-radius-md)',
            border: '1px solid var(--bb-glass-border)',
            backgroundColor: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
          }}
        />
      </div>

      {/* ── Modality chips ────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {MODALITY_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => { setModalidade(chip.key); setSearch(''); }}
            className="flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={{
              borderRadius: 'var(--bb-radius-full)',
              backgroundColor: modalidade === chip.key ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
              color: modalidade === chip.key ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Category chips ────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => { setCategoria(chip.key); setSearch(''); }}
            className="flex-shrink-0 px-3 py-1 text-xs font-medium transition-colors"
            style={{
              borderRadius: 'var(--bb-radius-full)',
              border: `1px solid ${categoria === chip.key ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              backgroundColor: categoria === chip.key ? 'var(--bb-brand-surface)' : 'transparent',
              color: categoria === chip.key ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      {loading ? (
        <GlossarioSkeleton />
      ) : termos.length === 0 ? (
        <EmptyState
          variant="search"
          title="Nenhum termo encontrado"
          description="Tente ajustar a busca ou os filtros."
        />
      ) : (
        <>
          <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
            {termos.length} termo{termos.length !== 1 ? 's' : ''} encontrado{termos.length !== 1 ? 's' : ''}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {termos.map((termo) => {
              const lang = langStyle(termo.idioma);
              return (
                <Card key={termo.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {termo.original}
                    </h3>
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: lang.bg, color: lang.text }}
                    >
                      {termo.idioma}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    {termo.traducao}
                  </p>

                  <p className="mt-0.5 text-xs italic" style={{ color: 'var(--bb-ink-40)' }}>
                    {termo.pronuncia}
                  </p>

                  <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--bb-ink-60)' }}>
                    {termo.descricao}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                    >
                      {termo.modalidade}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                    >
                      {termo.categoria}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
    </PlanGate>
  );
}
