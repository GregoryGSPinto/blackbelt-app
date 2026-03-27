'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isMock } from '@/lib/env';
import { Skeleton } from '@/components/ui/Skeleton';

interface AcademyResult {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  logoUrl: string | null;
  modalities: string[];
}

const MOCK_RESULTS: AcademyResult[] = [
  { id: 'a-1', name: 'Guerreiros do Tatame', slug: 'guerreiros', city: 'Belo Horizonte', state: 'MG', logoUrl: null, modalities: ['BJJ', 'Judo', 'Muay Thai'] },
  { id: 'a-2', name: 'Alliance BH', slug: 'alliance-bh', city: 'Belo Horizonte', state: 'MG', logoUrl: null, modalities: ['BJJ'] },
  { id: 'a-3', name: 'Team Nogueira SP', slug: 'team-nogueira-sp', city: 'Sao Paulo', state: 'SP', logoUrl: null, modalities: ['BJJ', 'MMA', 'Boxing'] },
];

export default function BuscarAcademiaPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<AcademyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      if (isMock()) {
        const q = search.toLowerCase();
        setResults(MOCK_RESULTS.filter((a) => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)));
      } else {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data } = await supabase
          .from('academies')
          .select('id, name, slug, city, state, logo_url, modalities')
          .ilike('name', `%${search}%`)
          .limit(10);
        setResults(
          (data ?? []).map((a: Record<string, unknown>) => ({
            id: a.id as string,
            name: a.name as string,
            slug: a.slug as string,
            city: (a.city as string) ?? '',
            state: (a.state as string) ?? '',
            logoUrl: (a.logo_url as string) ?? null,
            modalities: (a.modalities as string[]) ?? [],
          })),
        );
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 pt-12">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link href="/welcome" className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
            ← Voltar
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Buscar Academia
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Digite o nome ou cidade da academia
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: Guerreiros do Tatame"
            className="h-11 flex-1 rounded-lg px-3 text-sm"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
          />
          <button
            onClick={handleSearch}
            className="rounded-lg px-4 text-sm font-bold"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            Buscar
          </button>
        </div>

        {/* Code input */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--bb-ink-80)' }}>Ou entre por codigo</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Cole o codigo ou link da academia (ex: GUERREIROS2026)
          </p>
          <input
            type="text"
            placeholder="Codigo da academia"
            className="mt-2 h-10 w-full rounded-lg px-3 text-sm"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" className="h-20" />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma academia encontrada</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((academy) => (
              <Link
                key={academy.id}
                href={`/g/${academy.slug}`}
                className="flex items-center gap-3 rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-brand)' }}
                >
                  {academy.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{academy.name}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {academy.city}{academy.state ? `, ${academy.state}` : ''}
                  </p>
                  {academy.modalities.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {academy.modalities.slice(0, 3).map((m) => (
                        <span key={m} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--bb-ink-40)' }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
