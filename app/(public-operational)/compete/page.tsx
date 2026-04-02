'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getTournaments,
  type Tournament,
  type TournamentStatus,
} from '@/lib/api/compete.service';
import {
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  AwardIcon,
  ChevronRightIcon,
  StarIcon,
} from '@/components/shell/icons';

const STATUS_CONFIG: Record<TournamentStatus, { label: string; bg: string; text: string }> = {
  aguardando_aprovacao: { label: 'Aguardando aprovacao', bg: 'rgba(234,179,8,0.1)', text: '#ca8a04' },
  draft: { label: 'Rascunho', bg: 'rgba(156,163,175,0.1)', text: 'var(--bb-ink-40)' },
  published: { label: 'Publicado', bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' },
  registration_open: { label: 'Inscricoes abertas', bg: 'rgba(34,197,94,0.15)', text: '#16a34a' },
  registration_closed: { label: 'Inscricoes encerradas', bg: 'rgba(234,179,8,0.15)', text: '#ca8a04' },
  weigh_in: { label: 'Pesagem', bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
  live: { label: 'Ao vivo', bg: 'rgba(59,130,246,0.15)', text: '#2563eb' },
  completed: { label: 'Finalizado', bg: 'rgba(156,163,175,0.1)', text: 'var(--bb-ink-40)' },
  cancelled: { label: 'Cancelado', bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
};

const MODALITIES = ['BJJ', 'No-Gi', 'Judo', 'MMA', 'Muay Thai'];
const CITIES = ['Sao Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte', 'Salvador', 'Florianopolis'];

export default function CompeteListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { status?: TournamentStatus; modality?: string } = {};
      if (statusFilter) filters.status = statusFilter as TournamentStatus;
      if (modalityFilter) filters.modality = modalityFilter;
      const data = await getTournaments(filters);
      setTournaments(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, modalityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const afterCity = cityFilter
    ? tournaments.filter((t) => t.city.toLowerCase().includes(cityFilter.toLowerCase()))
    : tournaments;

  const filtered = search
    ? afterCity.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.city.toLowerCase().includes(search.toLowerCase())
      )
    : afterCity;

  const featured = filtered.find(
    (t) => t.status === 'registration_open' || t.status === 'live'
  );
  const rest = featured ? filtered.filter((t) => t.id !== featured.id) : filtered;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
        style={{ background: 'var(--bb-brand-gradient)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/90" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <AwardIcon className="h-4 w-4" />
            BlackBelt Compete
          </div>
          <h1 className="text-3xl font-black text-white sm:text-5xl">
            Torneios de Artes Marciais
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Encontre campeonatos, inscreva-se, acompanhe ao vivo e confira resultados.
            Tudo em um so lugar.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div
        className="sticky top-[57px] z-40 border-b px-4 py-3 backdrop-blur-xl sm:px-6"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bb-depth-1) 85%, transparent)',
          borderColor: 'var(--bb-glass-border)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: '200px' }}>
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
            <input
              type="text"
              placeholder="Buscar torneio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <option value="">Status</option>
              <option value="published">Publicado</option>
              <option value="registration_open">Inscricoes abertas</option>
              <option value="registration_closed">Inscricoes encerradas</option>
              <option value="live">Ao vivo</option>
              <option value="completed">Finalizado</option>
            </select>

            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <option value="">Modalidade</option>
              {MODALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="hidden px-3 py-2 text-sm outline-none sm:block"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <option value="">Cidade</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando torneios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <AwardIcon className="mx-auto h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
            <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
              Nenhum torneio encontrado
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Tente ajustar seus filtros ou volte mais tarde
            </p>
          </div>
        ) : (
          <>
            {/* Featured Tournament */}
            {featured && (
              <Link href={`/compete/${featured.slug}`} className="group mb-8 block">
                <div
                  className="relative overflow-hidden p-6 transition-all group-hover:-translate-y-1 sm:p-8"
                  style={{
                    background: 'var(--bb-brand-gradient)',
                    borderRadius: 'var(--bb-radius-lg)',
                    boxShadow: 'var(--bb-shadow-md)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <StarIcon className="h-3 w-3" />
                      Destaque
                    </div>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">{featured.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(featured.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4" />
                        {featured.location} - {featured.city}/{featured.state}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4" />
                        {featured.max_athletes ?? 'Ilimitado'} vagas
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {featured.modalities.map((mod) => (
                        <span key={mod} className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                          {mod}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      Ver detalhes
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Tournament Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((tournament) => {
                const statusCfg = STATUS_CONFIG[tournament.status];
                return (
                  <Link
                    key={tournament.id}
                    href={`/compete/${tournament.slug}`}
                    className="group block overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                      boxShadow: 'var(--bb-shadow-md)',
                    }}
                  >
                    {/* Banner placeholder */}
                    <div
                      className="relative h-36 overflow-hidden"
                      style={{
                        background: tournament.banner_url
                          ? `url(${tournament.banner_url}) center/cover`
                          : 'var(--bb-brand-gradient)',
                      }}
                    >
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="font-bold leading-tight group-hover:underline" style={{ color: 'var(--bb-ink-100)' }}>
                        {tournament.name}
                      </h3>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{tournament.location} - {tournament.city}/{tournament.state}</span>
                        </div>
                      </div>

                      {/* Modalities */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {tournament.modalities.map((mod) => (
                          <span
                            key={mod}
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: 'var(--bb-brand-surface)',
                              color: 'var(--bb-brand)',
                            }}
                          >
                            {mod}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div
                        className="mt-4 flex items-center justify-between border-t pt-3"
                        style={{ borderColor: 'var(--bb-glass-border)' }}
                      >
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          <UsersIcon className="h-3.5 w-3.5" />
                          <span>{tournament.max_athletes ?? 'Ilimitado'} vagas</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          R$ {tournament.registration_fee.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
